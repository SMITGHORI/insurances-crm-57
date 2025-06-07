
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Activity = require('../models/Activity');
const User = require('../models/User');

describe('Activities API', () => {
  let agentToken, managerToken, superAdminToken;
  let agentUser, managerUser, superAdminUser;
  let testActivity, testClient;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI);
    
    // Clean up existing data
    await Activity.deleteMany({});
    await User.deleteMany({});
    
    // Create test users
    agentUser = await User.create({
      firstName: 'Test',
      lastName: 'Agent',
      email: 'agent@test.com',
      password: 'password123',
      role: 'agent',
      phone: '1234567890'
    });

    managerUser = await User.create({
      firstName: 'Test',
      lastName: 'Manager',
      email: 'manager@test.com',
      password: 'password123',
      role: 'manager',
      phone: '1234567891'
    });

    superAdminUser = await User.create({
      firstName: 'Test',
      lastName: 'SuperAdmin',
      email: 'superadmin@test.com',
      password: 'password123',
      role: 'super_admin',
      phone: '1234567892'
    });

    // Login users and get tokens
    const agentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'agent@test.com', password: 'password123' });
    agentToken = agentLogin.body.data.token;

    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@test.com', password: 'password123' });
    managerToken = managerLogin.body.data.token;

    const superAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@test.com', password: 'password123' });
    superAdminToken = superAdminLogin.body.data.token;
  });

  afterAll(async () => {
    await Activity.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Activity.deleteMany({});
    
    // Create test activity
    testActivity = await Activity.create({
      action: 'Test activity created',
      type: 'client',
      description: 'This is a test activity',
      details: 'Detailed information about the test activity',
      entityType: 'client',
      entityId: new mongoose.Types.ObjectId(),
      entityName: 'Test Entity',
      agentId: agentUser._id,
      agentName: `${agentUser.firstName} ${agentUser.lastName}`,
      userId: agentUser._id,
      userName: `${agentUser.firstName} ${agentUser.lastName}`,
      priority: 'medium',
      createdBy: agentUser._id,
      updatedBy: agentUser._id
    });
  });

  describe('POST /api/activities', () => {
    it('should create a new activity with valid data', async () => {
      const activityData = {
        action: 'New client registered',
        type: 'client',
        description: 'A new client has been registered in the system',
        entityType: 'client',
        entityId: new mongoose.Types.ObjectId().toString(),
        entityName: 'John Doe',
        agentId: agentUser._id.toString(),
        agentName: `${agentUser.firstName} ${agentUser.lastName}`,
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.action).toBe(activityData.action);
      expect(response.body.data.type).toBe(activityData.type);
      expect(response.body.data.priority).toBe(activityData.priority);
      expect(response.body.data.activityId).toMatch(/^ACT-\d{6}-\d{6}$/);
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        action: 'A', // Too short
        type: 'invalid_type',
        description: '' // Required field
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });

    it('should return 401 without authentication', async () => {
      const activityData = {
        action: 'Test activity',
        type: 'client',
        description: 'Test description',
        entityType: 'client',
        entityId: new mongoose.Types.ObjectId().toString(),
        entityName: 'Test Entity',
        agentId: agentUser._id.toString(),
        agentName: 'Test Agent'
      };

      await request(app)
        .post('/api/activities')
        .send(activityData)
        .expect(401);
    });
  });

  describe('GET /api/activities', () => {
    beforeEach(async () => {
      // Create multiple test activities
      await Activity.create([
        {
          action: 'Policy created',
          type: 'policy',
          description: 'New policy created',
          entityType: 'policy',
          entityId: new mongoose.Types.ObjectId(),
          entityName: 'Policy 001',
          agentId: agentUser._id,
          agentName: `${agentUser.firstName} ${agentUser.lastName}`,
          userId: agentUser._id,
          userName: `${agentUser.firstName} ${agentUser.lastName}`,
          priority: 'high',
          createdBy: agentUser._id,
          updatedBy: agentUser._id
        },
        {
          action: 'Claim processed',
          type: 'claim',
          description: 'Claim has been processed',
          entityType: 'claim',
          entityId: new mongoose.Types.ObjectId(),
          entityName: 'Claim 001',
          agentId: managerUser._id,
          agentName: `${managerUser.firstName} ${managerUser.lastName}`,
          userId: managerUser._id,
          userName: `${managerUser.firstName} ${managerUser.lastName}`,
          priority: 'critical',
          createdBy: managerUser._id,
          updatedBy: managerUser._id
        }
      ]);
    });

    it('should get all activities with pagination', async () => {
      const response = await request(app)
        .get('/api/activities?page=1&limit=10')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toHaveProperty('currentPage');
      expect(response.body.data.pagination).toHaveProperty('totalCount');
    });

    it('should filter activities by type', async () => {
      const response = await request(app)
        .get('/api/activities?type=policy')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toBeInstanceOf(Array);
      response.body.data.activities.forEach(activity => {
        expect(activity.type).toBe('policy');
      });
    });

    it('should filter activities by priority', async () => {
      const response = await request(app)
        .get('/api/activities?priority=critical')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.activities.forEach(activity => {
        expect(activity.priority).toBe('critical');
      });
    });

    it('should limit agent access to own activities', async () => {
      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.activities.forEach(activity => {
        expect([agentUser._id.toString()]).toContain(activity.agentId.toString());
      });
    });

    it('should allow managers to see all activities', async () => {
      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/activities/:id', () => {
    it('should get activity by ID', async () => {
      const response = await request(app)
        .get(`/api/activities/${testActivity._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testActivity._id.toString());
      expect(response.body.data.action).toBe(testActivity.action);
    });

    it('should return 404 for non-existent activity', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/activities/${fakeId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Activity not found');
    });

    it('should restrict agent access to own activities', async () => {
      // Create activity by manager
      const managerActivity = await Activity.create({
        action: 'Manager activity',
        type: 'system',
        description: 'Manager created activity',
        entityType: 'client',
        entityId: new mongoose.Types.ObjectId(),
        entityName: 'Manager Entity',
        agentId: managerUser._id,
        agentName: `${managerUser.firstName} ${managerUser.lastName}`,
        userId: managerUser._id,
        userName: `${managerUser.firstName} ${managerUser.lastName}`,
        createdBy: managerUser._id,
        updatedBy: managerUser._id
      });

      const response = await request(app)
        .get(`/api/activities/${managerActivity._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('PUT /api/activities/:id', () => {
    it('should update activity with valid data', async () => {
      const updateData = {
        action: 'Updated activity action',
        description: 'Updated description',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/activities/${testActivity._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.action).toBe(updateData.action);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    it('should return validation error for invalid update data', async () => {
      const invalidData = {
        priority: 'invalid_priority'
      };

      const response = await request(app)
        .put(`/api/activities/${testActivity._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });

    it('should return 404 for non-existent activity', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = { action: 'Updated action' };

      const response = await request(app)
        .put(`/api/activities/${fakeId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Activity not found');
    });
  });

  describe('DELETE /api/activities/:id', () => {
    it('should allow managers to delete activities', async () => {
      const response = await request(app)
        .delete(`/api/activities/${testActivity._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Activity deleted successfully');

      // Verify activity is soft deleted
      const deletedActivity = await Activity.findById(testActivity._id);
      expect(deletedActivity.isVisible).toBe(false);
      expect(deletedActivity.status).toBe('hidden');
    });

    it('should deny agent access to delete activities', async () => {
      const response = await request(app)
        .delete(`/api/activities/${testActivity._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied');
    });

    it('should return 404 for non-existent activity', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/activities/${fakeId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Activity not found');
    });
  });

  describe('GET /api/activities/stats', () => {
    beforeEach(async () => {
      // Create test activities for stats
      await Activity.create([
        {
          action: 'Client created',
          type: 'client',
          description: 'New client',
          entityType: 'client',
          entityId: new mongoose.Types.ObjectId(),
          entityName: 'Client 1',
          agentId: agentUser._id,
          agentName: `${agentUser.firstName} ${agentUser.lastName}`,
          userId: agentUser._id,
          userName: `${agentUser.firstName} ${agentUser.lastName}`,
          priority: 'high',
          createdBy: agentUser._id,
          updatedBy: agentUser._id
        },
        {
          action: 'Policy created',
          type: 'policy',
          description: 'New policy',
          entityType: 'policy',
          entityId: new mongoose.Types.ObjectId(),
          entityName: 'Policy 1',
          agentId: agentUser._id,
          agentName: `${agentUser.firstName} ${agentUser.lastName}`,
          userId: agentUser._id,
          userName: `${agentUser.firstName} ${agentUser.lastName}`,
          priority: 'critical',
          createdBy: agentUser._id,
          updatedBy: agentUser._id
        }
      ]);
    });

    it('should get activity statistics', async () => {
      const response = await request(app)
        .get('/api/activities/stats')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('recent');
      expect(response.body.data).toHaveProperty('byType');
      expect(response.body.data.byType).toBeInstanceOf(Array);
    });

    it('should filter stats by agent', async () => {
      const response = await request(app)
        .get(`/api/activities/stats?agentId=${agentUser._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBeGreaterThan(0);
    });
  });

  describe('GET /api/activities/search/:query', () => {
    beforeEach(async () => {
      await Activity.create({
        action: 'Searchable activity',
        type: 'client',
        description: 'This activity can be found by search',
        entityType: 'client',
        entityId: new mongoose.Types.ObjectId(),
        entityName: 'Searchable Entity',
        agentId: agentUser._id,
        agentName: `${agentUser.firstName} ${agentUser.lastName}`,
        userId: agentUser._id,
        userName: `${agentUser.firstName} ${agentUser.lastName}`,
        createdBy: agentUser._id,
        updatedBy: agentUser._id
      });
    });

    it('should search activities by text', async () => {
      const response = await request(app)
        .get('/api/activities/search/searchable')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return validation error for short search query', async () => {
      const response = await request(app)
        .get('/api/activities/search/a')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least 2 characters');
    });
  });

  describe('POST /api/activities/bulk', () => {
    let activity1, activity2;

    beforeEach(async () => {
      activity1 = await Activity.create({
        action: 'Bulk test activity 1',
        type: 'client',
        description: 'First bulk test activity',
        entityType: 'client',
        entityId: new mongoose.Types.ObjectId(),
        entityName: 'Entity 1',
        agentId: agentUser._id,
        agentName: `${agentUser.firstName} ${agentUser.lastName}`,
        userId: agentUser._id,
        userName: `${agentUser.firstName} ${agentUser.lastName}`,
        createdBy: agentUser._id,
        updatedBy: agentUser._id
      });

      activity2 = await Activity.create({
        action: 'Bulk test activity 2',
        type: 'policy',
        description: 'Second bulk test activity',
        entityType: 'policy',
        entityId: new mongoose.Types.ObjectId(),
        entityName: 'Entity 2',
        agentId: agentUser._id,
        agentName: `${agentUser.firstName} ${agentUser.lastName}`,
        userId: agentUser._id,
        userName: `${agentUser.firstName} ${agentUser.lastName}`,
        createdBy: agentUser._id,
        updatedBy: agentUser._id
      });
    });

    it('should archive multiple activities', async () => {
      const bulkData = {
        activityIds: [activity1._id.toString(), activity2._id.toString()],
        action: 'archive'
      };

      const response = await request(app)
        .post('/api/activities/bulk')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(bulkData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.affected).toBe(2);

      // Verify activities are archived
      const archivedActivities = await Activity.find({
        _id: { $in: [activity1._id, activity2._id] }
      });
      archivedActivities.forEach(activity => {
        expect(activity.status).toBe('archived');
      });
    });

    it('should add tags to multiple activities', async () => {
      const bulkData = {
        activityIds: [activity1._id.toString(), activity2._id.toString()],
        action: 'addTag',
        value: 'important'
      };

      const response = await request(app)
        .post('/api/activities/bulk')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(bulkData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.affected).toBe(2);

      // Verify tags are added
      const taggedActivities = await Activity.find({
        _id: { $in: [activity1._id, activity2._id] }
      });
      taggedActivities.forEach(activity => {
        expect(activity.tags).toContain('important');
      });
    });

    it('should deny agent access to delete via bulk action', async () => {
      const bulkData = {
        activityIds: [activity1._id.toString()],
        action: 'delete'
      };

      const response = await request(app)
        .post('/api/activities/bulk')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(bulkData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied for delete operation');
    });
  });
});
