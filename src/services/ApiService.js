// Service used to communicate with the backend through HTTP requests.

class ApiService {

    // Stores the base URL used for all API requests.
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    // Sends a GET request to retrieve data from the specified endpoint.
    async get(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`);

        // Reject the request if the server returns an unsuccessful status.
        if (!response.ok) {
            throw new Error(`GET request failed: ${response.status}`);
        }

        // Convert the response body from JSON into a JavaScript object.
        return response.json();
    }

    // Sends a POST request to create or submit data to the specified endpoint.
    async post(endpoint, data) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Reject the request if the server returns an unsuccessful status.
        if (!response.ok) {
            throw new Error(`POST request failed: ${response.status}`);
        }

        return response.json();
    }

    // Sends a PUT request to update data at the specified endpoint.
    async put(endpoint, data) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Reject the request if the server returns an unsuccessful status.
        if (!response.ok) {
            throw new Error(`PUT request failed: ${response.status}`);
        }

        return response.json();
    }

    // Sends a DELETE request to remove data at the specified endpoint.
    async delete(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE'
        });

        // Reject the request if the server returns an unsuccessful status.
        if (!response.ok) {
            throw new Error(`DELETE request failed: ${response.status}`);
        }

        return response.json();
    }
}

// Allows other files to import and use the ApiService class.
module.exports = ApiService;