/**
 * facilityAvailabilityNotification.test.js
 * RES-49: Facility availability notification test (ST8).
 *
 * Integration test across two layers:
 *   - Database: the real facilities table, through facilityRepository
 *     (addFacility, updateStatus, isAvailable).
 *   - Back-end: the real NotificationService (requests and notifications).
 * The front end is not involved: there is no Notify button or notification
 * route yet, so the resident's request is made by calling the service directly.
 *
 * Nothing in the app calls notifyFacilityAvailable() when a session ends yet,
 * so the helper notifyIfAvailable() below does what session end / automatic
 * release should do: ask the database whether the facility is now available,
 * and only then notify the waiting residents.
 *
 * Every test makes its own facility and the service's request list is emptied
 * before each test, so the tests do not depend on each other.
 */
const pool = require('../../../database/db');
const {
  addFacility,
  updateStatus,
  isAvailable
} = require('../../../database/repos/facilityRepository');
const notificationService = require('../services/NotificationService');

// Ids of every facility created in this file, for cleanup in afterAll.
const createdIds = [];

// Creates a test facility in the database and remembers its id.
async function makeFacility(name = 'Jest Notify Washer') {
  const facility = await addFacility(name, 'Washing Machine', 'Test Floor', 9);
  createdIds.push(facility.id);
  return facility;
}

// Stand-in for what session end / automatic release should do: check the
// database first, and notify waiting residents only if the facility is free.
// Returns true if the notifications were triggered.
async function notifyIfAvailable(facilityId) {
  if (await isAvailable(facilityId)) {
    notificationService.notifyFacilityAvailable(facilityId);
    return true;
  }
  return false;
}

let sendInApp;
let sendEmail;

// Before each test: empty the shared NotificationService (it is a singleton
// and keeps its requests in memory) and replace the two "send" methods with
// spies so we can check what was sent without printing to the console.
beforeEach(() => {
  notificationService.requests = [];
  notificationService.nextId = 1;
  sendInApp = jest.spyOn(notificationService, 'sendInApp').mockImplementation(() => {});
  sendEmail = jest.spyOn(notificationService, 'sendEmail').mockImplementation(() => {});
});

// Puts the real send methods back after each test.
afterEach(() => {
  jest.restoreAllMocks();
});

// Deletes every test facility created above and closes the database pool so
// Jest can exit.
afterAll(async () => {
  await pool.query(`DELETE FROM facilities WHERE id = ANY($1)`, [createdIds]);
  await pool.end();
});

// ---------------------------------------------------------------- main flow

// ST8 main flow: a resident waits for a facility that is in use. Once the
// facility is released in the database, they are notified in-app and their
// request is marked as sent.
test('notifies a waiting resident when the facility becomes available', async () => {
  const facility = await makeFacility();
  await updateStatus(facility.id, 'in_use');
  expect(await isAvailable(facility.id)).toBe(false);

  const request = notificationService.requestNotification(5, facility.id, 'IN_APP');
  expect(request.status).toBe('PENDING');

  await updateStatus(facility.id, 'available');
  expect(await isAvailable(facility.id)).toBe(true);

  expect(await notifyIfAvailable(facility.id)).toBe(true);
  expect(request.status).toBe('SENT');
  expect(sendInApp).toHaveBeenCalledTimes(1);
  expect(sendInApp).toHaveBeenCalledWith(5, expect.stringContaining(String(facility.id)));
  expect(sendEmail).not.toHaveBeenCalled();
});

// Confirms a resident who chose email is notified by email, not in-app.
test('uses email when the resident chose the EMAIL channel', async () => {
  const facility = await makeFacility();
  await updateStatus(facility.id, 'in_use');
  const request = notificationService.requestNotification(6, facility.id, 'EMAIL');

  await updateStatus(facility.id, 'available');
  await notifyIfAvailable(facility.id);

  expect(request.status).toBe('SENT');
  expect(sendEmail).toHaveBeenCalledTimes(1);
  expect(sendEmail).toHaveBeenCalledWith(6, expect.stringContaining(String(facility.id)));
  expect(sendInApp).not.toHaveBeenCalled();
});

// Confirms every resident waiting for the same facility is notified, each on
// their own channel.
test('notifies every resident waiting for the facility', async () => {
  const facility = await makeFacility();
  await updateStatus(facility.id, 'in_use');
  const first = notificationService.requestNotification(7, facility.id, 'IN_APP');
  const second = notificationService.requestNotification(8, facility.id, 'EMAIL');

  await updateStatus(facility.id, 'available');
  await notifyIfAvailable(facility.id);

  expect(first.status).toBe('SENT');
  expect(second.status).toBe('SENT');
  expect(sendInApp).toHaveBeenCalledTimes(1);
  expect(sendEmail).toHaveBeenCalledTimes(1);
});

// -------------------------------------------------------------- edge cases

// Confirms nobody is notified while the facility is still in use, and the
// request stays pending so they are notified later.
test('does not notify while the facility is still in use', async () => {
  const facility = await makeFacility();
  await updateStatus(facility.id, 'in_use');
  const request = notificationService.requestNotification(5, facility.id, 'IN_APP');

  expect(await notifyIfAvailable(facility.id)).toBe(false);
  expect(request.status).toBe('PENDING');
  expect(sendInApp).not.toHaveBeenCalled();
});

// Confirms a suspended facility is not "available", so nobody is notified.
test('does not notify when the facility is suspended', async () => {
  const facility = await makeFacility();
  await updateStatus(facility.id, 'suspended');
  const request = notificationService.requestNotification(5, facility.id, 'IN_APP');

  expect(await notifyIfAvailable(facility.id)).toBe(false);
  expect(request.status).toBe('PENDING');
  expect(sendInApp).not.toHaveBeenCalled();
});

// Confirms a resident who cancelled their request is not notified.
test('does not notify a resident who cancelled their request', async () => {
  const facility = await makeFacility();
  await updateStatus(facility.id, 'in_use');
  const request = notificationService.requestNotification(5, facility.id, 'IN_APP');
  notificationService.cancelRequest(request.id);

  await updateStatus(facility.id, 'available');
  await notifyIfAvailable(facility.id);

  expect(request.status).toBe('CANCELLED');
  expect(sendInApp).not.toHaveBeenCalled();
});

// Confirms cancelling one resident's request does not stop the others.
test('still notifies the other residents when one request is cancelled', async () => {
  const facility = await makeFacility();
  await updateStatus(facility.id, 'in_use');
  const cancelled = notificationService.requestNotification(5, facility.id, 'IN_APP');
  const active = notificationService.requestNotification(6, facility.id, 'IN_APP');
  notificationService.cancelRequest(cancelled.id);

  await updateStatus(facility.id, 'available');
  await notifyIfAvailable(facility.id);

  expect(cancelled.status).toBe('CANCELLED');
  expect(active.status).toBe('SENT');
  expect(sendInApp).toHaveBeenCalledTimes(1);
  expect(sendInApp).toHaveBeenCalledWith(6, expect.any(String));
});

// Confirms a request for one facility is not triggered by a different
// facility becoming available.
test('does not notify for a different facility', async () => {
  const waitingFor = await makeFacility('Jest Notify Washer A');
  const other = await makeFacility('Jest Notify Washer B');
  await updateStatus(waitingFor.id, 'in_use');
  await updateStatus(other.id, 'in_use');
  const request = notificationService.requestNotification(5, waitingFor.id, 'IN_APP');

  await updateStatus(other.id, 'available');
  await notifyIfAvailable(other.id);

  expect(request.status).toBe('PENDING');
  expect(sendInApp).not.toHaveBeenCalled();
});

// Confirms a request that was already sent is not sent a second time if the
// facility is released again.
test('does not send the same notification twice', async () => {
  const facility = await makeFacility();
  await updateStatus(facility.id, 'in_use');
  notificationService.requestNotification(5, facility.id, 'IN_APP');

  await updateStatus(facility.id, 'available');
  await notifyIfAvailable(facility.id);
  await updateStatus(facility.id, 'in_use');
  await updateStatus(facility.id, 'available');
  await notifyIfAvailable(facility.id);

  expect(sendInApp).toHaveBeenCalledTimes(1);
});

// Confirms a facility id that does not exist in the database is treated as
// unavailable, so a request for it is never notified.
test('does not notify for a facility that does not exist', async () => {
  const request = notificationService.requestNotification(5, 999999999, 'IN_APP');

  expect(await notifyIfAvailable(999999999)).toBe(false);
  expect(request.status).toBe('PENDING');
  expect(sendInApp).not.toHaveBeenCalled();
});

// Confirms cancelling a request id that does not exist is an error, not a
// silent success.
test('cancelRequest throws for an unknown request id', () => {
  expect(() => notificationService.cancelRequest(999)).toThrow('Notification request not found');
});