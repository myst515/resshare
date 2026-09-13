/**
 * userRepository.test.js
 * Integration tests for UserRepository — these run against the real local
 * resshare database (not a mock), so they prove the actual SQL queries work,
 * not just the JavaScript logic around them.
 */
const pool = require('../db');
const { createUser, findByEmail, verifyCredentials } = require('./userRepository');

// Runs once before any test in this file. Deletes any leftover test user
// from a previous run so tests start from a clean, predictable state.
beforeAll(async () => {
  await pool.query(`DELETE FROM users WHERE email = 'jest-test@example.com'`);
});

// Runs once after all tests finish. Cleans up the test user so it doesn't
// pollute the database, and closes the connection pool so Jest can exit
// cleanly instead of hanging on an open database connection.
afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email = 'jest-test@example.com'`);
  await pool.end();
});

// Confirms a user can be created and the returned object has the expected
// fields — proves the INSERT query and password hashing both worked.
test('createUser creates a user with a hashed password', async () => {
  const user = await createUser('Jest Test', 'jest-test@example.com', 'password123');
  expect(user.email).toBe('jest-test@example.com');
  expect(user.role).toBe('resident');
});

// Confirms the user created above can actually be found again by email —
// proves the SELECT query correctly matches on email.
test('findByEmail returns the created user', async () => {
  const user = await findByEmail('jest-test@example.com');
  expect(user).not.toBeNull();
  expect(user.name).toBe('Jest Test');
});

// Confirms looking up an email that was never created correctly returns
// null instead of throwing an error or returning incorrect data.
test('findByEmail returns null for a non-existent email', async () => {
  const user = await findByEmail('does-not-exist@example.com');
  expect(user).toBeNull();
});

// Confirms the full login path succeeds when given the correct password —
// this exercises findByEmail + passwordHasher.verify together.
test('verifyCredentials succeeds with the correct password', async () => {
  const user = await verifyCredentials('jest-test@example.com', 'password123');
  expect(user).not.toBeNull();
});

// Confirms the login path correctly rejects an incorrect password rather
// than granting access — critical for security, not just correctness.
test('verifyCredentials fails with the wrong password', async () => {
  const user = await verifyCredentials('jest-test@example.com', 'wrongpassword');
  expect(user).toBeNull();
});