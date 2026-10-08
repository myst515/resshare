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

// Confirms the hash is exactly 60 characters, so it always fits in the
// password_hash VARCHAR(255) column of the users table.
test('hash is 60 characters long and fits the password_hash column', async () => {
  const hash = await passwordHasher.hash('mypassword');
  expect(hash).toHaveLength(60);
});

// Confirms bcrypt salts every hash: hashing the same password twice must
// give two different strings, so identical passwords are not identifiable.
test('hashing the same password twice gives different hashes', async () => {
  const first = await passwordHasher.hash('mypassword');
  const second = await passwordHasher.hash('mypassword');
  expect(first).not.toBe(second);
});

// Confirms both salted hashes of the same password still verify correctly.
test('both hashes of the same password verify against that password', async () => {
  const first = await passwordHasher.hash('mypassword');
  const second = await passwordHasher.hash('mypassword');
  expect(await passwordHasher.verify('mypassword', first)).toBe(true);
  expect(await passwordHasher.verify('mypassword', second)).toBe(true);
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

// Confirms passwords are case-sensitive, so "MyPassword" cannot be used to
// log in to an account whose password is "mypassword".
test('verify returns false when only the letter case differs', async () => {
  const hash = await passwordHasher.hash('mypassword');
  expect(await passwordHasher.verify('MYPASSWORD', hash)).toBe(false);
});

// Confirms an empty password never matches a real hash (edge case: a user
// submitting the login form with the password box left blank).
test('verify returns false for an empty password', async () => {
  const hash = await passwordHasher.hash('mypassword');
  expect(await passwordHasher.verify('', hash)).toBe(false);
});

// Confirms passwords containing spaces, symbols and non-English characters
// hash and verify correctly.
test('passwords with special and unicode characters round-trip correctly', async () => {
  const password = 'P@ss w0rd! #ñü€';
  const hash = await passwordHasher.hash(password);
  expect(await passwordHasher.verify(password, hash)).toBe(true);
});

// Confirms a corrupted or non-bcrypt stored value is treated as "no match"
// rather than crashing or accidentally letting someone in.
test('verify returns false when the stored hash is not a valid bcrypt hash', async () => {
  expect(await passwordHasher.verify('mypassword', 'not-a-real-hash')).toBe(false);
});

// Confirms hashing refuses to run when no password is supplied, instead of
// silently storing a hash of nothing.
test('hash rejects when no password is given', async () => {
  await expect(passwordHasher.hash(undefined)).rejects.toThrow();
});
