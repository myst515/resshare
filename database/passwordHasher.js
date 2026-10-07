/**
 * passwordHasher.js
 * Handles password hashing and checking using bcrypt. Passwords are never
 * stored in plain text: they are hashed before being saved, and login works
 * by comparing what the user typed against the stored hash.
 */
const bcrypt = require('bcrypt');

/**
 * Hashes a plain-text password with bcrypt (cost factor 10). bcrypt adds a
 * random salt each time, so hashing the same password twice gives different
 * strings.
 * @param {string} password the plain-text password
 * @returns {Promise<string>} a 60-character bcrypt hash
 */
async function hash(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Checks a plain-text password against a stored bcrypt hash.
 * @param {string} password the plain-text password the user typed
 * @param {string} hash the stored hash to compare against
 * @returns {Promise<boolean>} true if the password matches the hash
 */
async function verify(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { hash, verify };
