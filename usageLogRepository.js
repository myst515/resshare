const pool = require('../db');

async function insertLog(sessionId, facilityId, userId, startTime, endTime, releaseType) {
  const result = await pool.query(
    `INSERT INTO usage_logs (session_id, facility_id, user_id, start_time, end_time, release_type)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [sessionId, facilityId, userId, startTime, endTime, releaseType]
  );
  return result.rows[0];
}

async function getLogsByFacility(facilityId, from, to) {
  const result = await pool.query(
    `SELECT * FROM usage_logs
     WHERE facility_id = $1 AND start_time BETWEEN $2 AND $3
     ORDER BY start_time DESC`,
    [facilityId, from, to]
  );
  return result.rows;
}

async function getUsageTrends(facilityId) {
  const result = await pool.query(
    `SELECT DATE(start_time) AS day, COUNT(*) AS sessions
     FROM usage_logs WHERE facility_id = $1
     GROUP BY day ORDER BY day`,
    [facilityId]
  );
  return result.rows;
}

module.exports = { insertLog, getLogsByFacility, getUsageTrends };