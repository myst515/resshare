const express = require('express');
const router = express.Router();
const authService = require('../services/AuthService');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

/**
 * POST /api/auth/register
 * Registers a new user account.
 * Request body: { email: string, password: string, role?: string }
 * Response: 201 with { id, email, role } on success, 400 with { error } on failure.
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await authService.register(email, password, role);
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * Authenticates a user and issues a JWT.
 * Request body: { email: string, password: string }
 * Response: 200 with { token, user } on success, 401 with { error } on failure.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});


/**
 * GET /api/auth/me
 * Protected route — returns the currently authenticated user's info.
 * Requires a valid JWT in the Authorization header.
 */
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({ id: req.user.id, email: req.user.email, role: req.user.role });
});

/**
 * GET /api/auth/admin-only
 * Protected route — only accessible to users with ADMINISTRATOR role.
 * Demonstrates role-based access control for future features like Facility Management.
 */
router.get('/admin-only', requireAuth, requireAdmin, (req, res) => {
  res.status(200).json({ message: `Welcome, admin ${req.user.email}` });
});

module.exports = router;