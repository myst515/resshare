/**
 * facilityRoutes.js
 *
 * Defines the REST API endpoints used for:
 * - Retrieving all shared building facilities
 * - Retrieving facilities filtered by floor number
 * - Checking facility availability
 */

const express = require('express');
const router = express.Router();

const facilityRepository = require('../../../database/repos/facilityRepository');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * GET /api/facilities
 * Returns all facilities in the building.
 * Protected: Requires valid JWT.
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const facilities = await facilityRepository.getAllFacilities();
        res.status(200).json(facilities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/facilities/floor/:floorNumber
 * Returns all facilities situated on a specific floor.
 * Protected: Requires valid JWT.
 */
router.get('/floor/:floorNumber', requireAuth, async (req, res) => {
    try {
        const floorNumber = parseInt(req.params.floorNumber, 10);

        if (isNaN(floorNumber)) {
            return res.status(400).json({ error: 'Invalid floor number provided' });
        }

        const facilities = await facilityRepository.getFacilitiesByFloor(floorNumber);
        res.status(200).json(facilities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/facilities/:id
 * Returns a specific facility by database ID.
 */
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const facility = await facilityRepository.getFacilityById(id);

        if (!facility) {
            return res.status(404).json({ error: 'Facility not found' });
        }

        res.status(200).json(facility);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;