const Facility = require('../models/Facility');
const UsageSession = require('../models/UsageSession');

const facilityRepository = require('../../../database/repos/facilityRepository');
const usageLogRepository = require('../../../database/repos/usageLogRepository');

// Global allowed duration range (simplification for now — per-facility-type ranges can be added later)
const MIN_DURATION_MINUTES = 10;
const MAX_DURATION_MINUTES = 180;

const facilities = [
  new Facility(1, 'Washing Machine 1', 'WASHING_MACHINE', 'Block A, Level 1'),
  new Facility(2, 'Dryer 1', 'DRYER', 'Block A, Level 1'),
];

/**
 * Exposes the shared facilities array so FacilityManager can manage it too.
 * Both classes need to work with the same in-memory list to stay in sync.
 */
function getFacilities() {
  return facilities;
}
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
/**
   * Starts a new usage session on a facility.
   * Checks the real PostgreSQL database to verify the facility exists.
   */
  async startSession(facilityId, userId, estimatedDurationMinutes) {
    // 1. Check PostgreSQL to make sure this facility actually exists
    const facility = await facilityRepository.getFacilityById(facilityId);
    if (!facility) {
      throw new Error('FacilityNotFoundError: no facility with that id');
    }

    // 2. Check if it's already in use
    const activeSession = sessions.find(s => s.facilityId === facilityId && s.status === 'ACTIVE');
    if (activeSession || facility.status === 'in_use') {
      throw new Error('FacilityInUseError: facility is already in use');
    }

    // 3. Validate duration
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

    // 4. Update status in PostgreSQL to in_use
    await facilityRepository.updateStatus(facilityId, 'in_use');

    return session;
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

  /**
   * Returns all currently active sessions.
   * @returns {UsageSession[]}
   */
  getActiveSessions() {
    return sessions.filter(s => s.status === 'ACTIVE');
  }

  /**
   * Ends an active usage session and frees up the facility in memory and PostgreSQL.
   * @param {number} sessionId - The session to end.
   * @param {'manual'|'automatic'|'auto_released'} [releaseType='manual'] - How the session was ended.
   */
  async endSession(sessionId, releaseType = 'manual') {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('SessionNotFoundError: no session with that id');
    }
    if (session.status === 'ENDED') {
      throw new Error('SessionAlreadyEndedError: session has already ended');
    }

    session.status = 'ENDED';
    session.actualEndTime = new Date();

    // 1. Update in-memory facility
    const facility = facilities.find(f => f.id === session.facilityId);
    if (facility) {
      facility.status = 'AVAILABLE';
    }

    // 2. Persist update to PostgreSQL (Supabase)
    try {
      await facilityRepository.updateStatus(session.facilityId, 'available');
      
      // 3. Log the session in usage_logs with release_type ('manual' or 'automatic')
      await usageLogRepository.insertLog(
        session.id,
        session.facilityId,
        session.userId,
        session.startTime,
        session.actualEndTime,
        releaseType === 'auto_released' ? 'automatic' : releaseType
      );

      console.log(`✅ [RES-48] Facility #${session.facilityId} auto-released & logged in database!`);
    } catch (err) {
      console.error('Error syncing auto-release to database:', err.message);
    }

    return true;
  }
}

module.exports = new SessionManager();
module.exports.getFacilities = getFacilities;