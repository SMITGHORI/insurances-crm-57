
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Client = require('../models/Client');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

describe('Export API Endpoints', () => {
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

  describe('POST /api/clients/export', () => {
    it('should export all clients as CSV for admin', async () => {
      const exportData = {
        format: 'csv',
        type: 'all'
      };

      const response = await request(app)
        .post('/api/clients/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportData)
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="clients_export_.*\.csv"/);
    });

    it('should export clients as Excel for admin', async () => {
      const exportData = {
        format: 'excel',
        type: 'all'
      };

      const response = await request(app)
        .post('/api/clients/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportData)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="clients_export_.*\.xlsx"/);
    });

    it('should export selected clients only', async () => {
      const exportData = {
        format: 'csv',
        type: 'selected',
        selectedIds: [testClient._id.toString()]
      };

      const response = await request(app)
        .post('/api/clients/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportData)
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
    });

    it('should export filtered clients', async () => {
      const exportData = {
        format: 'csv',
        type: 'filtered',
        filters: {
          type: 'individual',
          status: 'Active'
        }
      };

      const response = await request(app)
        .post('/api/clients/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportData)
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
    });

    it('should export clients within date range', async () => {
      const exportData = {
        format: 'csv',
        type: 'dateRange',
        filters: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      };

      const response = await request(app)
        .post('/api/clients/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportData)
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
    });

    it('should allow agent to export only assigned clients', async () => {
      const exportData = {
        format: 'csv',
        type: 'all'
      };

      const response = await request(app)
        .post('/api/clients/export')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(exportData)
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
    });

    it('should fail validation for invalid export type', async () => {
      const exportData = {
        format: 'csv',
        type: 'invalid'
      };

      await request(app)
        .post('/api/clients/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportData)
        .expect(400);
    });

    it('should fail validation for missing selectedIds when type is selected', async () => {
      const exportData = {
        format: 'csv',
        type: 'selected'
      };

      await request(app)
        .post('/api/clients/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportData)
        .expect(400);
    });

    it('should require authentication', async () => {
      const exportData = {
        format: 'csv',
        type: 'all'
      };

      await request(app)
        .post('/api/clients/export')
        .send(exportData)
        .expect(401);
    });
  });
});
