/**
 * userRepository.js
 * Handles all database operations for the users table:
 * creating users, looking them up, and verifying login credentials.
 */
const pool = require('../db');
const passwordHasher = require('../passwordHasher');

/**
 * Creates a new user with a hashed password.
 * @param {string} name
 * @param {string} email
 * @param {string} password - plain-text password, will be hashed before storing
 * @param {string} [role='resident'] - 'resident' or 'admin'
 * @param {number|null} [floorNumber=null] - which floor the user lives on
 * @returns {Promise<object>} the created user (excluding password_hash)
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
 * Looks up a user by email.
 * @param {string} email
 * @returns {Promise<object|null>} the full user row (including password_hash), or null if not found
 */
async function findByEmail(email) {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0] || null;
}

/**
 * Verifies a login attempt against the stored password hash.
 * @param {string} email
 * @param {string} password - plain-text password supplied at login
 * @returns {Promise<object|null>} the user row if credentials match, otherwise null
 */
async function verifyCredentials(email, password) {
  const user = await findByEmail(email);
  if (!user) return null;
  const match = await passwordHasher.verify(password, user.password_hash);
  return match ? user : null;
}

/**
 * Updates a user's role (e.g. promoting a resident to admin).
 * @param {number} userId
 * @param {string} role
 * @returns {Promise<void>}
 */
async function updateRole(userId, role) {
  await pool.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, userId]);
}

module.exports = { createUser, findByEmail, verifyCredentials, updateRole };