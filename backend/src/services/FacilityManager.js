const Facility = require('../models/Facility');
const sessionManager = require('./SessionManager');

// Reuse the SAME facilities array that SessionManager uses, so both classes stay in sync.
const facilities = sessionManager.getFacilities();
let nextFacilityId = facilities.length + 1;

/**
 * FacilityManager handles administrator CRUD operations on facilities:
 * adding, updating, and removing them from the system.
 */
class FacilityManager {
  /**
   * Adds a new facility to the system.
   * @param {string} name - Display name of the facility.
   * @param {string} type - The facility type (e.g. 'WASHING_MACHINE', 'DRYER').
   * @param {string} location - Where the facility is located.
   * @returns {Facility} The newly created facility.
   * @throws {Error} If name, type, or location is missing.
   */
  addFacility(name, type, location) {
    if (!name || !type || !location) {
      throw new Error('InvalidFacilityError: name, type, and location are required');
    }

    const facility = new Facility(nextFacilityId++, name, type, location);
    facilities.push(facility);

    return facility;
  }

  /**
   * Updates the details of an existing facility.
   * @param {number} facilityId - The facility to update.
   * @param {Object} updates - Fields to update: { name?, type?, location? }.
   * @returns {Facility} The updated facility.
   * @throws {Error} If the facility does not exist.
   */
  updateFacility(facilityId, updates) {
    const facility = facilities.find(f => f.id === facilityId);
    if (!facility) {
      throw new Error('FacilityNotFoundError: no facility with that id');
    }

    if (updates.name !== undefined) facility.name = updates.name;
    if (updates.type !== undefined) facility.type = updates.type;
    if (updates.location !== undefined) facility.location = updates.location;

    return facility;
  }

  /**
   * Removes a facility from the system, provided it is not currently in use.
   * @param {number} facilityId - The facility to remove.
   * @returns {boolean} True if the facility was successfully removed.
   * @throws {Error} If the facility does not exist or is currently in use.
   */
  removeFacility(facilityId) {
    const facility = facilities.find(f => f.id === facilityId);
    if (!facility) {
      throw new Error('FacilityNotFoundError: no facility with that id');
    }

    if (facility.status === 'IN_USE') {
      throw new Error('FacilityInUseError: cannot remove a facility that is currently in use');
    }

    const index = facilities.findIndex(f => f.id === facilityId);
    facilities.splice(index, 1);

    return true;
  }

  /**
   * Returns the full list of facilities.
   * @returns {Facility[]} All facilities currently in the system.
   */
  getAllFacilities() {
    return facilities;
  }
}

module.exports = new FacilityManager();