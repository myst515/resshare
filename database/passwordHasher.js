/**
 * passwordHasher.js
 * Wraps bcrypt so password hashing/verification logic is centralised
 * in one module, matching the PasswordHasher class in the UML design.
 */
const bcrypt = require('bcrypt');

/**
 * Hashes a plain-text password.
 * @param {string} password - the plain-text password to hash
 * @returns {Promise<string>} the resulting bcrypt hash
 */
async function hash(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Compares a plain-text password against a stored bcrypt hash.
 * @param {string} password - the plain-text password to check
 * @param {string} hash - the stored bcrypt hash to compare against
 * @returns {Promise<boolean>} true if they match, false otherwise
 */
async function verify(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { hash, verify };