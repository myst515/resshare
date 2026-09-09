const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Temporary in-memory store (replace with PostgreSQL calls later)
const users = [];
let nextId = 1;

class AuthService {
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

  isAdmin(token) {
    const user = this.validateToken(token);
    return user.role === 'ADMINISTRATOR';
  }
}

module.exports = new AuthService();