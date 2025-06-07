
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Settings = require('../models/Settings');
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
  await Settings.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Settings API', () => {
  
  describe('GET /api/settings', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
    });

    it('should get user settings', async () => {
      // Create user and settings
      await User.create(mockUser);
      const settings = await Settings.create({
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
      await Settings.deleteMany({});
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
      await Settings.create({
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

  describe('PUT /api/settings', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
      await User.create(mockUser);
      
      const settings = await Settings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });
      settingsId = settings._id;
    });

    it('should update settings successfully', async () => {
      const updateData = {
        notifications: {
          emailNotifications: false,
          smsNotifications: true
        }
      };

      const response = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications.emailNotifications).toBe(false);
      expect(response.body.data.notifications.smsNotifications).toBe(true);
    });

    it('should return 404 for non-existent settings', async () => {
      await Settings.deleteMany({});

      await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notifications: { emailNotifications: false } })
        .expect(404);
    });
  });

  describe('PUT /api/settings/profile', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
      await User.create(mockUser);
      
      await Settings.create({
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

    it('should validate phone format', async () => {
      await request(app)
        .put('/api/settings/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ phone: 'invalid-phone' })
        .expect(400);
    });
  });

  describe('PUT /api/settings/notifications', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
      await User.create(mockUser);
      
      await Settings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });
    });

    it('should update notifications successfully', async () => {
      const updateData = {
        emailNotifications: false,
        pushNotifications: false,
        marketingEmails: true
      };

      const response = await request(app)
        .put('/api/settings/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications.emailNotifications).toBe(false);
      expect(response.body.data.notifications.marketingEmails).toBe(true);
    });
  });

  describe('PUT /api/settings/security', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
      await User.create(mockUser);
      
      await Settings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });
    });

    it('should update security settings successfully', async () => {
      const updateData = {
        twoFactorAuth: true,
        sessionTimeout: 60,
        loginAlerts: false
      };

      const response = await request(app)
        .put('/api/settings/security')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.security.twoFactorAuth).toBe(true);
      expect(response.body.data.security.sessionTimeout).toBe(60);
    });

    it('should validate session timeout range', async () => {
      await request(app)
        .put('/api/settings/security')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ sessionTimeout: 200 })
        .expect(400);

      await request(app)
        .put('/api/settings/security')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ sessionTimeout: 2 })
        .expect(400);
    });
  });

  describe('PUT /api/settings/preferences', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
      await User.create(mockUser);
      
      await Settings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });
    });

    it('should update preferences successfully', async () => {
      const updateData = {
        theme: 'dark',
        language: 'es',
        currency: 'EUR',
        itemsPerPage: 50
      };

      const response = await request(app)
        .put('/api/settings/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences.theme).toBe('dark');
      expect(response.body.data.preferences.language).toBe('es');
      expect(response.body.data.preferences.currency).toBe('EUR');
    });

    it('should validate theme values', async () => {
      await request(app)
        .put('/api/settings/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ theme: 'invalid-theme' })
        .expect(400);
    });

    it('should validate itemsPerPage range', async () => {
      await request(app)
        .put('/api/settings/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ itemsPerPage: 200 })
        .expect(400);
    });
  });

  describe('PUT /api/settings/change-password', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
      
      // Create user with hashed password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('oldPassword123!', 12);
      await User.create({
        ...mockUser,
        password: hashedPassword
      });
      
      await Settings.create({
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

    it('should reject invalid current password', async () => {
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

    it('should validate password strength', async () => {
      const passwordData = {
        currentPassword: 'oldPassword123!',
        newPassword: 'weak',
        confirmPassword: 'weak'
      };

      await request(app)
        .put('/api/settings/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);
    });
  });

  describe('POST /api/settings/reset', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
      await User.create(mockUser);
      
      await Settings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });
    });

    it('should reset settings to defaults', async () => {
      const response = await request(app)
        .post('/api/settings/reset')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences.theme).toBe('system');
      expect(response.body.data.notifications.emailNotifications).toBe(true);
    });
  });

  describe('GET /api/settings/export', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
      await User.create(mockUser);
      
      await Settings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });
    });

    it('should export settings successfully', async () => {
      const response = await request(app)
        .get('/api/settings/export')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.settingsId).toBeDefined();
      expect(response.body.data.profile).toBeDefined();
      expect(response.body.data.exportedAt).toBeDefined();
    });
  });

  describe('POST /api/settings/import', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
      await User.create(mockUser);
      
      await Settings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });
    });

    it('should import settings successfully', async () => {
      const importData = {
        settingsData: {
          notifications: {
            emailNotifications: false,
            smsNotifications: true
          },
          preferences: {
            theme: 'dark',
            language: 'es'
          }
        }
      };

      const response = await request(app)
        .post('/api/settings/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send(importData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications.emailNotifications).toBe(false);
      expect(response.body.data.preferences.theme).toBe('dark');
    });

    it('should require settings data', async () => {
      await request(app)
        .post('/api/settings/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/settings/stats', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
      
      // Create super admin user
      const superAdminToken = jwt.sign(
        { userId: mockUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
      
      await User.create({ ...mockUser, role: 'super_admin' });
    });

    it('should get settings statistics for super admin', async () => {
      const superAdminToken = jwt.sign(
        { userId: mockUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      await Settings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });

      const response = await request(app)
        .get('/api/settings/stats')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny access to non-super admin', async () => {
      await request(app)
        .get('/api/settings/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('DELETE /api/settings', () => {
    beforeEach(async () => {
      await Settings.deleteMany({});
      await User.deleteMany({});
      await User.create(mockUser);
      
      await Settings.create({
        ...mockSettings,
        createdBy: mockUser._id,
        updatedBy: mockUser._id
      });
    });

    it('should deactivate settings successfully', async () => {
      const response = await request(app)
        .delete('/api/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify settings are deactivated
      const settings = await Settings.findOne({ userId: mockUser._id });
      expect(settings.isActive).toBe(false);
    });
  });
});
