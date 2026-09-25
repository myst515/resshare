/**
 * usageLogRepository.test.js
 * Integration tests for UsageLogRepository. These tests need a real user
 * and facility to attach log entries to, so beforeAll creates both first.
 */
const pool = require('../db');
const { insertLog, getLogsByFacility, getUsageTrends } = require('./usageLogRepository');
const { createUser } = require('./userRepository');
const { addFacility } = require('./facilityRepository');

// Shared test data used across all tests in this file.
let user, facility;

// Runs once before any test. Creates one user and one facility so the
// usage log tests have real, valid foreign keys to reference.
beforeAll(async () => {
  user = await createUser('Jest Log User', 'jest-log@example.com', 'password123');
  facility = await addFacility('Jest Log Washer', 'Washing Machine', 'Test Floor', 9);
});

// Runs once after all tests. Deletes the log, facility, and user created
// during this test run (in that order, to respect foreign key constraints)
// and closes the connection pool.
afterAll(async () => {
  await pool.query(`DELETE FROM usage_logs WHERE facility_id = $1`, [facility.id]);
  await pool.query(`DELETE FROM facilities WHERE id = $1`, [facility.id]);
  await pool.query(`DELETE FROM users WHERE id = $1`, [user.id]);
  await pool.end();
});

// Confirms a usage log can be created and is correctly linked to the
// right facility and user via their ids.
test('insertLog creates a usage log entry', async () => {
  const start = new Date();
  const end = new Date(start.getTime() + 45 * 60000);
  const log = await insertLog(1, facility.id, user.id, start, end, 'manual');
  expect(log.facility_id).toBe(facility.id);
  expect(log.user_id).toBe(user.id);
});

// Confirms getLogsByFacility correctly retrieves logs that fall within a
// given date range — here, a window wide enough to include the log
// created in the previous test.
test('getLogsByFacility retrieves logs within a date range', async () => {
  const from = new Date(Date.now() - 60 * 60000);
  const to = new Date(Date.now() + 60 * 60000);
  const logs = await getLogsByFacility(facility.id, from, to);
  expect(logs.length).toBeGreaterThan(0);
});

// Confirms getUsageTrends returns at least one day/session-count entry,
// and that each entry has the expected 'sessions' field — proves the
// grouping and counting query runs correctly.
test('getUsageTrends returns a day/session count for the facility', async () => {
  const trends = await getUsageTrends(facility.id);
  expect(trends.length).toBeGreaterThan(0);
  expect(trends[0]).toHaveProperty('sessions');
});