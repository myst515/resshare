/**
 * db.js
 * Creates and exports a PostgreSQL connection pool configured
 * for both local and Supabase cloud database environments.
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Required by Supabase for secure cloud connections
    rejectUnauthorized: false
  }
});

module.exports = pool;