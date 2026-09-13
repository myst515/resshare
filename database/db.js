/**
 * db.js
 * Creates and exports a single shared PostgreSQL connection pool
 * used by all repository modules to query the resshare database.
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'YOUR_PASSWORD_HERE', // TODO: move to environment variable before final submission
  database: 'resshare',
});

module.exports = pool;