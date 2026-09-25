const authService = require('../services/AuthService');

/**
 * Middleware that verifies a request has a valid JWT.
 * Expects the token in the Authorization header as: "Bearer <token>".
 * If valid, attaches the authenticated user to req.user and calls next().
 * If missing or invalid, responds with 401 Unauthorized.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = authService.validateToken(token);
    req.user = user; // attach the user so later route handlers can use it
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}

/**
 * Middleware that verifies the request's user has ADMINISTRATOR privileges.
 * Must be used AFTER requireAuth, since it relies on req.user being set.
 * If the user is not an admin, responds with 403 Forbidden.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'ADMINISTRATOR') {
    return res.status(403).json({ error: 'Administrator privileges required' });
  }

  next();
}

module.exports = { requireAuth, requireAdmin };