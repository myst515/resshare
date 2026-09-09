/**
 * Represents a registered user of the ResShare system.
 */
class User {
  /**
   * @param {number} id - Unique identifier for the user.
   * @param {string} email - The user's email address.
   * @param {string} passwordHash - The bcrypt-hashed password (never store plaintext).
   * @param {string} role - The user's role ('RESIDENT' or 'ADMINISTRATOR').
   * @param {Date} createdAt - Timestamp of when the account was created.
   */
  constructor(id, email, passwordHash, role, createdAt) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = createdAt;
  }
}

module.exports = User;