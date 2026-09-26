/**
 * authRoutes.js
 *
 * Defines the REST API endpoints used for:
 *
 * - User registration
 * - User login
 * - Retrieving the authenticated user
 * - Administrator-only functionality
 */

const express =
    require('express');

const router =
    express.Router();

const authService =
    require('../services/AuthService');

const {
    requireAuth,
    requireAdmin
} = require('../middleware/authMiddleware');


/**
 * POST /api/auth/register
 *
 * Registers a new user.
 *
 * Request body:
 *
 * {
 *     name: string,
 *     email: string,
 *     password: string,
 *     role?: string,
 *     floorNumber?: number
 * }
 */
router.post(
    '/register',
    async (req, res) => {

        try {

            const {
                name,
                email,
                password,
                role,
                floorNumber
            } = req.body;


            const user =
                await authService.register(
                    name,
                    email,
                    password,
                    role,
                    floorNumber
                );


            res.status(201).json({

                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                floor_number:
                    user.floor_number

            });

        } catch (err) {

            res.status(400).json({
                error: err.message
            });
        }
    }
);


/**
 * POST /api/auth/login
 *
 * Authenticates an existing user.
 *
 * Request body:
 *
 * {
 *     email: string,
 *     password: string
 * }
 *
 * Successful response:
 *
 * {
 *     token: string,
 *     user: object
 * }
 */
router.post(
    '/login',
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            /*
             * NEW INTEGRATION:
             *
             * AuthService now checks PostgreSQL
             * and creates the JWT.
             */
            const {
                token,
                user
            } =
                await authService.login(
                    email,
                    password
                );


            /*
             * Return only the user information
             * that the frontend needs.
             *
             * The password hash is never returned.
             */
            res.status(200).json({

                token,

                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    floor_number:
                        user.floor_number
                }

            });

        } catch (err) {

            res.status(401).json({
                error: err.message
            });
        }
    }
);


/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user.
 *
 * The JWT must be supplied in:
 *
 * Authorization: Bearer <JWT>
 */
router.get(
    '/me',
    requireAuth,
    async (req, res) => {

        res.status(200).json({

            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                floor_number:
                    req.user.floor_number
            }

        });
    }
);


/**
 * GET /api/auth/admin-only
 *
 * Example protected administrator endpoint.
 *
 * Both requireAuth and requireAdmin
 * must succeed before this endpoint runs.
 */
router.get(
    '/admin-only',
    requireAuth,
    requireAdmin,
    async (req, res) => {

        res.status(200).json({
            message:
                'Administrator access granted'
        });
    }
);


module.exports = router;