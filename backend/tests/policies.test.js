
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Policy = require('../models/Policy');
const Client = require('../models/Client');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Test database
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/insurance_crm_test';

// Test users
let superAdminUser, managerUser, agentUser, superAdminToken, managerToken, agentToken;
let testClient, testPolicy;

describe('Policies API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Clear test data
    await Promise.all([
      Policy.deleteMany({}),
      Client.deleteMany({}),
      User.deleteMany({})
    ]);

    // Create test users
    superAdminUser = await User.create({
      name: 'Super Admin',
      email: 'superadmin@test.com',
      password: 'password123',
      role: 'super_admin',
      status: 'active'
    });

    managerUser = await User.create({
      name: 'Manager User',
      email: 'manager@test.com',
      password: 'password123',
      role: 'manager',
      status: 'active'
    });

    agentUser = await User.create({
      name: 'Agent User',
      email: 'agent@test.com',
      password: 'password123',
      role: 'agent',
      status: 'active'
    });

    // Generate JWT tokens
    superAdminToken = jwt.sign(
      { userId: superAdminUser._id },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    managerToken = jwt.sign(
      { userId: managerUser._id },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    agentToken = jwt.sign(
      { userId: agentUser._id },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    // Create test client
    testClient = await Client.create({
      name: 'Test Client',
      email: 'testclient@example.com',
      phone: '+1234567890',
      type: 'individual',
      status: 'active',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      },
      assignedAgentId: agentUser._id
    });
  });

  afterAll(async () => {
    // Cleanup
    await Promise.all([
      Policy.deleteMany({}),
      Client.deleteMany({}),
      User.deleteMany({})
    ]);
    await mongoose.connection.close();
  });

  describe('POST /api/policies', () => {
    it('should create a new policy with valid data (super admin)', async () => {
      const policyData = {
        policyNumber: 'POL-2024-001',
        clientId: testClient._id.toString(),
        type: 'life',
        status: 'active',
        company: 'Test Insurance Co',
        premium: {
          amount: 1200,
          frequency: 'annual'
        },
        coverage: {
          amount: 100000,
          deductible: 500
        },
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        assignedAgentId: agentUser._id.toString(),
        commission: {
          rate: 10,
          amount: 120
        }
      };

      const response = await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(policyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.policyNumber).toBe(policyData.policyNumber);
      expect(response.body.data.type).toBe(policyData.type);
      
      testPolicy = response.body.data;
    });

    it('should fail to create policy with invalid data', async () => {
      const invalidData = {
        // Missing required fields
        type: 'life'
      };

      const response = await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should fail to create policy as agent (unauthorized)', async () => {
      const policyData = {
        policyNumber: 'POL-2024-002',
        clientId: testClient._id.toString(),
        type: 'health',
        company: 'Test Insurance Co'
      };

      const response = await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(policyData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/policies', () => {
    it('should get all policies (super admin)', async () => {
      const response = await request(app)
        .get('/api/policies')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should get policies with search filter', async () => {
      const response = await request(app)
        .get('/api/policies?search=POL-2024')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get policies with pagination', async () => {
      const response = await request(app)
        .get('/api/policies?page=1&limit=5')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.itemsPerPage).toBe(5);
    });

    it('should get only assigned policies for agent', async () => {
      const response = await request(app)
        .get('/api/policies')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // All returned policies should be assigned to the agent
      response.body.data.forEach(policy => {
        expect(policy.assignedAgentId).toBe(agentUser._id.toString());
      });
    });
  });

  describe('GET /api/policies/:id', () => {
    it('should get policy by ID (super admin)', async () => {
      const response = await request(app)
        .get(`/api/policies/${testPolicy._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testPolicy._id);
      expect(response.body.data.clientId).toBeDefined();
    });

    it('should get policy by ID (assigned agent)', async () => {
      const response = await request(app)
        .get(`/api/policies/${testPolicy._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testPolicy._id);
    });

    it('should fail to get non-existent policy', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/policies/${nonExistentId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/policies/:id', () => {
    it('should update policy (super admin)', async () => {
      const updateData = {
        status: 'active',
        premium: {
          amount: 1300,
          frequency: 'annual'
        }
      };

      const response = await request(app)
        .put(`/api/policies/${testPolicy._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(updateData.status);
      expect(response.body.data.premium.amount).toBe(updateData.premium.amount);
    });

    it('should update policy (assigned agent)', async () => {
      const updateData = {
        nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };

      const response = await request(app)
        .put(`/api/policies/${testPolicy._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail to update with invalid data', async () => {
      const invalidData = {
        premium: {
          amount: -100 // Invalid negative amount
        }
      };

      const response = await request(app)
        .put(`/api/policies/${testPolicy._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/policies/:id/payments', () => {
    it('should add payment record', async () => {
      const paymentData = {
        amount: 1200,
        method: 'bank_transfer',
        transactionId: 'TXN-123456',
        notes: 'Annual premium payment'
      };

      const response = await request(app)
        .post(`/api/policies/${testPolicy._id}/payments`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(paymentData.amount);
      expect(response.body.data.method).toBe(paymentData.method);
    });
  });

  describe('POST /api/policies/:id/renew', () => {
    it('should renew policy', async () => {
      const renewalData = {
        newEndDate: new Date('2025-12-31'),
        premium: 1400,
        notes: 'Annual renewal'
      };

      const response = await request(app)
        .post(`/api/policies/${testPolicy._id}/renew`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(renewalData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.endDate).toBe(renewalData.newEndDate.toISOString());
    });
  });

  describe('POST /api/policies/:id/notes', () => {
    it('should add note to policy', async () => {
      const noteData = {
        content: 'This is a test note for the policy',
        isPrivate: false,
        tags: ['test', 'note']
      };

      const response = await request(app)
        .post(`/api/policies/${testPolicy._id}/notes`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(noteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(noteData.content);
    });
  });

  describe('GET /api/policies/search/:query', () => {
    it('should search policies by query', async () => {
      const response = await request(app)
        .get('/api/policies/search/POL-2024')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail search with short query', async () => {
      const response = await request(app)
        .get('/api/policies/search/P')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/policies/stats/summary', () => {
    it('should get policy statistics (super admin)', async () => {
      const response = await request(app)
        .get('/api/policies/stats/summary')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalPolicies).toBeDefined();
      expect(response.body.data.activePolicies).toBeDefined();
      expect(response.body.data.byType).toBeDefined();
      expect(response.body.data.byStatus).toBeDefined();
    });

    it('should fail to get statistics as agent', async () => {
      const response = await request(app)
        .get('/api/policies/stats/summary')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/policies/:id/assign', () => {
    it('should assign policy to agent (manager)', async () => {
      const assignData = {
        agentId: agentUser._id.toString()
      };

      const response = await request(app)
        .put(`/api/policies/${testPolicy._id}/assign`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(assignData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedAgentId._id).toBe(assignData.agentId);
    });
  });

  describe('DELETE /api/policies/:id', () => {
    it('should delete policy (super admin only)', async () => {
      const response = await request(app)
        .delete(`/api/policies/${testPolicy._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify policy is soft deleted
      const deletedPolicy = await Policy.findById(testPolicy._id);
      expect(deletedPolicy.isDeleted).toBe(true);
    });

    it('should fail to delete as agent', async () => {
      const response = await request(app)
        .delete(`/api/policies/${testPolicy._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/policies')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/policies')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
