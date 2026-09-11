const bcrypt = require('bcrypt');

async function hash(password) {
  return bcrypt.hash(password, 10);
}

async function verify(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { hash, verify };