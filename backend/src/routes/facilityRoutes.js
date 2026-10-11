/**
 * facilityRoutes.js
 *
 * Defines the REST API endpoints used for:
 * - Retrieving all shared building facilities
 * - Retrieving facilities filtered by floor number with live active timers
 * - Booking facility sessions with persistent countdowns
 */

const express = require('express');
const router = express.Router();

const facilityRepository = require('../../../database/repos/facilityRepository');
const sessionManager = require('../services/SessionManager');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * Helper function: Attaches active session end times from SessionManager
 * to the facility objects returned to the frontend.
 */
function attachActiveSessionData(facilities) {
    const activeSessions = sessionManager.getActiveSessions();

    return facilities.map((f) => {
        const activeSession = activeSessions.find((s) => s.facilityId === f.id);

        if (activeSession) {
            return {
                ...f,
                status: 'in_use',
                reservedUntil: activeSession.expectedEndTime
            };
        }

        return {
            ...f,
            reservedUntil: null
        };
    });
}

/**
 * GET /api/facilities
 * Returns all facilities in the building with live session timers.
 * Protected: Requires valid JWT.
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const rawFacilities = await facilityRepository.getAllFacilities();
        const facilities = attachActiveSessionData(rawFacilities);
        res.status(200).json(facilities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/facilities/floor/:floorNumber
 * Returns all facilities situated on a specific floor with live timers.
 * Protected: Requires valid JWT.
 */
router.get('/floor/:floorNumber', requireAuth, async (req, res) => {
    try {
        const floorNumber = parseInt(req.params.floorNumber, 10);

        if (isNaN(floorNumber)) {
            return res.status(400).json({ error: 'Invalid floor number provided' });
        }

        const rawFacilities = await facilityRepository.getFacilitiesByFloor(floorNumber);
        const facilities = attachActiveSessionData(rawFacilities);
        res.status(200).json(facilities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/facilities/book
 * Starts a real booking session for the authenticated resident.
 * Creates a server session, updates PostgreSQL, and starts the timer.
 */
router.post('/book', requireAuth, async (req, res) => {
    try {
        const { facilityId, durationMinutes } = req.body;
        const userId = req.user.id;

        if (!facilityId || !durationMinutes) {
            return res.status(400).json({ error: 'facilityId and durationMinutes are required.' });
        }

        // 1. Start session in SessionManager
        const session = sessionManager.startSession(
            parseInt(facilityId, 10),
            userId,
            parseInt(durationMinutes, 10)
        );

        console.log(`📌 Resident #${userId} booked Facility #${facilityId} for ${durationMinutes} minutes.`);

        res.status(200).json({
            message: 'Facility booked successfully',
            session,
            reservedUntil: session.expectedEndTime
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
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