const sessionManager = require('../services/SessionManager');

describe('SessionManager', () => {

  // Test: successful session start
  test('startSession() creates a new session and marks the facility as IN_USE', () => {
    const session = sessionManager.startSession(1, 101, 30);

    expect(session.facilityId).toBe(1);
    expect(session.userId).toBe(101);
    expect(session.estimatedDurationMinutes).toBe(30);
    expect(session.status).toBe('ACTIVE');
    expect(sessionManager.isFacilityAvailable(1)).toBe(false);

    // Clean up so later tests aren't affected
    sessionManager.endSession(session.id);
  });

  // Test: concurrency check (REQ-2.3)
  test('startSession() throws an error if the facility is already in use', () => {
    const session = sessionManager.startSession(1, 101, 30);

    expect(() => {
      sessionManager.startSession(1, 202, 20);
    }).toThrow('FacilityInUseError');

    sessionManager.endSession(session.id);
  });

  // Test: duration too short
  test('startSession() throws an error if duration is below the minimum', () => {
    expect(() => {
      sessionManager.startSession(2, 101, 5); // below 10-minute minimum
    }).toThrow('InvalidDurationError');
  });

  // Test: duration too long
  test('startSession() throws an error if duration is above the maximum', () => {
    expect(() => {
      sessionManager.startSession(2, 101, 200); // above 180-minute maximum
    }).toThrow('InvalidDurationError');
  });

  // Test: non-existent facility
  test('startSession() throws an error if the facility does not exist', () => {
    expect(() => {
      sessionManager.startSession(999, 101, 30);
    }).toThrow('FacilityNotFoundError');
  });

  // Test: manually ending a session frees the facility
  test('endSession() marks the session as ENDED and frees the facility', () => {
    const session = sessionManager.startSession(2, 101, 45);

    const result = sessionManager.endSession(session.id);

    expect(result).toBe(true);
    expect(sessionManager.isFacilityAvailable(2)).toBe(true);
  });

  // Test: ending a session that's already ended
  test('endSession() throws an error if the session has already ended', () => {
    const session = sessionManager.startSession(2, 101, 20);
    sessionManager.endSession(session.id);

    expect(() => {
      sessionManager.endSession(session.id);
    }).toThrow('SessionAlreadyEndedError');
  });

  // Test: ending a non-existent session
  test('endSession() throws an error if the session does not exist', () => {
    expect(() => {
      sessionManager.endSession(9999);
    }).toThrow('SessionNotFoundError');
  });

  // Test: updating duration recalculates expectedEndTime
  test('updateDuration() updates the estimated duration and expected end time', () => {
    const session = sessionManager.startSession(1, 101, 30);
    const originalEndTime = session.expectedEndTime.getTime();

    const updated = sessionManager.updateDuration(session.id, 60);

    expect(updated.estimatedDurationMinutes).toBe(60);
    expect(updated.expectedEndTime.getTime()).toBeGreaterThan(originalEndTime);

    sessionManager.endSession(session.id);
  });

  // Test: updating duration outside allowed range
  test('updateDuration() throws an error if the new duration is invalid', () => {
    const session = sessionManager.startSession(1, 101, 30);

    expect(() => {
      sessionManager.updateDuration(session.id, 300);
    }).toThrow('InvalidDurationError');

    sessionManager.endSession(session.id);
  });

});