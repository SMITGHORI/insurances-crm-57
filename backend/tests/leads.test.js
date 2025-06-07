
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Lead = require('../models/Lead');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Leads API', () => {
  let authToken;
  let agentToken;
  let userId;
  let agentId;
  let leadId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/insurance_test');
    
    // Create test users
    const adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'super_admin',
      status: 'active'
    });

    const agentUser = await User.create({
      name: 'Test Agent',
      email: 'agent@test.com',
      password: 'password123',
      role: 'agent',
      status: 'active'
    });

    userId = adminUser._id;
    agentId = agentUser._id;

    // Generate auth tokens
    authToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET);
    agentToken = jwt.sign({ userId: agentId }, process.env.JWT_SECRET);
  });

  beforeEach(async () => {
    // Clear leads collection before each test
    await Lead.deleteMany({});
  });

  afterAll(async () => {
    // Clean up test data
    await Lead.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/leads', () => {
    it('should create a new lead with valid data', async () => {
      const leadData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '9876543210',
        address: '123 Main Street, Mumbai',
        source: 'Website',
        product: 'Health Insurance',
        status: 'New',
        budget: 500000,
        assignedTo: {
          agentId: agentId,
          name: 'Test Agent'
        },
        priority: 'High',
        additionalInfo: 'Looking for family health insurance'
      };

      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(leadData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(leadData.name);
      expect(response.body.data.email).toBe(leadData.email);
      expect(response.body.data.leadId).toMatch(/^LD\d{6}$/);
      
      leadId = response.body.data._id;
    });

    it('should return validation error for invalid email', async () => {
      const leadData = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '9876543210',
        source: 'Website',
        product: 'Health Insurance',
        assignedTo: {
          name: 'Test Agent'
        }
      };

      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(leadData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return validation error for missing required fields', async () => {
      const leadData = {
        name: 'John Doe'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(leadData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should auto-assign to agent if agent creates lead', async () => {
      const leadData = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '9876543211',
        source: 'Cold Call',
        product: 'Life Insurance',
        assignedTo: {
          name: 'Test Agent'
        }
      };

      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(leadData)
        .expect(201);

      expect(response.body.data.assignedTo.agentId).toBe(agentId.toString());
    });
  });

  describe('GET /api/leads', () => {
    beforeEach(async () => {
      // Create test leads
      await Lead.create([
        {
          leadId: 'LD000001',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210',
          source: 'Website',
          product: 'Health Insurance',
          status: 'New',
          assignedTo: { agentId: agentId, name: 'Test Agent' },
          priority: 'High'
        },
        {
          leadId: 'LD000002',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '9876543211',
          source: 'Referral',
          product: 'Life Insurance',
          status: 'In Progress',
          assignedTo: { agentId: agentId, name: 'Test Agent' },
          priority: 'Medium'
        }
      ]);
    });

    it('should get all leads with default pagination', async () => {
      const response = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.leads).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalItems).toBe(2);
    });

    it('should filter leads by status', async () => {
      const response = await request(app)
        .get('/api/leads?status=New')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.leads).toHaveLength(1);
      expect(response.body.data.leads[0].status).toBe('New');
    });

    it('should search leads by text', async () => {
      const response = await request(app)
        .get('/api/leads?search=john')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.leads).toHaveLength(1);
      expect(response.body.data.leads[0].name).toBe('John Doe');
    });

    it('should sort leads by specified field', async () => {
      const response = await request(app)
        .get('/api/leads?sortBy=name&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.leads[0].name).toBe('Jane Smith');
      expect(response.body.data.leads[1].name).toBe('John Doe');
    });

    it('should only return assigned leads for agents', async () => {
      const response = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.data.leads).toHaveLength(2);
      response.body.data.leads.forEach(lead => {
        expect(lead.assignedTo.agentId).toBe(agentId.toString());
      });
    });
  });

  describe('GET /api/leads/:id', () => {
    beforeEach(async () => {
      const lead = await Lead.create({
        leadId: 'LD000001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        source: 'Website',
        product: 'Health Insurance',
        assignedTo: { agentId: agentId, name: 'Test Agent' }
      });
      leadId = lead._id;
    });

    it('should get lead by ID', async () => {
      const response = await request(app)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data._id).toBe(leadId.toString());
    });

    it('should return 404 for non-existent lead', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/leads/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lead not found');
    });

    it('should deny access for agents to unassigned leads', async () => {
      // Create lead assigned to different agent
      const otherLead = await Lead.create({
        leadId: 'LD000002',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '9876543211',
        source: 'Website',
        product: 'Health Insurance',
        assignedTo: { agentId: userId, name: 'Other Agent' }
      });

      const response = await request(app)
        .get(`/api/leads/${otherLead._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('PUT /api/leads/:id', () => {
    beforeEach(async () => {
      const lead = await Lead.create({
        leadId: 'LD000001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        source: 'Website',
        product: 'Health Insurance',
        assignedTo: { agentId: agentId, name: 'Test Agent' }
      });
      leadId = lead._id;
    });

    it('should update lead with valid data', async () => {
      const updateData = {
        status: 'In Progress',
        priority: 'High',
        additionalInfo: 'Updated information'
      };

      const response = await request(app)
        .put(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('In Progress');
      expect(response.body.data.priority).toBe('High');
      expect(response.body.data.additionalInfo).toBe('Updated information');
    });

    it('should return validation error for invalid status', async () => {
      const updateData = {
        status: 'Invalid Status'
      };

      const response = await request(app)
        .put(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('DELETE /api/leads/:id', () => {
    beforeEach(async () => {
      const lead = await Lead.create({
        leadId: 'LD000001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        source: 'Website',
        product: 'Health Insurance',
        assignedTo: { agentId: agentId, name: 'Test Agent' }
      });
      leadId = lead._id;
    });

    it('should delete lead (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Lead deleted successfully');

      // Verify lead is deleted
      const deletedLead = await Lead.findById(leadId);
      expect(deletedLead).toBeNull();
    });

    it('should deny delete access to agents', async () => {
      const response = await request(app)
        .delete(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('POST /api/leads/:id/followups', () => {
    beforeEach(async () => {
      const lead = await Lead.create({
        leadId: 'LD000001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        source: 'Website',
        product: 'Health Insurance',
        assignedTo: { agentId: agentId, name: 'Test Agent' }
      });
      leadId = lead._id;
    });

    it('should add follow-up to lead', async () => {
      const followUpData = {
        date: new Date('2024-12-20'),
        time: '14:30',
        type: 'Call',
        outcome: 'Discussed insurance options',
        nextAction: 'Send brochure'
      };

      const response = await request(app)
        .post(`/api/leads/${leadId}/followups`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(followUpData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.followUps).toHaveLength(1);
      expect(response.body.data.followUps[0].outcome).toBe('Discussed insurance options');
    });

    it('should return validation error for invalid follow-up data', async () => {
      const followUpData = {
        date: 'invalid-date',
        type: 'Invalid Type'
      };

      const response = await request(app)
        .post(`/api/leads/${leadId}/followups`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(followUpData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/leads/:id/notes', () => {
    beforeEach(async () => {
      const lead = await Lead.create({
        leadId: 'LD000001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        source: 'Website',
        product: 'Health Insurance',
        assignedTo: { agentId: agentId, name: 'Test Agent' }
      });
      leadId = lead._id;
    });

    it('should add note to lead', async () => {
      const noteData = {
        content: 'Customer is interested in premium plan'
      };

      const response = await request(app)
        .post(`/api/leads/${leadId}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toHaveLength(1);
      expect(response.body.data.notes[0].content).toBe('Customer is interested in premium plan');
    });
  });

  describe('PUT /api/leads/:id/assign', () => {
    beforeEach(async () => {
      const lead = await Lead.create({
        leadId: 'LD000001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        source: 'Website',
        product: 'Health Insurance',
        assignedTo: { agentId: userId, name: 'Admin User' }
      });
      leadId = lead._id;
    });

    it('should assign lead to agent', async () => {
      const assignmentData = {
        agentId: agentId,
        agentName: 'Test Agent'
      };

      const response = await request(app)
        .put(`/api/leads/${leadId}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(assignmentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedTo.agentId).toBe(agentId.toString());
      expect(response.body.data.assignedTo.name).toBe('Test Agent');
    });
  });

  describe('POST /api/leads/:id/convert', () => {
    beforeEach(async () => {
      const lead = await Lead.create({
        leadId: 'LD000001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        source: 'Website',
        product: 'Health Insurance',
        status: 'Qualified',
        assignedTo: { agentId: agentId, name: 'Test Agent' }
      });
      leadId = lead._id;
    });

    it('should convert lead to client', async () => {
      const response = await request(app)
        .post(`/api/leads/${leadId}/convert`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clientId).toMatch(/^CL/);
      
      // Verify lead status is updated
      const updatedLead = await Lead.findById(leadId);
      expect(updatedLead.status).toBe('Converted');
    });

    it('should not convert already converted lead', async () => {
      // First conversion
      await request(app)
        .post(`/api/leads/${leadId}/convert`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Second conversion attempt
      const response = await request(app)
        .post(`/api/leads/${leadId}/convert`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lead is already converted');
    });
  });

  describe('GET /api/leads/stats', () => {
    beforeEach(async () => {
      await Lead.create([
        {
          leadId: 'LD000001',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210',
          source: 'Website',
          product: 'Health Insurance',
          status: 'New',
          assignedTo: { agentId: agentId, name: 'Test Agent' },
          priority: 'High'
        },
        {
          leadId: 'LD000002',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '9876543211',
          source: 'Referral',
          product: 'Life Insurance',
          status: 'Converted',
          assignedTo: { agentId: agentId, name: 'Test Agent' },
          priority: 'Medium'
        }
      ]);
    });

    it('should get leads statistics', async () => {
      const response = await request(app)
        .get('/api/leads/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLeads).toBe(2);
      expect(response.body.data.newLeads).toBe(1);
      expect(response.body.data.converted).toBe(1);
      expect(response.body.data.conversionRate).toBe('50.0');
    });
  });

  describe('GET /api/leads/search/:query', () => {
    beforeEach(async () => {
      await Lead.create([
        {
          leadId: 'LD000001',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210',
          source: 'Website',
          product: 'Health Insurance',
          assignedTo: { agentId: agentId, name: 'Test Agent' }
        },
        {
          leadId: 'LD000002',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '9876543211',
          source: 'Referral',
          product: 'Life Insurance',
          assignedTo: { agentId: agentId, name: 'Test Agent' }
        }
      ]);
    });

    it('should search leads by name', async () => {
      const response = await request(app)
        .get('/api/leads/search/john')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('John Doe');
    });

    it('should return empty results for no matches', async () => {
      const response = await request(app)
        .get('/api/leads/search/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return error for short search query', async () => {
      const response = await request(app)
        .get('/api/leads/search/a')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Search query must be at least 2 characters');
    });
  });
});
