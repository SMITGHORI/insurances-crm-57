
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Auth Endpoints', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      userId: 'USR-TEST-001',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'agent',
      status: 'active'
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/auth/logout')
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get authenticated user successfully', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.name).toBe(testUser.name);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh session successfully', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Session refreshed');
    });
  });
});
