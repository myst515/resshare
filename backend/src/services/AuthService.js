require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Temporary in-memory store (replace with PostgreSQL calls later)
const users = [];
let nextId = 1;

/**
 * AuthService handles user registration, login, and token-based
 * authentication/authorization for the ResShare backend.
 */
class AuthService {
  /**
   * Registers a new user.
   * @param {string} email - The user's email address (must be unique).
   * @param {string} password - The user's plaintext password (will be hashed).
   * @param {string} [role='RESIDENT'] - The user's role ('RESIDENT' or 'ADMINISTRATOR').
   * @returns {Promise<User>} The newly created User object.
   * @throws {Error} If the email is already registered.
   */
  async register(email, password, role = 'RESIDENT') {
    const existing = users.find(u => u.email === email);
    if (existing) {
      throw new Error('DuplicateEmailError: email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User(nextId++, email, passwordHash, role, new Date());
    users.push(user);

    return user;
  }

  /**
   * Logs a user in by verifying their credentials and issuing a JWT.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's plaintext password.
   * @returns {Promise<{token: string, user: User}>} The signed JWT and matching user.
   * @throws {Error} If the email is not found or the password is incorrect.
   */
  async login(email, password) {
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('UserNotFoundError: no account with that email');
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new Error('InvalidCredentialsError: incorrect password');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return { token, user };
  }

  /**
   * Validates a JWT and returns the associated user.
   * @param {string} token - The JWT to validate.
   * @returns {User} The user associated with the token.
   * @throws {Error} If the token is invalid, expired, or the user no longer exists.
   */
  validateToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.find(u => u.id === decoded.userId);
      if (!user) {
        throw new Error('UserNotFoundError: token user no longer exists');
      }
      return user;
    } catch (err) {
      throw new Error('TokenInvalidError: ' + err.message);
    }
  }

  /**
   * Checks whether the user associated with a token has administrator privileges.
   * @param {string} token - The JWT to check.
   * @returns {boolean} True if the user's role is 'ADMINISTRATOR', false otherwise.
   */
  isAdmin(token) {
    const user = this.validateToken(token);
    return user.role === 'ADMINISTRATOR';
  }
}

module.exports = new AuthService();