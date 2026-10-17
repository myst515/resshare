/**
 * announcementRepository.js
 *
 * Handles database operations for the announcements table in PostgreSQL:
 * creating broadcasts, retrieving all broadcasts, retrieving per-floor notices,
 * and deleting broadcasts.
 */

const pool = require('../db');

/**
 * Creates and stores a new announcement in PostgreSQL.
 *
 * @param {string} title - Title or subject of the announcement.
 * @param {string} body - The descriptive announcement message.
 * @param {number|null} [floorNumber=null] - Target floor, or NULL for building-wide broadcast.
 * @returns {Promise<object>} The newly created announcement record.
 */
async function createAnnouncement(title, body, floorNumber = null) {
  const result = await pool.query(
    `INSERT INTO announcements (title, body, floor_number)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [title, body, floorNumber]
  );
  return result.rows[0];
}

/**
 * Retrieves all announcements ordered from newest to oldest.
 * Primarily used by the administrator dashboard.
 *
 * @returns {Promise<object[]>} Array of announcement objects.
 */
async function getAllAnnouncements() {
  const result = await pool.query(
    `SELECT * FROM announcements ORDER BY created_at DESC`
  );
  return result.rows;
}

/**
 * Retrieves announcements relevant to a specific floor.
 * Includes broadcasts explicitly matching the given floor number
 * as well as general notices where floor_number IS NULL.
 *
 * @param {number} floorNumber - The resident's floor.
 * @returns {Promise<object[]>} Array of targeted announcements.
 */
async function getAnnouncementsByFloor(floorNumber) {
  const result = await pool.query(
    `SELECT * FROM announcements 
     WHERE floor_number = $1 OR floor_number IS NULL
     ORDER BY created_at DESC`,
    [floorNumber]
  );
  return result.rows;
}

/**
 * Deletes an announcement by its unique database ID.
 *
 * @param {number} id - Announcement ID.
 * @returns {Promise<void>}
 */
async function deleteAnnouncement(id) {
  await pool.query(`DELETE FROM announcements WHERE id = $1`, [id]);
}

/**
 * Updates an existing announcement's title, body, and floor target in PostgreSQL.
 */
async function updateAnnouncement(id, title, body, floorNumber = null) {
  const result = await pool.query(
    `UPDATE announcements
     SET title = $1, body = $2, floor_number = $3
     WHERE id = $4
     RETURNING *`,
    [title, body, floorNumber, id]
  );
  return result.rows[0];
}

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementsByFloor,
  deleteAnnouncement,
  updateAnnouncement
};