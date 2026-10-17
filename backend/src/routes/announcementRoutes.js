/**
 * announcementRoutes.js
 *
 * Defines the REST API endpoints used for:
 * - Fetching broadcasts targeted to a resident's floor
 * - Fetching all broadcasts for the admin panel
 * - Creating new announcements with optional floor targeting
 * - Deleting broadcasts
 */

const express = require('express');
const router = express.Router();

const announcementRepository = require('../../../database/repos/announcementRepository');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

/**
 * GET /api/announcements/floor/:floorNumber
 * Retrieves announcements for a specific floor plus general notices.
 * Protected: Requires valid JWT.
 */
router.get('/floor/:floorNumber', requireAuth, async (req, res) => {
  try {
    const floorNumber = parseInt(req.params.floorNumber, 10);

    if (isNaN(floorNumber)) {
      return res.status(400).json({ error: 'Invalid floor number provided' });
    }

    const announcements = await announcementRepository.getAnnouncementsByFloor(floorNumber);
    res.status(200).json(announcements);
  } catch (err) {
    console.error('Error fetching floor announcements:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/announcements
 * Retrieves all announcements for administrative view.
 * Protected: Requires valid JWT.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const announcements = await announcementRepository.getAllAnnouncements();
    res.status(200).json(announcements);
  } catch (err) {
    console.error('Error fetching all announcements:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/announcements
 * Creates a new broadcast in PostgreSQL.
 * Protected: Requires valid JWT and administrator privileges.
 */
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, body, floorNumber } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required.' });
    }

    // Convert 'All' or blank strings to NULL so PostgreSQL treats it as building-wide
    const floor = (floorNumber === 'All' || floorNumber === null || floorNumber === '') 
      ? null 
      : parseInt(floorNumber, 10);

    const announcement = await announcementRepository.createAnnouncement(title.trim(), body.trim(), floor);
    console.log(`📢 Admin #${req.user.id} created announcement: "${title}" (Floor: ${floor || 'All'})`);

    res.status(201).json(announcement);
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/announcements/:id
 * Removes a broadcast from PostgreSQL.
 * Protected: Requires valid JWT and administrator privileges.
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid announcement ID provided' });
    }

    await announcementRepository.deleteAnnouncement(id);
    console.log(`🗑️ Admin #${req.user.id} deleted announcement #${id}`);

    res.status(200).json({ message: 'Announcement deleted successfully.' });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/announcements/:id
 * Updates an existing announcement. Admin only.
 */
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, body, floorNumber } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required.' });
    }

    const floor = (floorNumber === 'All' || floorNumber === null || floorNumber === '') 
      ? null 
      : parseInt(floorNumber, 10);

    const updated = await announcementRepository.updateAnnouncement(id, title.trim(), body.trim(), floor);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;