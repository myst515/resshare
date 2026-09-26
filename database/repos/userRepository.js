/**
 * userRepository.js
 *
 * Handles all database operations for the users table:
 * creating users, looking users up, verifying login credentials,
 * and updating user roles.
 */

const pool = require('../db');
const passwordHasher = require('../passwordHasher');


/**
 * Creates a new user in the database.
 *
 * The password is hashed before it is stored.
 *
 * @param {string} name - User's name.
 * @param {string} email - User's email address.
 * @param {string} password - Plain-text password supplied during registration.
 * @param {string} role - User role, normally 'resident' or 'admin'.
 * @param {number|null} floorNumber - Floor associated with the user.
 * @returns {Object} The newly created user.
 */
async function createUser(
    name,
    email,
    password,
    role = 'resident',
    floorNumber = null
) {

    // Hash the password before storing it in PostgreSQL.
    const passwordHash =
        await passwordHasher.hash(password);

    const result = await pool.query(
        `INSERT INTO users
        (name, email, password_hash, role, floor_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role, floor_number`,
        [
            name,
            email,
            passwordHash,
            role,
            floorNumber
        ]
    );

    return result.rows[0];
}


/**
 * Finds a user using their email address.
 *
 * This is used during login to retrieve the user's
 * stored password hash and account information.
 *
 * @param {string} email - Email address to search for.
 * @returns {Object|null} User record or null if not found.
 */
async function findByEmail(email) {

    const result = await pool.query(
        `SELECT *
         FROM users
         WHERE email = $1`,
        [email]
    );

    return result.rows[0] || null;
}


/**
 * Finds a user using their database ID.
 *
 * This is used when validating a JWT. The JWT contains
 * the user's ID, which is then used to retrieve the
 * current user from PostgreSQL.
 *
 * @param {number} id - User database ID.
 * @returns {Object|null} User record or null if not found.
 */
async function findById(id) {

    const result = await pool.query(
        `SELECT *
         FROM users
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}


/**
 * Verifies a user's login credentials.
 *
 * The user is first retrieved using their email.
 * The supplied password is then compared against
 * the stored password hash.
 *
 * @param {string} email - User's email address.
 * @param {string} password - Password supplied during login.
 * @returns {Object|null} User if credentials are valid, otherwise null.
 */
async function verifyCredentials(email, password) {

    const user = await findByEmail(email);

    // No user with this email exists.
    if (!user) {
        return null;
    }

    // Compare the supplied password with the stored hash.
    const match =
        await passwordHasher.verify(
            password,
            user.password_hash
        );

    return match ? user : null;
}


/**
 * Updates a user's role.
 *
 * @param {number} userId - ID of the user.
 * @param {string} role - New role.
 */
async function updateRole(userId, role) {

    await pool.query(
        `UPDATE users
         SET role = $1
         WHERE id = $2`,
        [role, userId]
    );
}


/**
 * Export all repository functions so that services
 * such as AuthService can communicate with PostgreSQL.
 */
module.exports = {
    createUser,
    findByEmail,
    findById,
    verifyCredentials,
    updateRole
};