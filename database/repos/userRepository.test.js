/**
 * userRepository.test.js
 * Integration tests for UserRepository — these run against the real local
 * resshare database (not a mock), so they prove the actual SQL queries work,
 * not just the JavaScript logic around them.
 * Every test user has an email starting with 'jest-user-' so they can all be
 * cleaned up together before and after the run.
 */
const pool = require('../db');
const { createUser, findByEmail, verifyCredentials, updateRole } = require('./userRepository');

// Deletes every test user left behind by this file (current or previous run).
async function cleanup() {
  await pool.query(`DELETE FROM users WHERE email LIKE 'jest-user-%@example.com'`);
}

// Runs once before any test in this file, so tests start from a clean state.
beforeAll(cleanup);

// Runs once after all tests finish. Cleans up and closes the connection pool
// so Jest can exit instead of hanging on an open database connection.
afterAll(async () => {
  await cleanup();
  await pool.end();
});

// ---------------------------------------------------------------- createUser

// Confirms a user can be created with the default role and that the returned
// object does not expose the password hash.
test('createUser creates a resident by default and does not return the hash', async () => {
  const user = await createUser('Jest Test', 'jest-user-1@example.com', 'password123');
  expect(user.email).toBe('jest-user-1@example.com');
  expect(user.role).toBe('resident');
  expect(user.password_hash).toBeUndefined();
});

// Confirms the plain-text password is never stored: the value in the
// database must be a bcrypt hash, not the password itself.
test('createUser stores a hashed password, not the plain text', async () => {
  await createUser('Jest Hash', 'jest-user-2@example.com', 'password123');
  const stored = await findByEmail('jest-user-2@example.com');
  expect(stored.password_hash).not.toBe('password123');
  expect(stored.password_hash.startsWith('$2b$')).toBe(true);
});

// Confirms the optional role and floor number arguments are saved.
test('createUser saves an admin role and floor number when provided', async () => {
  const user = await createUser('Jest Admin', 'jest-user-3@example.com', 'password123', 'admin', 4);
  expect(user.role).toBe('admin');
  expect(user.floor_number).toBe(4);
});

// Confirms two accounts cannot share an email (the unique constraint).
test('createUser rejects an email that is already registered', async () => {
  await createUser('Jest Dup', 'jest-user-4@example.com', 'password123');
  await expect(createUser('Jest Dup 2', 'jest-user-4@example.com', 'password456'))
    .rejects.toMatchObject({ code: '23505' });
});

// Confirms a role other than 'resident' or 'admin' is refused by the database.
test('createUser rejects an invalid role', async () => {
  await expect(createUser('Jest Role', 'jest-user-5@example.com', 'password123', 'superuser'))
    .rejects.toMatchObject({ code: '23514' });
});

// Confirms a user cannot be created without a name (NOT NULL column).
test('createUser rejects a missing name', async () => {
  await expect(createUser(null, 'jest-user-6@example.com', 'password123'))
    .rejects.toMatchObject({ code: '23502' });
});

// Confirms a user cannot be created without a password.
test('createUser rejects a missing password', async () => {
  await expect(createUser('Jest NoPass', 'jest-user-7@example.com', undefined)).rejects.toThrow();
  expect(await findByEmail('jest-user-7@example.com')).toBeNull();
});

// --------------------------------------------------------------- findByEmail

// Confirms the user created above can be found again by email.
test('findByEmail returns the created user', async () => {
  const user = await findByEmail('jest-user-1@example.com');
  expect(user).not.toBeNull();
  expect(user.name).toBe('Jest Test');
});

// Confirms looking up an email that was never created returns null instead
// of throwing an error or returning incorrect data.
test('findByEmail returns null for a non-existent email', async () => {
  const user = await findByEmail('jest-user-does-not-exist@example.com');
  expect(user).toBeNull();
});

// Confirms an empty email finds nothing.
test('findByEmail returns null for an empty email', async () => {
  expect(await findByEmail('')).toBeNull();
});

// Confirms a SQL-injection style input is treated as plain text (because the
// query is parameterised) and simply matches nobody.
test('findByEmail treats a SQL injection string as plain text', async () => {
  expect(await findByEmail("' OR '1'='1")).toBeNull();
});

// --------------------------------------------------------- verifyCredentials

// Confirms the full login path succeeds with the correct password and that
// the returned user does not include the password hash.
test('verifyCredentials succeeds with the correct password and hides the hash', async () => {
  const user = await verifyCredentials('jest-user-1@example.com', 'password123');
  expect(user).not.toBeNull();
  expect(user.email).toBe('jest-user-1@example.com');
  expect(user.role).toBe('resident');
  expect(user.password_hash).toBeUndefined();
});

// Confirms an incorrect password is rejected rather than granting access.
test('verifyCredentials fails with the wrong password', async () => {
  expect(await verifyCredentials('jest-user-1@example.com', 'wrongpassword')).toBeNull();
});

// Confirms a login attempt for an email that has no account fails cleanly.
test('verifyCredentials fails for an unknown email', async () => {
  expect(await verifyCredentials('jest-user-nobody@example.com', 'password123')).toBeNull();
});

// Confirms leaving the password blank never logs anyone in.
test('verifyCredentials fails with an empty password', async () => {
  expect(await verifyCredentials('jest-user-1@example.com', '')).toBeNull();
});

// Confirms passwords are case-sensitive at login.
test('verifyCredentials fails when only the password case differs', async () => {
  expect(await verifyCredentials('jest-user-1@example.com', 'PASSWORD123')).toBeNull();
});

// ---------------------------------------------------------------- updateRole

// Confirms a resident can be promoted to admin and back, and the change is
// really saved in the database.
test('updateRole changes a user role and the change is saved', async () => {
  const user = await createUser('Jest Role Change', 'jest-user-8@example.com', 'password123');
  await updateRole(user.id, 'admin');
  expect((await findByEmail('jest-user-8@example.com')).role).toBe('admin');
  await updateRole(user.id, 'resident');
  expect((await findByEmail('jest-user-8@example.com')).role).toBe('resident');
});

// Confirms an invalid role is refused and the user's existing role is kept.
test('updateRole rejects an invalid role and leaves the role unchanged', async () => {
  const user = await createUser('Jest Bad Role', 'jest-user-9@example.com', 'password123');
  await expect(updateRole(user.id, 'god')).rejects.toMatchObject({ code: '23514' });
  expect((await findByEmail('jest-user-9@example.com')).role).toBe('resident');
});

// Confirms updating a user id that does not exist neither crashes nor
// changes any other user.
test('updateRole does nothing for a user id that does not exist', async () => {
  await expect(updateRole(999999999, 'admin')).resolves.toBeUndefined();
  expect((await findByEmail('jest-user-1@example.com')).role).toBe('resident');
});
