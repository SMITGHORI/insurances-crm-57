
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const UserSettings = require('../models/UserSettings');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Mock data
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'agent',
  status: 'active'
};

const mockSettings = {
  userId: mockUser._id,
  userName: mockUser.name,
  profile: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    jobTitle: 'Insurance Agent'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true
  },
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    dashboardLayout: 'comfortable',
    itemsPerPage: 20
  },
  privacy: {
    profileVisibility: 'team',
    activityVisibility: 'team',
    dataSharing: false,
    analytics: true
  }
};

let authToken;
let settingsId;

// Generate auth token
beforeAll(() => {
  authToken = jwt.sign(
    { userId: mockUser._id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
});

// Clean up after tests
afterAll(async () => {
  await UserSettings.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Settings API', () => {
  
  describe('GET /api/settings', () => {
    beforeEach(async () => {
      await UserSettings.deleteMany({});
      await User.deleteMany({});
    });

    it('should get user settings', async () => {
      // Create user and settings
      await User.create(mockUser);
      const settings = await UserSettings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });
      settingsId = settings._id;

      const response = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId.toString()).toBe(mockUser._id.toString());
      expect(response.body.data.profile.name).toBe(mockSettings.profile.name);
    });

    it('should create default settings if none exist', async () => {
      await User.create(mockUser);

      const response = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.profile.name).toBe(mockUser.name);
      expect(response.body.data.profile.email).toBe(mockUser.email);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/settings')
        .expect(401);
    });
  });

  describe('POST /api/settings', () => {
    beforeEach(async () => {
      await UserSettings.deleteMany({});
      await User.deleteMany({});
      await User.create(mockUser);
    });

    it('should create settings successfully', async () => {
      const response = await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockSettings)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.profile.name).toBe(mockSettings.profile.name);
      expect(response.body.data.settingsId).toBeDefined();
    });

    it('should not create duplicate settings', async () => {
      await UserSettings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });

      await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockSettings)
        .expect(400);
    });

    it('should validate required fields', async () => {
      const invalidSettings = { ...mockSettings };
      delete invalidSettings.profile.name;

      await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidSettings)
        .expect(400);
    });
  });

  describe('PUT /api/settings/profile', () => {
    beforeEach(async () => {
      await UserSettings.deleteMany({});
      await User.deleteMany({});
      await User.create(mockUser);
      
      await UserSettings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });
    });

    it('should update profile successfully', async () => {
      const updateData = {
        name: 'John Updated',
        jobTitle: 'Senior Agent'
      };

      const response = await request(app)
        .put('/api/settings/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.profile.name).toBe('John Updated');
      expect(response.body.data.profile.jobTitle).toBe('Senior Agent');
    });

    it('should validate email format', async () => {
      await request(app)
        .put('/api/settings/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('PUT /api/settings/change-password', () => {
    beforeEach(async () => {
      await UserSettings.deleteMany({});
      await User.deleteMany({});
      
      // Create user with hashed password
      const hashedPassword = await require('bcryptjs').hash('oldPassword123!', 12);
      await User.create({
        ...mockUser,
        password: hashedPassword
      });
      
      await UserSettings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });
    });

    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'oldPassword123!',
        newPassword: 'newPassword123!',
        confirmPassword: 'newPassword123!'
      };

      const response = await request(app)
        .put('/api/settings/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');
    });

    it('should reject incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123!',
        confirmPassword: 'newPassword123!'
      };

      await request(app)
        .put('/api/settings/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);
    });
  });
});
