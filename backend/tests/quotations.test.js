
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Quotation = require('../models/Quotation');
const User = require('../models/User');
const Client = require('../models/Client');

describe('Quotations API', () => {
  let authToken;
  let agentToken;
  let testUser;
  let testAgent;
  let testClient;
  let testQuotation;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  beforeEach(async () => {
    // Clean database
    await Quotation.deleteMany({});
    await User.deleteMany({});
    await Client.deleteMany({});

    // Create test users
    testUser = await User.create({
      name: 'Test Manager',
      email: 'manager@test.com',
      password: 'password123',
      role: 'manager'
    });

    testAgent = await User.create({
      name: 'Test Agent',
      email: 'agent@test.com',
      password: 'password123',
      role: 'agent'
    });

    // Create test client
    testClient = await Client.create({
      name: 'Test Client',
      email: 'client@test.com',
      phone: '+1234567890',
      address: 'Test Address'
    });

    // Generate auth tokens
    authToken = testUser.generateAuthToken();
    agentToken = testAgent.generateAuthToken();

    // Create test quotation
    testQuotation = await Quotation.create({
      clientId: testClient._id,
      clientName: testClient.name,
      insuranceType: 'Health Insurance',
      insuranceCompany: 'Test Insurance Co',
      products: ['Health Plan A'],
      sumInsured: 500000,
      premium: 25000,
      agentId: testAgent._id,
      agentName: testAgent.name,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy: testAgent._id,
      updatedBy: testAgent._id
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/quotations', () => {
    it('should get all quotations for manager', async () => {
      const response = await request(app)
        .get('/api/quotations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quotations).toHaveLength(1);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should get only agent quotations for agent role', async () => {
      const response = await request(app)
        .get('/api/quotations')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quotations).toHaveLength(1);
      expect(response.body.data.quotations[0].agentId).toBe(testAgent._id.toString());
    });

    it('should filter quotations by status', async () => {
      const response = await request(app)
        .get('/api/quotations?status=draft')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quotations[0].status).toBe('draft');
    });

    it('should search quotations', async () => {
      const response = await request(app)
        .get('/api/quotations?search=Test Client')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quotations).toHaveLength(1);
    });
  });

  describe('GET /api/quotations/:id', () => {
    it('should get quotation by ID', async () => {
      const response = await request(app)
        .get(`/api/quotations/${testQuotation._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quoteId).toBe(testQuotation.quoteId);
    });

    it('should return 404 for non-existent quotation', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/quotations/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should deny access for agent to other agent quotations', async () => {
      const otherAgent = await User.create({
        name: 'Other Agent',
        email: 'other@test.com',
        password: 'password123',
        role: 'agent'
      });

      const otherToken = otherAgent.generateAuthToken();

      await request(app)
        .get(`/api/quotations/${testQuotation._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('POST /api/quotations', () => {
    const validQuotationData = {
      clientId: '',
      clientName: 'New Client',
      insuranceType: 'Life Insurance',
      insuranceCompany: 'Life Insurance Co',
      products: ['Term Life Plan'],
      sumInsured: 1000000,
      premium: 15000,
      agentId: '',
      agentName: 'Test Agent',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    beforeEach(() => {
      validQuotationData.clientId = testClient._id.toString();
      validQuotationData.agentId = testAgent._id.toString();
    });

    it('should create quotation with valid data', async () => {
      const response = await request(app)
        .post('/api/quotations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validQuotationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clientName).toBe(validQuotationData.clientName);
      expect(response.body.data.quoteId).toMatch(/^QT-\d{4}-\d{4}$/);
    });

    it('should fail with missing required fields', async () => {
      const invalidData = { ...validQuotationData };
      delete invalidData.clientName;

      await request(app)
        .post('/api/quotations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should fail with invalid insurance type', async () => {
      const invalidData = {
        ...validQuotationData,
        insuranceType: 'Invalid Type'
      };

      await request(app)
        .post('/api/quotations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should auto-assign agent for agent role', async () => {
      const response = await request(app)
        .post('/api/quotations')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(validQuotationData)
        .expect(201);

      expect(response.body.data.agentId).toBe(testAgent._id.toString());
    });
  });

  describe('PUT /api/quotations/:id', () => {
    it('should update quotation with valid data', async () => {
      const updateData = {
        premium: 30000,
        notes: 'Updated notes'
      };

      const response = await request(app)
        .put(`/api/quotations/${testQuotation._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.premium).toBe(30000);
      expect(response.body.data.notes).toBe('Updated notes');
    });

    it('should prevent updating accepted quotation', async () => {
      await Quotation.findByIdAndUpdate(testQuotation._id, { status: 'accepted' });

      const updateData = { premium: 30000 };

      await request(app)
        .put(`/api/quotations/${testQuotation._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/quotations/:id', () => {
    it('should delete quotation', async () => {
      await request(app)
        .delete(`/api/quotations/${testQuotation._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const quotation = await Quotation.findById(testQuotation._id);
      expect(quotation).toBeNull();
    });

    it('should prevent deletion of accepted quotation', async () => {
      await Quotation.findByIdAndUpdate(testQuotation._id, { status: 'accepted' });

      await request(app)
        .delete(`/api/quotations/${testQuotation._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should deny agent access to other agent quotations', async () => {
      const otherAgent = await User.create({
        name: 'Other Agent',
        email: 'other@test.com',
        password: 'password123',
        role: 'agent'
      });

      const otherToken = otherAgent.generateAuthToken();

      await request(app)
        .delete(`/api/quotations/${testQuotation._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('POST /api/quotations/:id/send', () => {
    it('should send quotation and update status', async () => {
      const emailData = {
        emailTo: 'client@test.com',
        emailSubject: 'Your Quotation',
        emailMessage: 'Please review the attached quotation'
      };

      const response = await request(app)
        .post(`/api/quotations/${testQuotation._id}/send`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(emailData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('sent');
      expect(response.body.data.emailSent).toBe(true);
      expect(response.body.data.sentDate).toBeDefined();
    });
  });

  describe('PUT /api/quotations/:id/status', () => {
    it('should update quotation status to viewed', async () => {
      // First send the quotation
      await testQuotation.markAsSent();

      const statusData = { status: 'viewed' };

      const response = await request(app)
        .put(`/api/quotations/${testQuotation._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('viewed');
      expect(response.body.data.viewedAt).toBeDefined();
    });

    it('should update quotation status to rejected with reason', async () => {
      const statusData = {
        status: 'rejected',
        rejectionReason: 'Premium too high'
      };

      const response = await request(app)
        .put(`/api/quotations/${testQuotation._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('rejected');
      expect(response.body.data.rejectionReason).toBe('Premium too high');
    });
  });

  describe('GET /api/quotations/stats', () => {
    it('should get quotation statistics', async () => {
      const response = await request(app)
        .get('/api/quotations/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalQuotations).toBe(1);
      expect(response.body.data.statusBreakdown).toBeDefined();
      expect(response.body.data.premiumStats).toBeDefined();
      expect(response.body.data.conversionRate).toBeDefined();
    });
  });

  describe('GET /api/quotations/search/:query', () => {
    it('should search quotations by query', async () => {
      const response = await request(app)
        .get('/api/quotations/search/Test Client')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].clientName).toContain('Test Client');
    });
  });
});
