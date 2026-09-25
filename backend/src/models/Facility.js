/**
 * Represents a shared facility (e.g. washing machine, dryer) in the ResShare system.
 */
class Facility {
  /**
   * @param {number} id - Unique identifier for the facility.
   * @param {string} name - Display name of the facility (e.g. "Washing Machine 1").
   * @param {string} type - The facility type (e.g. 'WASHING_MACHINE', 'DRYER').
   * @param {string} location - Where the facility is located (e.g. "Block A, Level 1").
   * @param {string} [status='AVAILABLE'] - Current status: 'AVAILABLE' or 'IN_USE'.
   */
  constructor(id, name, type, location, status = 'AVAILABLE') {
    this.id = id;
    this.name = name;
    this.type = type;
    this.location = location;
    this.status = status;
  }
}

module.exports = Facility;