const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'TshepisoBeautyMabelane37@', // move this to an env var before pushing to shared repo
  database: 'resshare',
});

module.exports = pool;