/**
 * authMiddleware.js
 *
 * Middleware used to protect backend routes.
 *
 * requireAuth:
 *     Checks that the request contains a valid JWT.
 *
 * requireAdmin:
 *     Checks that the authenticated user has administrator privileges.
 */

const authService =
    require('../services/AuthService');


/**
 * Middleware that requires the user to be authenticated.
 *
 * The frontend must send:
 *
 * Authorization: Bearer <JWT>
 */
async function requireAuth(req, res, next) {

    const authHeader =
        req.headers['authorization'];


    // Check that the Authorization header exists
    // and follows the expected Bearer token format.
    if (
        !authHeader ||
        !authHeader.startsWith('Bearer ')
    ) {

        return res.status(401).json({
            error:
                'Missing or malformed Authorization header'
        });
    }


    // Extract the JWT from:
    // "Bearer <token>"
    const token =
        authHeader.split(' ')[1];


    try {

        /*
         * NEW INTEGRATION:
         *
         * validateToken() now checks both:
         *
         * 1. Whether the JWT is valid.
         * 2. Whether the user still exists in PostgreSQL.
         */
        const user =
            await authService.validateToken(
                token
            );


        // Store the authenticated user on the request.
        // Protected routes can access it through req.user.
        req.user = user;


        next();

    } catch (err) {

        return res.status(401).json({
            error: err.message
        });
    }
}


/**
 * Middleware that requires administrator privileges.
 *
 * This middleware should be used after requireAuth.
 */
function requireAdmin(req, res, next) {

    // The user should already have been authenticated.
    if (!req.user) {

        return res.status(401).json({
            error: 'Not authenticated'
        });
    }


    // The database uses the role value "admin".
    if (req.user.role !== 'admin') {

        return res.status(403).json({
            error:
                'Administrator privileges required'
        });
    }


    next();
}


module.exports = {
    requireAuth,
    requireAdmin
};