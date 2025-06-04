
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Client = require('../models/Client');
const User = require('../models/User');

describe('Client API Endpoints', () => {
  let authToken;
  let agentToken;
  let testClient;
  let testAgent;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_DATABASE_URL);

    // Create test users
    const adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'super_admin',
      status: 'active'
    });

    testAgent = await User.create({
      name: 'Test Agent',
      email: 'agent@test.com',
      password: 'password123',
      role: 'agent',
      status: 'active'
    });

    // Get auth tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });

    const agentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'agent@test.com',
        password: 'password123'
      });

    authToken = adminLogin.body.token;
    agentToken = agentLogin.body.token;
  });

  afterAll(async () => {
    await Client.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Client.deleteMany({});
  });

  describe('POST /api/clients', () => {
    it('should create individual client successfully', async () => {
      const clientData = {
        clientType: 'individual',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        dob: '1990-01-01',
        gender: 'male',
        panNumber: 'ABCDE1234F',
        assignedAgentId: testAgent._id
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(clientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clientType).toBe('individual');
      expect(response.body.data.clientId).toMatch(/^CL\d{6}$/);
    });

    it('should create corporate client successfully', async () => {
      const clientData = {
        clientType: 'corporate',
        companyName: 'Test Corp Ltd',
        registrationNo: 'REG123456',
        email: 'contact@testcorp.com',
        phone: '9876543210',
        address: '123 Business Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        industry: 'IT',
        employeeCount: 100,
        contactPersonName: 'Jane Smith',
        contactPersonDesignation: 'Manager',
        contactPersonEmail: 'jane@testcorp.com',
        contactPersonPhone: '9876543211',
        assignedAgentId: testAgent._id
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(clientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clientType).toBe('corporate');
    });

    it('should fail validation for invalid email', async () => {
      const clientData = {
        clientType: 'individual',
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        dob: '1990-01-01',
        gender: 'male',
        panNumber: 'ABCDE1234F'
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(clientData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should require authentication', async () => {
      const clientData = {
        clientType: 'individual',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com'
      };

      await request(app)
        .post('/api/clients')
        .send(clientData)
        .expect(401);
    });
  });

  describe('GET /api/clients', () => {
    beforeEach(async () => {
      // Create test clients
      testClient = await Client.create({
        clientType: 'individual',
        email: 'test@example.com',
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        individualData: {
          firstName: 'Test',
          lastName: 'User',
          dob: new Date('1990-01-01'),
          gender: 'male',
          panNumber: 'ABCDE1234F'
        },
        assignedAgentId: testAgent._id,
        createdBy: testAgent._id
      });
    });

    it('should get all clients for admin', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toBeDefined();
    });

    it('should get only assigned clients for agent', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]._id).toBe(testClient._id.toString());
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/clients?search=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should support filtering by type', async () => {
      const response = await request(app)
        .get('/api/clients?type=individual')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(client => client.clientType === 'individual')).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/clients?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.itemsPerPage).toBe(5);
    });
  });

  describe('GET /api/clients/:id', () => {
    beforeEach(async () => {
      testClient = await Client.create({
        clientType: 'individual',
        email: 'test@example.com',
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        individualData: {
          firstName: 'Test',
          lastName: 'User',
          dob: new Date('1990-01-01'),
          gender: 'male',
          panNumber: 'ABCDE1234F'
        },
        assignedAgentId: testAgent._id,
        createdBy: testAgent._id
      });
    });

    it('should get client by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/clients/${testClient._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testClient._id.toString());
    });

    it('should get assigned client for agent', async () => {
      const response = await request(app)
        .get(`/api/clients/${testClient._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testClient._id.toString());
    });

    it('should return 404 for non-existent client', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/clients/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/api/clients/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/clients/:id', () => {
    beforeEach(async () => {
      testClient = await Client.create({
        clientType: 'individual',
        email: 'test@example.com',
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        individualData: {
          firstName: 'Test',
          lastName: 'User',
          dob: new Date('1990-01-01'),
          gender: 'male',
          panNumber: 'ABCDE1234F'
        },
        assignedAgentId: testAgent._id,
        createdBy: testAgent._id
      });
    });

    it('should update client successfully', async () => {
      const updateData = {
        phone: '9876543999',
        address: '456 Updated Street'
      };

      const response = await request(app)
        .put(`/api/clients/${testClient._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.phone).toBe('9876543999');
    });

    it('should allow agent to update assigned client', async () => {
      const updateData = {
        notes: 'Updated by agent'
      };

      const response = await request(app)
        .put(`/api/clients/${testClient._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/clients/:id', () => {
    beforeEach(async () => {
      testClient = await Client.create({
        clientType: 'individual',
        email: 'test@example.com',
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        individualData: {
          firstName: 'Test',
          lastName: 'User',
          dob: new Date('1990-01-01'),
          gender: 'male',
          panNumber: 'ABCDE1234F'
        },
        assignedAgentId: testAgent._id,
        createdBy: testAgent._id
      });
    });

    it('should delete client successfully for admin', async () => {
      const response = await request(app)
        .delete(`/api/clients/${testClient._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Client deleted successfully');

      // Verify client is deleted
      const deletedClient = await Client.findById(testClient._id);
      expect(deletedClient).toBeNull();
    });

    it('should not allow agent to delete client', async () => {
      await request(app)
        .delete(`/api/clients/${testClient._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });
});
