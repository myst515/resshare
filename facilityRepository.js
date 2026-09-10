const pool = require('../db');

async function getAllFacilities() {
  const result = await pool.query(`SELECT * FROM facilities ORDER BY id ASC`);
  return result.rows;
}

async function getFacilityById(id) {
  const result = await pool.query(`SELECT * FROM facilities WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function getFacilitiesByFloor(floorNumber) {
  const result = await pool.query(
    `SELECT * FROM facilities WHERE floor_number = $1 ORDER BY id ASC`,
    [floorNumber]
  );
  return result.rows;
}

async function updateStatus(id, status) {
  await pool.query(
    `UPDATE facilities SET status = $1, last_confirmed = NOW() WHERE id = $2`,
    [status, id]
  );
}

async function addFacility(name, type, location, floorNumber) {
  const result = await pool.query(
    `INSERT INTO facilities (name, type, location, floor_number, status)
     VALUES ($1, $2, $3, $4, 'available') RETURNING *`,
    [name, type, location, floorNumber]
  );
  return result.rows[0];
}

async function removeFacility(id) {
  await pool.query(`DELETE FROM facilities WHERE id = $1`, [id]);
}

module.exports = {
  getAllFacilities,
  getFacilityById,
  getFacilitiesByFloor,
  updateStatus,
  addFacility,
  removeFacility
};