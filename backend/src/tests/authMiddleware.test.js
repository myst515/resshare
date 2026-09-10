const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const authService = require('../services/AuthService');

// Helper to create a fake Express response object we can inspect
function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {

  describe('requireAuth', () => {
    test('blocks requests with no Authorization header', () => {
      const req = { headers: {} };
      const res = mockResponse();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('blocks requests with a malformed Authorization header', () => {
      const req = { headers: { authorization: 'NotBearer sometoken' } };
      const res = mockResponse();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('allows requests with a valid token and attaches req.user', async () => {
      await authService.register('middleware1@example.com', 'password123', 'RESIDENT');
      const { token } = await authService.login('middleware1@example.com', 'password123');

      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = mockResponse();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user.email).toBe('middleware1@example.com');
    });

    test('blocks requests with an invalid token', () => {
      const req = { headers: { authorization: 'Bearer invalid.token.here' } };
      const res = mockResponse();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    test('blocks a RESIDENT user', () => {
      const req = { user: { role: 'RESIDENT' } };
      const res = mockResponse();
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('allows an ADMINISTRATOR user', () => {
      const req = { user: { role: 'ADMINISTRATOR' } };
      const res = mockResponse();
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

});
