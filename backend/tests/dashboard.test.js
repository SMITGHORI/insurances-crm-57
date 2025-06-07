
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Client = require('../models/Client');
const Policy = require('../models/Policy');
const jwt = require('jsonwebtoken');

describe('Dashboard Endpoints', () => {
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

    // Create test data
    await Client.create({
      clientId: 'CLI-TEST-001',
      name: 'Test Client',
      email: 'client@test.com',
      phone: '+1234567890',
      status: 'active',
      assignedTo: testUser._id,
      createdBy: testUser._id,
      updatedBy: testUser._id
    });

    await Policy.create({
      policyId: 'POL-TEST-001',
      policyNumber: 'POL123456789',
      clientId: 'CLI-TEST-001',
      policyType: 'auto',
      premium: 1200,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      assignedTo: testUser._id,
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
    await Client.deleteMany({});
    await Policy.deleteMany({});
  });

  describe('GET /api/dashboard/overview', () => {
    it('should get dashboard overview successfully', async () => {
      const res = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('clients');
      expect(res.body.data).toHaveProperty('policies');
      expect(res.body.data).toHaveProperty('claims');
      expect(res.body.data).toHaveProperty('leads');
      expect(res.body.data).toHaveProperty('quotations');
    });
  });

  describe('GET /api/dashboard/performance', () => {
    it('should get performance metrics successfully', async () => {
      const res = await request(app)
        .get('/api/dashboard/performance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('period');
      expect(res.body.data).toHaveProperty('newClients');
      expect(res.body.data).toHaveProperty('newPolicies');
      expect(res.body.data).toHaveProperty('totalRevenue');
    });

    it('should accept different time periods', async () => {
      const res = await request(app)
        .get('/api/dashboard/performance?period=7d')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.period).toBe('7d');
    });
  });

  describe('GET /api/dashboard/charts', () => {
    it('should get charts data successfully', async () => {
      const res = await request(app)
        .get('/api/dashboard/charts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should filter by chart type', async () => {
      const res = await request(app)
        .get('/api/dashboard/charts?type=revenue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/dashboard/quick-actions', () => {
    it('should get quick actions data successfully', async () => {
      const res = await request(app)
        .get('/api/dashboard/quick-actions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pendingClaims');
      expect(res.body.data).toHaveProperty('expiringPolicies');
      expect(res.body.data).toHaveProperty('overdueLeads');
      expect(res.body.data).toHaveProperty('pendingQuotations');
    });
  });
});
