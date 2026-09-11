const pool = require('../db');
const passwordHasher = require('../passwordHasher');

async function createUser(name, email, password, role = 'resident', floorNumber = null) {
  const passwordHash = await passwordHasher.hash(password);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, floor_number)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, floor_number`,
    [name, email, passwordHash, role, floorNumber]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0] || null;
}

async function verifyCredentials(email, password) {
  const user = await findByEmail(email);
  if (!user) return null;
  const match = await passwordHasher.verify(password, user.password_hash);
  return match ? user : null;
}

async function updateRole(userId, role) {
  await pool.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, userId]);
}

module.exports = { createUser, findByEmail, verifyCredentials, updateRole };