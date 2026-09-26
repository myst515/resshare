/**
 * AuthService
 *
 * Responsible for user registration, authentication,
 * JWT creation, JWT validation, and administrator checks.
 *
 * The service communicates with PostgreSQL through
 * userRepository rather than maintaining its own
 * in-memory list of users.
 */

require('dotenv').config();

const jwt = require('jsonwebtoken');

const userRepository =
    require('../../../database/repos/userRepository');


// JWT configuration is loaded from the backend .env file.
const JWT_SECRET =
    process.env.JWT_SECRET;

const JWT_EXPIRES_IN =
    process.env.JWT_EXPIRES_IN || '1h';


class AuthService {


    /**
     * Registers a new user.
     *
     * The userRepository is responsible for hashing the
     * password and storing the user in PostgreSQL.
     *
     * @param {string} name - User's name.
     * @param {string} email - User's email.
     * @param {string} password - User's password.
     * @param {string} role - User role.
     * @param {number|null} floorNumber - User's floor.
     * @returns {Object} Newly created user.
     */
    async register(
        name,
        email,
        password,
        role = 'resident',
        floorNumber = null
    ) {

        // Check PostgreSQL to make sure the email
        // has not already been registered.
        const existingUser =
            await userRepository.findByEmail(email);

        if (existingUser) {

            throw new Error(
                'DuplicateEmailError: email already registered'
            );
        }

        // Create the user through the repository.
        // The repository hashes the password before storing it.
        const user =
            await userRepository.createUser(
                name,
                email,
                password,
                role,
                floorNumber
            );

        return user;
    }


    /**
     * Authenticates a user and creates a JWT.
     *
     * @param {string} email - Email supplied during login.
     * @param {string} password - Password supplied during login.
     * @returns {Object} JWT token and authenticated user.
     */
    async login(email, password) {

        /*
         * NEW INTEGRATION:
         *
         * Instead of checking an in-memory users array,
         * authentication now checks the PostgreSQL database
         * through userRepository.
         */
        const user =
            await userRepository.verifyCredentials(
                email,
                password
            );


        // Invalid email or password.
        if (!user) {

            throw new Error(
                'InvalidCredentialsError: incorrect email or password'
            );
        }


        /*
         * NEW INTEGRATION:
         *
         * Create a JWT containing the database user ID
         * and role. The frontend will store this token
         * and send it with future protected requests.
         */
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN
            }
        );


        return {
            token,
            user
        };
    }


    /**
     * Validates a JWT and retrieves the associated
     * user from PostgreSQL.
     *
     * @param {string} token - JWT supplied by the client.
     * @returns {Object} Authenticated user.
     */
    async validateToken(token) {

        try {

            /*
             * First verify that the JWT itself is valid.
             */
            const decoded =
                jwt.verify(
                    token,
                    JWT_SECRET
                );


            /*
             * NEW INTEGRATION:
             *
             * The user ID stored inside the JWT is used
             * to retrieve the current user from PostgreSQL.
             */
            const user =
                await userRepository.findById(
                    decoded.userId
                );


            if (!user) {

                throw new Error(
                    'UserNotFoundError: token user no longer exists'
                );
            }


            return user;

        } catch (err) {

            throw new Error(
                'TokenInvalidError: ' +
                err.message
            );
        }
    }


    /**
     * Checks whether a user has administrator privileges.
     *
     * @param {string} token - JWT supplied by the client.
     * @returns {boolean} True if the user is an administrator.
     */
    async isAdmin(token) {

        const user =
            await this.validateToken(token);

        return user.role === 'admin';
    }
}


module.exports =
    new AuthService();