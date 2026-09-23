/**
 * facilityRepository.js
 * Handles all database operations for the facilities table:
 * creating, reading, updating status, and filtering by floor.
 */
const pool = require('../db');

/** @returns {Promise<object[]>} every facility, ordered by id */
async function getAllFacilities() {
  const result = await pool.query(`SELECT * FROM facilities ORDER BY id ASC`);
  return result.rows;
}

/**
 * @param {number} id
 * @returns {Promise<object|null>} the facility, or null if not found
 */
async function getFacilityById(id) {
  const result = await pool.query(`SELECT * FROM facilities WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

/**
 * @param {number} floorNumber
 * @returns {Promise<object[]>} all facilities on the given floor
 */
async function getFacilitiesByFloor(floorNumber) {
  const result = await pool.query(
    `SELECT * FROM facilities WHERE floor_number = $1 ORDER BY id ASC`,
    [floorNumber]
  );
  return result.rows;
}

/**
 * Updates a facility's status and refreshes its last_confirmed timestamp.
 * @param {number} id
 * @param {'available'|'in_use'|'suspended'} status
 * @returns {Promise<void>}
 */
async function updateStatus(id, status) {
  await pool.query(
    `UPDATE facilities SET status = $1, last_confirmed = NOW() WHERE id = $2`,
    [status, id]
  );
}

/**
 * Creates a new facility, defaulting its status to 'available'.
 * @param {string} name
 * @param {string} type
 * @param {string} location
 * @param {number} floorNumber
 * @returns {Promise<object>} the created facility
 */
async function addFacility(name, type, location, floorNumber) {
  const result = await pool.query(
    `INSERT INTO facilities (name, type, location, floor_number, status)
     VALUES ($1, $2, $3, $4, 'available') RETURNING *`,
    [name, type, location, floorNumber]
  );
  return result.rows[0];
}

/**
 * @param {number} id
 * @returns {Promise<void>}
 */
async function removeFacility(id) {
  await pool.query(`DELETE FROM facilities WHERE id = $1`, [id]);
}

/**
 * Checks whether a facility currently exists and is available for use.
 * @param {number} id
 * @returns {Promise<boolean>} true if the facility exists and its status is 'available'
 */
async function isAvailable(id) {
  const result = await pool.query(`SELECT status FROM facilities WHERE id = $1`, [id]);
  if (result.rows.length === 0) return false;
  return result.rows[0].status === 'available';
}

module.exports = {
  getAllFacilities,
  getFacilityById,
  getFacilitiesByFloor,
  updateStatus,
  addFacility,
  removeFacility,
  isAvailable
};