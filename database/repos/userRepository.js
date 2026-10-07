/**
 * userRepository.js
 * Handles all database operations for the users table: creating accounts,
 * finding users by email, checking login credentials, and changing roles.
 */
const pool = require('../db');
const passwordHasher = require('../passwordHasher');

/**
 * Creates a new user. The password is hashed before it is saved, and the
 * hash is never returned. Rejects if the email is already registered or the
 * role is not 'resident' or 'admin'.
 * @param {string} name
 * @param {string} email must be unique
 * @param {string} password plain-text password (hashed before storage)
 * @param {'resident'|'admin'} [role='resident']
 * @param {number|null} [floorNumber=null]
 * @returns {Promise<object>} the created user (id, name, email, role, floor_number)
 */
async function createUser(name, email, password, role = 'resident', floorNumber = null) {
  const passwordHash = await passwordHasher.hash(password);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, floor_number)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, floor_number`,
    [name, email, passwordHash, role, floorNumber]
  );
  return result.rows[0];
}

/**
 * Looks up a user by email. Includes password_hash because verifyCredentials
 * needs it, so do not send this result to the front end.
 * @param {string} email
 * @returns {Promise<object|null>} the full user row, or null if not found
 */
async function findByEmail(email) {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0] || null;
}

/**
 * The login check: finds the user by email, then compares the typed password
 * against the stored hash.
 * @param {string} email
 * @param {string} password plain-text password the user typed
 * @returns {Promise<object|null>} the user WITHOUT password_hash if the
 *   credentials are correct, otherwise null (unknown email or wrong password)
 */
async function verifyCredentials(email, password) {
  const user = await findByEmail(email);
  if (!user) return null;
  const match = await passwordHasher.verify(password, user.password_hash);
  if (!match) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

/**
 * Changes a user's role. Rejects if the role is not 'resident' or 'admin'.
 * Does nothing if the user id does not exist.
 * @param {number} userId
 * @param {'resident'|'admin'} role
 * @returns {Promise<void>}
 */
async function updateRole(userId, role) {
  await pool.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, userId]);
}

module.exports = { createUser, findByEmail, verifyCredentials, updateRole };
