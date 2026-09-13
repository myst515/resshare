/**
 * usageLogRepository.js
 * Handles all database operations for the usage_logs table:
 * recording completed usage sessions and querying usage history/trends.
 */
const pool = require('../db');

/**
 * Records a usage session.
 * @param {number} sessionId
 * @param {number} facilityId
 * @param {number} userId
 * @param {Date} startTime
 * @param {Date} endTime
 * @param {'manual'|'automatic'} releaseType
 * @returns {Promise<object>} the created log entry
 */
async function insertLog(sessionId, facilityId, userId, startTime, endTime, releaseType) {
  const result = await pool.query(
    `INSERT INTO usage_logs (session_id, facility_id, user_id, start_time, end_time, release_type)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [sessionId, facilityId, userId, startTime, endTime, releaseType]
  );
  return result.rows[0];
}

/**
 * Retrieves usage logs for a facility within a date range.
 * @param {number} facilityId
 * @param {Date} from
 * @param {Date} to
 * @returns {Promise<object[]>} matching log entries, most recent first
 */
async function getLogsByFacility(facilityId, from, to) {
  const result = await pool.query(
    `SELECT * FROM usage_logs
     WHERE facility_id = $1 AND start_time BETWEEN $2 AND $3
     ORDER BY start_time DESC`,
    [facilityId, from, to]
  );
  return result.rows;
}

/**
 * Aggregates daily session counts for a facility (local SAST time),
 * used to identify peak usage times.
 * @param {number} facilityId
 * @returns {Promise<object[]>} array of { day, sessions } rows
 */
async function getUsageTrends(facilityId) {
  const result = await pool.query(
    `SELECT DATE(start_time AT TIME ZONE 'Africa/Johannesburg') AS day, COUNT(*) AS sessions
     FROM usage_logs WHERE facility_id = $1
     GROUP BY day ORDER BY day`,
    [facilityId]
  );
  return result.rows;
}

module.exports = { insertLog, getLogsByFacility, getUsageTrends };