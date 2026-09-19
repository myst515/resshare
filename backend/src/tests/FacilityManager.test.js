const facilityManager = require('../services/FacilityManager');
const sessionManager = require('../services/SessionManager');

describe('FacilityManager', () => {

  // Test: successful add
  test('addFacility() creates a new facility with the given details', () => {
    const facility = facilityManager.addFacility('Washing Machine 2', 'WASHING_MACHINE', 'Block B, Level 1');

    expect(facility.name).toBe('Washing Machine 2');
    expect(facility.type).toBe('WASHING_MACHINE');
    expect(facility.location).toBe('Block B, Level 1');
    expect(facility.status).toBe('AVAILABLE');
    expect(facility.id).toBeDefined();
  });

  // Test: missing required fields
  test('addFacility() throws an error if any required field is missing', () => {
    expect(() => {
      facilityManager.addFacility('', 'WASHING_MACHINE', 'Block B, Level 1');
    }).toThrow('InvalidFacilityError');

    expect(() => {
      facilityManager.addFacility('Dryer 2', '', 'Block B, Level 1');
    }).toThrow('InvalidFacilityError');

    expect(() => {
      facilityManager.addFacility('Dryer 2', 'DRYER', '');
    }).toThrow('InvalidFacilityError');
  });

  // Test: successful update
  test('updateFacility() updates only the provided fields', () => {
    const facility = facilityManager.addFacility('Dryer 3', 'DRYER', 'Block C, Level 1');

    const updated = facilityManager.updateFacility(facility.id, { location: 'Block C, Level 2' });

    expect(updated.location).toBe('Block C, Level 2');
    expect(updated.name).toBe('Dryer 3'); // unchanged
    expect(updated.type).toBe('DRYER'); // unchanged
  });

  // Test: updating a non-existent facility
  test('updateFacility() throws an error if the facility does not exist', () => {
    expect(() => {
      facilityManager.updateFacility(9999, { name: 'Ghost Facility' });
    }).toThrow('FacilityNotFoundError');
  });

  // Test: successful removal
  test('removeFacility() removes an AVAILABLE facility', () => {
    const facility = facilityManager.addFacility('Dryer 4', 'DRYER', 'Block D, Level 1');

    const result = facilityManager.removeFacility(facility.id);

    expect(result).toBe(true);
    expect(facilityManager.getAllFacilities().find(f => f.id === facility.id)).toBeUndefined();
  });

  // Test: removal blocked while in use (REQ-6.3)
  test('removeFacility() throws an error if the facility is currently in use', () => {
    const facility = facilityManager.addFacility('Washing Machine 5', 'WASHING_MACHINE', 'Block E, Level 1');

    // Start a session on it via SessionManager, using the SAME shared facility list
    const session = sessionManager.startSession(facility.id, 101, 30);

    expect(() => {
      facilityManager.removeFacility(facility.id);
    }).toThrow('FacilityInUseError');

    // Clean up: end the session so it doesn't affect other tests
    sessionManager.endSession(session.id);
  });

  // Test: removing a non-existent facility
  test('removeFacility() throws an error if the facility does not exist', () => {
    expect(() => {
      facilityManager.removeFacility(9999);
    }).toThrow('FacilityNotFoundError');
  });

  // Test: getAllFacilities returns the current list
  test('getAllFacilities() returns an array including added facilities', () => {
    const facility = facilityManager.addFacility('Dryer 6', 'DRYER', 'Block F, Level 1');

    const all = facilityManager.getAllFacilities();

    expect(Array.isArray(all)).toBe(true);
    expect(all.find(f => f.id === facility.id)).toBeDefined();
  });

});