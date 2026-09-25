/**
 * passwordHasher.test.js
 * Unit tests for the PasswordHasher module. These tests run in complete
 * isolation from the database, since hashing is pure application logic.
 */
const passwordHasher = require('./passwordHasher');

// Confirms hashing actually transforms the input rather than returning it
// unchanged, and that the output looks like a genuine bcrypt hash (bcrypt
// hashes always start with a version prefix such as '$2b$').
test('hash produces a bcrypt-style hash string, not the plain password', async () => {
  const hash = await passwordHasher.hash('mypassword');
  expect(hash).not.toBe('mypassword');
  expect(hash.startsWith('$2b$')).toBe(true);
});

// Confirms the correct password successfully verifies against its own hash —
// this is the "successful login" path.
test('verify returns true for the correct password', async () => {
  const hash = await passwordHasher.hash('mypassword');
  const result = await passwordHasher.verify('mypassword', hash);
  expect(result).toBe(true);
});

// Confirms an incorrect password is correctly rejected — this is the
// "failed login" path, and is just as important to test as the success case.
test('verify returns false for the wrong password', async () => {
  const hash = await passwordHasher.hash('mypassword');
  const result = await passwordHasher.verify('wrongpassword', hash);
  expect(result).toBe(false);
});