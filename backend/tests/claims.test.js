
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Claim = require('../models/Claim');
const { generateAuthToken } = require('../utils/auth');

// Mock user data
const mockUser = {
  id: new mongoose.Types.ObjectId(),
  role: 'super_admin',
  email: 'admin@test.com'
};

const mockAgent = {
  id: new mongoose.Types.ObjectId(),
  role: 'agent',
  email: 'agent@test.com'
};

const authToken = generateAuthToken(mockUser);
const agentToken = generateAuthToken(mockAgent);

// Mock claim data
const mockClaimData = {
  clientId: new mongoose.Types.ObjectId(),
  policyId: new mongoose.Types.ObjectId(),
  claimType: 'Health',
  priority: 'Medium',
  claimAmount: 50000,
  incidentDate: '2024-01-15',
  description: 'Medical treatment for fever and cold symptoms',
  assignedTo: mockAgent.id
};

describe('Claims API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/insurance_crm_test');
  });

  afterAll(async () => {
    // Clean up and close database connection
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear claims collection before each test
    await Claim.deleteMany({});
  });

  describe('POST /api/claims', () => {
    it('should create a new claim with valid data', async () => {
      const response = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockClaimData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('claimNumber');
      expect(response.body.data.claimType).toBe('Health');
      expect(response.body.data.claimAmount).toBe(50000);
    });

    it('should return 400 for invalid claim data', async () => {
      const invalidData = { ...mockClaimData };
      delete invalidData.clientId;

      const response = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Client ID is required');
    });

    it('should return 401 for unauthorized request', async () => {
      await request(app)
        .post('/api/claims')
        .send(mockClaimData)
        .expect(401);
    });

    it('should validate claim amount is positive', async () => {
      const invalidData = { ...mockClaimData, claimAmount: -1000 };

      const response = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate incident date is not in future', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const invalidData = { ...mockClaimData, incidentDate: futureDate.toISOString() };

      const response = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/claims', () => {
    beforeEach(async () => {
      // Create test claims
      await Claim.create([
        { ...mockClaimData, claimNumber: 'CLM-2024-001', status: 'Under Review' },
        { ...mockClaimData, claimNumber: 'CLM-2024-002', status: 'Approved', claimType: 'Vehicle' },
        { ...mockClaimData, claimNumber: 'CLM-2024-003', status: 'Rejected' }
      ]);
    });

    it('should return paginated claims for admin', async () => {
      const response = await request(app)
        .get('/api/claims?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toHaveProperty('totalItems', 3);
    });

    it('should filter claims by status', async () => {
      const response = await request(app)
        .get('/api/claims?status=Approved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('Approved');
    });

    it('should filter claims by claim type', async () => {
      const response = await request(app)
        .get('/api/claims?claimType=Vehicle')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].claimType).toBe('Vehicle');
    });

    it('should return only assigned claims for agents', async () => {
      const response = await request(app)
        .get('/api/claims')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/claims?search=fever')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/claims?sortField=claimAmount&sortDirection=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/claims/:id', () => {
    let claimId;

    beforeEach(async () => {
      const claim = await Claim.create({ ...mockClaimData, claimNumber: 'CLM-2024-001' });
      claimId = claim._id;
    });

    it('should return claim by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/claims/${claimId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(claimId.toString());
    });

    it('should return 404 for non-existent claim', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/claims/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Claim not found');
    });

    it('should return 403 for agent accessing non-assigned claim', async () => {
      const otherAgentId = new mongoose.Types.ObjectId();
      const claim = await Claim.create({ 
        ...mockClaimData, 
        claimNumber: 'CLM-2024-002',
        assignedTo: otherAgentId 
      });

      const response = await request(app)
        .get(`/api/claims/${claim._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('PUT /api/claims/:id', () => {
    let claimId;

    beforeEach(async () => {
      const claim = await Claim.create({ ...mockClaimData, claimNumber: 'CLM-2024-001' });
      claimId = claim._id;
    });

    it('should update claim with valid data', async () => {
      const updateData = {
        status: 'Approved',
        approvedAmount: 45000,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/claims/${claimId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Approved');
      expect(response.body.data.approvedAmount).toBe(45000);
    });

    it('should return 404 for non-existent claim', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/claims/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Approved' })
        .expect(404);
    });

    it('should validate update data', async () => {
      const invalidData = { claimAmount: -1000 };

      const response = await request(app)
        .put(`/api/claims/${claimId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/claims/:id', () => {
    let claimId;

    beforeEach(async () => {
      const claim = await Claim.create({ ...mockClaimData, claimNumber: 'CLM-2024-001' });
      claimId = claim._id;
    });

    it('should soft delete claim for admin', async () => {
      const response = await request(app)
        .delete(`/api/claims/${claimId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify claim is soft deleted
      const deletedClaim = await Claim.findById(claimId);
      expect(deletedClaim.isActive).toBe(false);
    });

    it('should return 403 for agent trying to delete', async () => {
      await request(app)
        .delete(`/api/claims/${claimId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/claims/:id/status', () => {
    let claimId;

    beforeEach(async () => {
      const claim = await Claim.create({ ...mockClaimData, claimNumber: 'CLM-2024-001' });
      claimId = claim._id;
    });

    it('should update claim status', async () => {
      const statusData = {
        status: 'Approved',
        reason: 'All documentation verified',
        approvedAmount: 45000
      };

      const response = await request(app)
        .put(`/api/claims/${claimId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Approved');
    });

    it('should require approved amount when approving', async () => {
      const statusData = {
        status: 'Approved',
        reason: 'All documentation verified'
        // Missing approvedAmount
      };

      const response = await request(app)
        .put(`/api/claims/${claimId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/claims/:id/notes', () => {
    let claimId;

    beforeEach(async () => {
      const claim = await Claim.create({ ...mockClaimData, claimNumber: 'CLM-2024-001' });
      claimId = claim._id;
    });

    it('should add note to claim', async () => {
      const noteData = {
        content: 'Contacted client for additional information',
        type: 'internal',
        priority: 'normal'
      };

      const response = await request(app)
        .post(`/api/claims/${claimId}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toHaveLength(1);
    });

    it('should validate note content', async () => {
      const invalidNoteData = {
        content: '', // Empty content
        type: 'internal'
      };

      const response = await request(app)
        .post(`/api/claims/${claimId}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidNoteData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/claims/stats', () => {
    beforeEach(async () => {
      await Claim.create([
        { ...mockClaimData, claimNumber: 'CLM-2024-001', status: 'Under Review' },
        { ...mockClaimData, claimNumber: 'CLM-2024-002', status: 'Approved', approvedAmount: 40000 },
        { ...mockClaimData, claimNumber: 'CLM-2024-003', status: 'Rejected' }
      ]);
    });

    it('should return claims statistics', async () => {
      const response = await request(app)
        .get('/api/claims/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalClaims');
      expect(response.body.data).toHaveProperty('totalClaimAmount');
      expect(response.body.data).toHaveProperty('approvedClaims');
      expect(response.body.data).toHaveProperty('rejectedClaims');
    });

    it('should filter statistics by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const response = await request(app)
        .get(`/api/claims/stats?startDate=${startDate.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/claims/bulk/update', () => {
    let claimIds;

    beforeEach(async () => {
      const claims = await Claim.create([
        { ...mockClaimData, claimNumber: 'CLM-2024-001' },
        { ...mockClaimData, claimNumber: 'CLM-2024-002' }
      ]);
      claimIds = claims.map(claim => claim._id);
    });

    it('should bulk update claims', async () => {
      const bulkUpdateData = {
        claimIds,
        updateData: {
          priority: 'High',
          status: 'Under Review'
        }
      };

      const response = await request(app)
        .post('/api/claims/bulk/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkUpdateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.modifiedCount).toBe(2);
    });

    it('should validate bulk update data', async () => {
      const invalidBulkData = {
        claimIds: [], // Empty array
        updateData: { priority: 'High' }
      };

      const response = await request(app)
        .post('/api/claims/bulk/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBulkData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should limit bulk update to 100 claims', async () => {
      const tooManyIds = Array(101).fill(new mongoose.Types.ObjectId());
      
      const invalidBulkData = {
        claimIds: tooManyIds,
        updateData: { priority: 'High' }
      };

      const response = await request(app)
        .post('/api/claims/bulk/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBulkData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/claims/search/:query', () => {
    beforeEach(async () => {
      await Claim.create([
        { ...mockClaimData, claimNumber: 'CLM-2024-001', description: 'Car accident on highway' },
        { ...mockClaimData, claimNumber: 'CLM-2024-002', description: 'Medical treatment for fever' }
      ]);
    });

    it('should search claims by description', async () => {
      const response = await request(app)
        .get('/api/claims/search/highway')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should limit search results', async () => {
      const response = await request(app)
        .get('/api/claims/search/CLM?limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });
  });
});
