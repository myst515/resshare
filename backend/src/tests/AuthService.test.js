const authService = require('../services/AuthService');

describe('AuthService', () => {

  // Test 4: successful registration
  test('register() creates a new user with RESIDENT role by default', async () => {
    const user = await authService.register('resident1@example.com', 'password123');
    expect(user.email).toBe('resident1@example.com');
    expect(user.role).toBe('RESIDENT');
    expect(user.id).toBeDefined();
  });

  // Test 5: duplicate email
  test('register() throws an error when the email is already registered', async () => {
    await authService.register('duplicate@example.com', 'password123');
    await expect(
      authService.register('duplicate@example.com', 'password456')
    ).rejects.toThrow('DuplicateEmailError');
  });

  // Test 1: successful login
  test('login() returns a valid token for correct credentials', async () => {
    await authService.register('login1@example.com', 'correctpassword');
    const result = await authService.login('login1@example.com', 'correctpassword');
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('login1@example.com');
  });

  // Test 2: wrong password
  test('login() throws an error for an incorrect password', async () => {
    await authService.register('login2@example.com', 'correctpassword');
    await expect(
      authService.login('login2@example.com', 'wrongpassword')
    ).rejects.toThrow('InvalidCredentialsError');
  });

  // Test 3: non-existent email
  test('login() throws an error for an email that is not registered', async () => {
    await expect(
      authService.login('doesnotexist@example.com', 'anypassword')
    ).rejects.toThrow('UserNotFoundError');
  });

  // Test 8: expired/invalid token
  test('validateToken() throws an error for an invalid token', () => {
    expect(() => {
      authService.validateToken('this.is.not.a.valid.token');
    }).toThrow('TokenInvalidError');
  });

  // validateToken() success case
  test('validateToken() returns the correct user for a valid token', async () => {
    await authService.register('tokencheck@example.com', 'password123');
    const { token } = await authService.login('tokencheck@example.com', 'password123');
    const user = authService.validateToken(token);
    expect(user.email).toBe('tokencheck@example.com');
  });

  // Test 6: isAdmin() false for resident
  test('isAdmin() returns false for a RESIDENT user', async () => {
    await authService.register('resident2@example.com', 'password123', 'RESIDENT');
    const { token } = await authService.login('resident2@example.com', 'password123');
    expect(authService.isAdmin(token)).toBe(false);
  });

  // Test 7: isAdmin() true for administrator
  test('isAdmin() returns true for an ADMINISTRATOR user', async () => {
    await authService.register('admin1@example.com', 'password123', 'ADMINISTRATOR');
    const { token } = await authService.login('admin1@example.com', 'password123');
    expect(authService.isAdmin(token)).toBe(true);
  });

});