const Facility = require('../models/Facility');
const UsageSession = require('../models/UsageSession');

// Global allowed duration range (simplification for now — per-facility-type ranges can be added later)
const MIN_DURATION_MINUTES = 10;
const MAX_DURATION_MINUTES = 180;

// Temporary in-memory stores (replace with PostgreSQL calls later)
const facilities = [
  new Facility(1, 'Washing Machine 1', 'WASHING_MACHINE'),
  new Facility(2, 'Dryer 1', 'DRYER'),
];
const sessions = [];
let nextSessionId = 1;

/**
 * SessionManager handles starting, ending, and updating facility usage sessions,
 * including enforcing that a facility can only be used by one resident at a time.
 */
class SessionManager {
  /**
   * Checks whether a facility is currently available for use.
   * @param {number} facilityId - The facility to check.
   * @returns {boolean} True if the facility exists and is AVAILABLE.
   * @throws {Error} If the facility does not exist.
   */
  isFacilityAvailable(facilityId) {
    const facility = facilities.find(f => f.id === facilityId);
    if (!facility) {
      throw new Error('FacilityNotFoundError: no facility with that id');
    }
    return facility.status === 'AVAILABLE';
  }

  /**
   * Starts a new usage session on a facility.
   * @param {number} facilityId - The facility to use.
   * @param {number} userId - The resident starting the session.
   * @param {number} estimatedDurationMinutes - Expected duration, must be within the allowed range.
   * @returns {UsageSession} The newly created session.
   * @throws {Error} If the facility doesn't exist, is already in use, or the duration is invalid.
   */
  startSession(facilityId, userId, estimatedDurationMinutes) {
    const facility = facilities.find(f => f.id === facilityId);
    if (!facility) {
      throw new Error('FacilityNotFoundError: no facility with that id');
    }

    if (facility.status === 'IN_USE') {
      throw new Error('FacilityInUseError: facility is already in use');
    }

    if (
      estimatedDurationMinutes < MIN_DURATION_MINUTES ||
      estimatedDurationMinutes > MAX_DURATION_MINUTES
    ) {
      throw new Error(
        `InvalidDurationError: duration must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES} minutes`
      );
    }

    const startTime = new Date();
    const expectedEndTime = new Date(startTime.getTime() + estimatedDurationMinutes * 60000);

    const session = new UsageSession(
      nextSessionId++,
      facilityId,
      userId,
      startTime,
      estimatedDurationMinutes,
      expectedEndTime
    );

    sessions.push(session);
    facility.status = 'IN_USE';

    return session;
  }

  /**
   * Manually ends an active usage session, freeing up the facility.
   * @param {number} sessionId - The session to end.
   * @returns {boolean} True if the session was successfully ended.
   * @throws {Error} If the session doesn't exist or is already ended.
   */
  endSession(sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('SessionNotFoundError: no session with that id');
    }
    if (session.status === 'ENDED') {
      throw new Error('SessionAlreadyEndedError: session has already ended');
    }

    session.status = 'ENDED';
    session.actualEndTime = new Date();

    const facility = facilities.find(f => f.id === session.facilityId);
    if (facility) {
      facility.status = 'AVAILABLE';
    }

    return true;
  }

  /**
   * Updates the estimated duration of an active session, recalculating its expected end time.
   * @param {number} sessionId - The session to update.
   * @param {number} newDurationMinutes - The new estimated duration, must be within the allowed range.
   * @returns {UsageSession} The updated session.
   * @throws {Error} If the session doesn't exist, has ended, or the duration is invalid.
   */
  updateDuration(sessionId, newDurationMinutes) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('SessionNotFoundError: no session with that id');
    }
    if (session.status === 'ENDED') {
      throw new Error('SessionAlreadyEndedError: cannot update a session that has ended');
    }
    if (
      newDurationMinutes < MIN_DURATION_MINUTES ||
      newDurationMinutes > MAX_DURATION_MINUTES
    ) {
      throw new Error(
        `InvalidDurationError: duration must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES} minutes`
      );
    }

    session.estimatedDurationMinutes = newDurationMinutes;
    session.expectedEndTime = new Date(session.startTime.getTime() + newDurationMinutes * 60000);

    return session;
  }
}

module.exports = new SessionManager();