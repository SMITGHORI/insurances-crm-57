
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Assuming you have an Express app setup
const Claim = require('../models/Claim');
const Client = require('../models/Client');
const Policy = require('../models/Policy');
const User = require('../models/User');

describe('Claims API', () => {
  let authToken;
  let testUser;
  let testClient;
  let testPolicy;
  let testClaim;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/test_crm');
  });

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'Agent',
      email: 'test.agent@test.com',
      password: 'hashedpassword',
      role: 'agent',
      status: 'active'
    });

    // Create test client
    testClient = await Client.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      phone: '+1234567890',
      dateOfBirth: new Date('1980-01-01'),
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'Test Country'
      },
      assignedAgentId: testUser._id,
      status: 'Active',
      createdBy: testUser._id
    });

    // Create test policy
    testPolicy = await Policy.create({
      policyNumber: 'POL-2024-001',
      clientId: testClient._id,
      policyType: 'Auto Insurance',
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      premiumAmount: 1200,
      coverageAmount: 100000,
      assignedAgentId: testUser._id,
      createdBy: testUser._id
    });

    // Mock JWT token
    authToken = 'Bearer mock-jwt-token';
  });

  afterEach(async () => {
    // Clean up collections
    await Claim.deleteMany({});
    await Policy.deleteMany({});
    await Client.deleteMany({});
    await User.deleteMany({});
  });

  describe('POST /api/claims', () => {
    test('should create a new claim with valid data', async () => {
      const claimData = {
        clientId: testClient._id.toString(),
        policyId: testPolicy._id.toString(),
        claimType: 'Auto',
        priority: 'High',
        claimAmount: 25000,
        incidentDate: '2024-01-15',
        description: 'Vehicle collision on Highway 101, significant damage to front end',
        assignedTo: testUser._id.toString(),
        estimatedSettlement: '2024-02-15'
      };

      const response = await request(app)
        .post('/api/claims')
        .set('Authorization', authToken)
        .send(claimData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.claimNumber).toMatch(/^CLM-\d{4}-\d{3,6}$/);
      expect(response.body.data.claimType).toBe('Auto');
      expect(response.body.data.claimAmount).toBe(25000);
    });

    test('should fail when required fields are missing', async () => {
      const invalidData = {
        claimType: 'Auto',
        claimAmount: 25000
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/claims')
        .set('Authorization', authToken)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should fail when claim amount exceeds policy coverage', async () => {
      const claimData = {
        clientId: testClient._id.toString(),
        policyId: testPolicy._id.toString(),
        claimType: 'Auto',
        claimAmount: 150000, // Exceeds policy coverage of 100000
        incidentDate: '2024-01-15',
        description: 'Vehicle collision on Highway 101',
        assignedTo: testUser._id.toString()
      };

      const response = await request(app)
        .post('/api/claims')
        .set('Authorization', authToken)
        .send(claimData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('exceeds policy coverage');
    });

    test('should fail with invalid claim type', async () => {
      const claimData = {
        clientId: testClient._id.toString(),
        policyId: testPolicy._id.toString(),
        claimType: 'InvalidType',
        claimAmount: 25000,
        incidentDate: '2024-01-15',
        description: 'Vehicle collision on Highway 101',
        assignedTo: testUser._id.toString()
      };

      const response = await request(app)
        .post('/api/claims')
        .set('Authorization', authToken)
        .send(claimData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0].message).toContain('Invalid claim type');
    });
  });

  describe('GET /api/claims', () => {
    beforeEach(async () => {
      // Create test claims
      testClaim = await Claim.create({
        clientId: testClient._id,
        policyId: testPolicy._id,
        claimType: 'Auto',
        priority: 'High',
        claimAmount: 25000,
        incidentDate: new Date('2024-01-15'),
        description: 'Vehicle collision test claim',
        assignedTo: testUser._id,
        createdBy: testUser._id
      });
    });

    test('should get all claims with pagination', async () => {
      const response = await request(app)
        .get('/api/claims?page=1&limit=10')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.currentPage).toBe(1);
    });

    test('should filter claims by status', async () => {
      const response = await request(app)
        .get('/api/claims?status=Reported')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(claim => {
        expect(claim.status).toBe('Reported');
      });
    });

    test('should search claims by claim number', async () => {
      const response = await request(app)
        .get(`/api/claims?search=${testClaim.claimNumber}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].claimNumber).toBe(testClaim.claimNumber);
    });

    test('should sort claims by claim amount', async () => {
      const response = await request(app)
        .get('/api/claims?sortField=claimAmount&sortDirection=desc')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 1) {
        expect(response.body.data[0].claimAmount).toBeGreaterThanOrEqual(
          response.body.data[1].claimAmount
        );
      }
    });
  });

  describe('GET /api/claims/:id', () => {
    beforeEach(async () => {
      testClaim = await Claim.create({
        clientId: testClient._id,
        policyId: testPolicy._id,
        claimType: 'Auto',
        priority: 'High',
        claimAmount: 25000,
        incidentDate: new Date('2024-01-15'),
        description: 'Vehicle collision test claim',
        assignedTo: testUser._id,
        createdBy: testUser._id
      });
    });

    test('should get claim by valid ID', async () => {
      const response = await request(app)
        .get(`/api/claims/${testClaim._id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testClaim._id.toString());
      expect(response.body.data.claimType).toBe('Auto');
    });

    test('should return 404 for non-existent claim', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/claims/${nonExistentId}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Claim not found');
    });

    test('should return 400 for invalid claim ID format', async () => {
      const response = await request(app)
        .get('/api/claims/invalid-id')
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid claim ID');
    });
  });

  describe('PUT /api/claims/:id', () => {
    beforeEach(async () => {
      testClaim = await Claim.create({
        clientId: testClient._id,
        policyId: testPolicy._id,
        claimType: 'Auto',
        priority: 'High',
        claimAmount: 25000,
        incidentDate: new Date('2024-01-15'),
        description: 'Vehicle collision test claim',
        assignedTo: testUser._id,
        createdBy: testUser._id
      });
    });

    test('should update claim with valid data', async () => {
      const updateData = {
        priority: 'Urgent',
        description: 'Updated description - urgent review required',
        approvedAmount: 22000
      };

      const response = await request(app)
        .put(`/api/claims/${testClaim._id}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe('Urgent');
      expect(response.body.data.approvedAmount).toBe(22000);
    });

    test('should fail when approved amount exceeds claim amount', async () => {
      const updateData = {
        approvedAmount: 30000 // Exceeds claim amount of 25000
      };

      const response = await request(app)
        .put(`/api/claims/${testClaim._id}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('exceed claim amount');
    });
  });

  describe('PUT /api/claims/:id/status', () => {
    beforeEach(async () => {
      testClaim = await Claim.create({
        clientId: testClient._id,
        policyId: testPolicy._id,
        claimType: 'Auto',
        priority: 'High',
        claimAmount: 25000,
        incidentDate: new Date('2024-01-15'),
        description: 'Vehicle collision test claim',
        assignedTo: testUser._id,
        createdBy: testUser._id
      });
    });

    test('should update claim status successfully', async () => {
      const statusData = {
        status: 'Approved',
        reason: 'All documentation verified',
        approvedAmount: 22000
      };

      const response = await request(app)
        .put(`/api/claims/${testClaim._id}/status`)
        .set('Authorization', authToken)
        .send(statusData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Approved');
      expect(response.body.data.approvedAmount).toBe(22000);
    });

    test('should require approved amount when status is Approved', async () => {
      const statusData = {
        status: 'Approved',
        reason: 'All documentation verified'
        // Missing approvedAmount
      };

      const response = await request(app)
        .put(`/api/claims/${testClaim._id}/status`)
        .set('Authorization', authToken)
        .send(statusData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0].message).toContain('Approved amount is required');
    });
  });

  describe('POST /api/claims/:id/notes', () => {
    beforeEach(async () => {
      testClaim = await Claim.create({
        clientId: testClient._id,
        policyId: testPolicy._id,
        claimType: 'Auto',
        priority: 'High',
        claimAmount: 25000,
        incidentDate: new Date('2024-01-15'),
        description: 'Vehicle collision test claim',
        assignedTo: testUser._id,
        createdBy: testUser._id
      });
    });

    test('should add note to claim successfully', async () => {
      const noteData = {
        content: 'Contacted client for additional documentation',
        type: 'internal',
        priority: 'normal'
      };

      const response = await request(app)
        .post(`/api/claims/${testClaim._id}/notes`)
        .set('Authorization', authToken)
        .send(noteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(noteData.content);
      expect(response.body.data.type).toBe('internal');
    });

    test('should fail with empty note content', async () => {
      const noteData = {
        content: '',
        type: 'internal'
      };

      const response = await request(app)
        .post(`/api/claims/${testClaim._id}/notes`)
        .set('Authorization', authToken)
        .send(noteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0].message).toContain('cannot be empty');
    });
  });

  describe('GET /api/claims/stats/summary', () => {
    beforeEach(async () => {
      // Create multiple test claims for statistics
      await Claim.create([
        {
          clientId: testClient._id,
          policyId: testPolicy._id,
          claimType: 'Auto',
          status: 'Reported',
          priority: 'High',
          claimAmount: 25000,
          incidentDate: new Date('2024-01-15'),
          description: 'Test claim 1',
          assignedTo: testUser._id,
          createdBy: testUser._id
        },
        {
          clientId: testClient._id,
          policyId: testPolicy._id,
          claimType: 'Home',
          status: 'Approved',
          priority: 'Medium',
          claimAmount: 15000,
          approvedAmount: 12000,
          incidentDate: new Date('2024-01-10'),
          description: 'Test claim 2',
          assignedTo: testUser._id,
          createdBy: testUser._id
        }
      ]);
    });

    test('should get claims statistics successfully', async () => {
      const response = await request(app)
        .get('/api/claims/stats/summary')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalClaims).toBeGreaterThan(0);
      expect(response.body.data.statusBreakdown).toBeInstanceOf(Array);
      expect(response.body.data.typeBreakdown).toBeInstanceOf(Array);
      expect(response.body.data.amountStats).toBeDefined();
    });

    test('should filter statistics by period', async () => {
      const response = await request(app)
        .get('/api/claims/stats/summary?period=week')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('week');
    });
  });

  describe('POST /api/claims/bulk/update', () => {
    let claimIds;

    beforeEach(async () => {
      const claims = await Claim.create([
        {
          clientId: testClient._id,
          policyId: testPolicy._id,
          claimType: 'Auto',
          priority: 'Medium',
          claimAmount: 20000,
          incidentDate: new Date('2024-01-15'),
          description: 'Test claim 1',
          assignedTo: testUser._id,
          createdBy: testUser._id
        },
        {
          clientId: testClient._id,
          policyId: testPolicy._id,
          claimType: 'Home',
          priority: 'Low',
          claimAmount: 15000,
          incidentDate: new Date('2024-01-10'),
          description: 'Test claim 2',
          assignedTo: testUser._id,
          createdBy: testUser._id
        }
      ]);

      claimIds = claims.map(claim => claim._id.toString());
    });

    test('should bulk update claims successfully', async () => {
      const bulkData = {
        claimIds,
        updateData: {
          priority: 'High',
          status: 'Under Review'
        }
      };

      const response = await request(app)
        .post('/api/claims/bulk/update')
        .set('Authorization', authToken)
        .send(bulkData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.modifiedCount).toBe(2);
    });

    test('should fail with empty claim IDs array', async () => {
      const bulkData = {
        claimIds: [],
        updateData: {
          priority: 'High'
        }
      };

      const response = await request(app)
        .post('/api/claims/bulk/update')
        .set('Authorization', authToken)
        .send(bulkData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0].message).toContain('At least one claim ID is required');
    });

    test('should fail with empty update data', async () => {
      const bulkData = {
        claimIds,
        updateData: {}
      };

      const response = await request(app)
        .post('/api/claims/bulk/update')
        .set('Authorization', authToken)
        .send(bulkData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0].message).toContain('At least one field to update is required');
    });
  });

  describe('GET /api/claims/search/:query', () => {
    beforeEach(async () => {
      testClaim = await Claim.create({
        clientId: testClient._id,
        policyId: testPolicy._id,
        claimType: 'Auto',
        priority: 'High',
        claimAmount: 25000,
        incidentDate: new Date('2024-01-15'),
        description: 'Vehicle collision on Highway 101 with significant damage',
        assignedTo: testUser._id,
        createdBy: testUser._id
      });
    });

    test('should search claims by description', async () => {
      const response = await request(app)
        .get('/api/claims/search/collision')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].description).toContain('collision');
    });

    test('should limit search results', async () => {
      const response = await request(app)
        .get('/api/claims/search/test?limit=5')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('DELETE /api/claims/:id', () => {
    beforeEach(async () => {
      testClaim = await Claim.create({
        clientId: testClient._id,
        policyId: testPolicy._id,
        claimType: 'Auto',
        priority: 'High',
        claimAmount: 25000,
        incidentDate: new Date('2024-01-15'),
        description: 'Vehicle collision test claim',
        assignedTo: testUser._id,
        createdBy: testUser._id
      });
    });

    test('should soft delete claim successfully', async () => {
      const response = await request(app)
        .delete(`/api/claims/${testClaim._id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Claim deleted successfully');

      // Verify soft delete
      const deletedClaim = await Claim.findById(testClaim._id);
      expect(deletedClaim.isDeleted).toBe(true);
      expect(deletedClaim.status).toBe('Deleted');
    });

    test('should return 404 for already deleted claim', async () => {
      // First delete
      await request(app)
        .delete(`/api/claims/${testClaim._id}`)
        .set('Authorization', authToken)
        .expect(200);

      // Try to delete again
      const response = await request(app)
        .delete(`/api/claims/${testClaim._id}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Claim not found');
    });
  });
});
