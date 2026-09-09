class User {
  constructor(id, email, passwordHash, role, createdAt) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role; // 'RESIDENT' or 'ADMINISTRATOR'
    this.createdAt = createdAt;
  }
}

module.exports = User;