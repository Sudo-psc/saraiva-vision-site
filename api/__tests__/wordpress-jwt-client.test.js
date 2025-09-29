import WordPressJWTClient from '../src/wordpress-jwt-client.js';

// Mock environment variables for testing
process.env.WORDPRESS_ADMIN_USER = 'test_user';
process.env.WORDPRESS_ADMIN_PASSWORD = 'test_password';

describe('WordPressJWTClient', () => {
  let client;

  beforeEach(() => {
    client = new WordPressJWTClient();
  });

  test('should initialize with environment variables', () => {
    expect(client.username).toBe('test_user');
    expect(client.password).toBe('test_password');
    expect(client.token).toBeNull();
  });

  test('should detect expired token', () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(client.isTokenExpired(expiredToken)).toBe(true);
  });

  test('should handle invalid token decoding', () => {
    expect(client.isTokenExpired('invalid.token')).toBe(true);
  });

  // Note: Integration tests with real WordPress API would require valid credentials
  // and should be run in a separate environment
});