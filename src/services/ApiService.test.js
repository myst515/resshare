const ApiService = require("./ApiService");

describe("ApiService", () => {
    let apiService;

    beforeEach(() => {
        // Create a new ApiService with a fixed base URL for testing.
        apiService = new ApiService("http://localhost:3000");

        // Replace the real fetch function with a Jest mock.
        global.fetch = jest.fn();
    });

    afterEach(() => {
        // Remove the mock after each test so tests remain independent.
        jest.restoreAllMocks();
    });

    describe("constructor()", () => {

        test("stores the base URL", () => {
            expect(apiService.baseURL).toBe(
                "http://localhost:3000"
            );
        });
    });

    describe("get()", () => {

        test("sends a GET request to the correct endpoint", async () => {
            const responseData = {
                id: 1,
                name: "Test User"
            };

            fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(responseData)
            });

            const result = await apiService.get("/users");

            expect(fetch).toHaveBeenCalledWith(
                "http://localhost:3000/users"
            );

            expect(result).toEqual(responseData);
        });

        test("throws an error when the GET request fails", async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 404
            });

            await expect(
                apiService.get("/users")
            ).rejects.toThrow("GET request failed: 404");
        });
    });

    describe("post()", () => {

        test("sends a POST request with JSON data", async () => {
            const data = {
                name: "Test User",
                email: "test@example.com"
            };

            const responseData = {
                id: 1,
                ...data
            };

            fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(responseData)
            });

            const result = await apiService.post(
                "/users",
                data
            );

            expect(fetch).toHaveBeenCalledWith(
                "http://localhost:3000/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

            expect(result).toEqual(responseData);
        });

        test("throws an error when the POST request fails", async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 400
            });

            await expect(
                apiService.post("/users", {})
            ).rejects.toThrow("POST request failed: 400");
        });
    });

    describe("put()", () => {

        test("sends a PUT request with JSON data", async () => {
            const data = {
                name: "Updated User"
            };

            const responseData = {
                id: 1,
                name: "Updated User"
            };

            fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(responseData)
            });

            const result = await apiService.put(
                "/users/1",
                data
            );

            expect(fetch).toHaveBeenCalledWith(
                "http://localhost:3000/users/1",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

            expect(result).toEqual(responseData);
        });

        test("throws an error when the PUT request fails", async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 500
            });

            await expect(
                apiService.put("/users/1", {})
            ).rejects.toThrow("PUT request failed: 500");
        });
    });

    describe("delete()", () => {

        test("sends a DELETE request to the correct endpoint", async () => {
            const responseData = {
                message: "User deleted"
            };

            fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(responseData)
            });

            const result = await apiService.delete(
                "/users/1"
            );

            expect(fetch).toHaveBeenCalledWith(
                "http://localhost:3000/users/1",
                {
                    method: "DELETE"
                }
            );

            expect(result).toEqual(responseData);
        });

        test("throws an error when the DELETE request fails", async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 404
            });

            await expect(
                apiService.delete("/users/1")
            ).rejects.toThrow("DELETE request failed: 404");
        });
    });
});