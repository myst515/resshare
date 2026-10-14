/**
 * ApiService
 *
 * Provides a central interface between the React frontend
 * and the Node.js backend REST API.
 *
 * The service automatically attaches the JWT stored in
 * localStorage to authenticated requests.
 */

class ApiService {


    /**
     * Creates an ApiService instance.
     *
     * @param {string} baseURL - Base URL of the backend API.
     */
    constructor(
        baseURL = 'http://localhost:5000/api'
    ) {

        this.baseURL = baseURL;
    }


    /**
     * Sends a GET request to the backend.
     *
     * @param {string} endpoint - API endpoint.
     * @returns {Object} Parsed JSON response.
     */
    async get(endpoint) {

        /*
         * NEW INTEGRATION:
         *
         * Retrieve the JWT saved after login.
         */
        const token =
            localStorage.getItem('token');


        const response =
            await fetch(
                `${this.baseURL}${endpoint}`,
                {

                    method: 'GET',

                    headers: {

                        'Content-Type':
                            'application/json',

                        /*
                         * Attach the JWT when one exists.
                         *
                         * The spread syntax prevents an
                         * Authorization header being sent
                         * when the user is not logged in.
                         */
                        ...(token && {
                            Authorization:
                                `Bearer ${token}`
                        })
                    }
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                'API request failed'
            );
        }


        return result;
    }


    /**
     * Sends a POST request to the backend.
     *
     * @param {string} endpoint - API endpoint.
     * @param {Object} data - Data to send.
     * @returns {Object} Parsed JSON response.
     */
    async post(endpoint, data) {

        /*
         * NEW INTEGRATION:
         *
         * Retrieve the JWT so that POST requests to
         * protected endpoints can be authenticated.
         */
        const token =
            localStorage.getItem('token');


        const response =
            await fetch(
                `${this.baseURL}${endpoint}`,
                {

                    method: 'POST',

                    headers: {

                        'Content-Type':
                            'application/json',

                        ...(token && {
                            Authorization:
                                `Bearer ${token}`
                        })
                    },

                    body:
                        JSON.stringify(data)
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                'API request failed'
            );
        }


        return result;
    }

    /**
     * Sends a DELETE request to the backend.
     * @param {string} endpoint - API endpoint.
     * @returns {Object} Parsed JSON response.
     */
    async delete(endpoint) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Delete request failed');
        }

        return result;
    }
}


/*
 * Export one ApiService instance so that all React
 * components communicate with the backend using the
 * same API configuration.
 */
export default new ApiService();