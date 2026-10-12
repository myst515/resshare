/**
 * Represents a single usage session of a facility by a resident.
 */
class UsageSession {
  /**
   * @param {number} id - Unique identifier for the session.
   * @param {number} facilityId - The facility being used.
   * @param {number} userId - The resident using the facility.
   * @param {Date} startTime - When the session started.
   * @param {number} estimatedDurationMinutes - How long the resident expects to use it.
   * @param {Date} expectedEndTime - Calculated end time (startTime + estimatedDuration).
   */
  constructor(id, facilityId, userId, startTime, estimatedDurationMinutes, expectedEndTime) {
    this.id = id;
    this.facilityId = facilityId;
    this.userId = userId;
    this.startTime = startTime;
    this.estimatedDurationMinutes = estimatedDurationMinutes;
    this.expectedEndTime = expectedEndTime;
    this.actualEndTime = null;
    this.status = 'ACTIVE'; // 'ACTIVE' or 'ENDED'
  }

  /**
   * Checks whether the session has passed its expected end time.
   * @param {Date} [currentTime=new Date()]
   * @returns {boolean}
   */
  isExpired(currentTime = new Date()) {
    return currentTime >= new Date(this.expectedEndTime);
  }
  
}

module.exports = UsageSession;