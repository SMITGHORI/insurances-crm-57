
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

describe('Header Endpoints', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      userId: 'USR-TEST-001',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'agent',
      status: 'active'
    });

    await Settings.create({
      settingsId: 'SET-TEST-001',
      userId: testUser._id,
      userName: testUser.name,
      profile: {
        name: testUser.name,
        email: testUser.email,
        phone: '+1234567890',
        jobTitle: 'Insurance Agent',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Experienced insurance agent'
      },
      createdBy: testUser._id,
      updatedBy: testUser._id
    });

    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Settings.deleteMany({});
  });

  describe('GET /api/header/profile', () => {
    it('should get profile data successfully', async () => {
      const res = await request(app)
        .get('/api/header/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(testUser.name);
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.jobTitle).toBe('Insurance Agent');
    });
  });

  describe('GET /api/header/notifications', () => {
    it('should get notifications successfully', async () => {
      const res = await request(app)
        .get('/api/header/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('notifications');
      expect(res.body.data).toHaveProperty('unreadCount');
      expect(res.body.data).toHaveProperty('totalCount');
    });

    it('should limit notifications correctly', async () => {
      const res = await request(app)
        .get('/api/header/notifications?limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.notifications.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/header/messages', () => {
    it('should get messages successfully', async () => {
      const res = await request(app)
        .get('/api/header/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('messages');
      expect(res.body.data).toHaveProperty('unreadCount');
      expect(res.body.data).toHaveProperty('totalCount');
    });
  });

  describe('PUT /api/header/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const res = await request(app)
        .put('/api/header/notifications/1/read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Notification marked as read');
    });
  });
});
