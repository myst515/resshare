/**
 * facilityRepository.test.js
 * Integration tests for FacilityRepository, run against the real database.
 * Tests run in sequence (Jest runs tests in a file in order by default),
 * since later tests depend on the facility created in the first test.
 */
const pool = require('../db');
const { addFacility, getFacilityById, getFacilitiesByFloor, updateStatus, removeFacility } = require('./facilityRepository');

// Tracks the id of the facility created during these tests, so afterAll
// knows what to clean up (and so later tests can look it up by id).
let testFacilityId;

// Runs once after all tests. Removes the test facility if it's still around
// (the delete test below may have already removed it) and closes the pool.
afterAll(async () => {
  if (testFacilityId) await pool.query(`DELETE FROM facilities WHERE id = $1`, [testFacilityId]);
  await pool.end();
});

// Confirms a new facility is created with the correct floor number and
// defaults to 'available' status, as required by addFacility's design.
test('addFacility creates a facility with status available', async () => {
  const facility = await addFacility('Jest Washer', 'Washing Machine', 'Test Floor', 9);
  testFacilityId = facility.id;
  expect(facility.status).toBe('available');
  expect(facility.floor_number).toBe(9);
});

// Confirms the facility created above can be retrieved again by its id.
test('getFacilityById retrieves the created facility', async () => {
  const facility = await getFacilityById(testFacilityId);
  expect(facility.name).toBe('Jest Washer');
});

// Confirms floor-based filtering correctly includes the test facility —
// this is the query that will power dashboard filtering by floor.
test('getFacilitiesByFloor returns facilities on that floor', async () => {
  const facilities = await getFacilitiesByFloor(9);
  expect(facilities.some(f => f.id === testFacilityId)).toBe(true);
});

// Confirms updateStatus actually persists the new status to the database,
// by updating it then reading it back and checking the change stuck.
test('updateStatus changes the facility status', async () => {
  await updateStatus(testFacilityId, 'in_use');
  const facility = await getFacilityById(testFacilityId);
  expect(facility.status).toBe('in_use');
});

// Confirms removeFacility actually deletes the row — checked by trying to
// fetch it afterward and expecting null. Also clears testFacilityId so
// afterAll doesn't try to delete an already-deleted row.
test('removeFacility deletes the facility', async () => {
  await removeFacility(testFacilityId);
  const facility = await getFacilityById(testFacilityId);
  expect(facility).toBeNull();
  testFacilityId = null; // already removed, skip cleanup in afterAll
});