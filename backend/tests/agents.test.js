
const request = require('supertest');
const app = require('../app');
const Agent = require('../models/Agent');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('Agents API', () => {
  let authToken;
  let testAgent;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI);
    }

    // Create test user
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      role: 'super_admin',
      password: 'hashedPassword'
    });
    await testUser.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, role: testUser.role },
      process.env.JWT_SECRET
    );
  });

  beforeEach(async () => {
    // Clean up agents collection
    await Agent.deleteMany({});

    // Create test agent
    testAgent = new Agent({
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1234567890',
      specialization: 'Life Insurance',
      region: 'North',
      licenseNumber: 'LIC123456',
      licenseExpiry: new Date('2025-12-31'),
      hireDate: new Date('2024-01-01'),
      commissionRate: 10.5,
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      createdBy: testUser._id
    });
    await testAgent.save();
  });

  afterAll(async () => {
    await Agent.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/agents', () => {
    it('should return all agents for super admin', async () => {
      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('John Smith');
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter agents by status', async () => {
      // Create inactive agent
      await new Agent({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+1234567891',
        specialization: 'Health Insurance',
        region: 'South',
        licenseNumber: 'LIC789012',
        licenseExpiry: new Date('2025-12-31'),
        hireDate: new Date('2024-01-01'),
        commissionRate: 12.0,
        status: 'inactive',
        address: {
          street: '456 Oak Ave',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'USA'
        },
        createdBy: testUser._id
      }).save();

      const res = await request(app)
        .get('/api/agents?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('active');
    });

    it('should search agents by name', async () => {
      const res = await request(app)
        .get('/api/agents?search=John')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toContain('John');
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/agents?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.itemsPerPage).toBe(1);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/agents')
        .expect(401);
    });
  });

  describe('GET /api/agents/:id', () => {
    it('should return agent by ID', async () => {
      const res = await request(app)
        .get(`/api/agents/${testAgent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('John Smith');
      expect(res.body.data.email).toBe('john.smith@example.com');
    });

    it('should return 404 for non-existent agent', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/agents/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid agent ID', async () => {
      await request(app)
        .get('/api/agents/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /api/agents', () => {
    const validAgentData = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1234567891',
      specialization: 'Health Insurance',
      region: 'South',
      licenseNumber: 'LIC789012',
      licenseExpiry: '2025-12-31',
      hireDate: '2024-02-01',
      commissionRate: 12.0,
      address: {
        street: '456 Oak Ave',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'USA'
      }
    };

    it('should create a new agent', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validAgentData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Jane Doe');
      expect(res.body.data.agentId).toMatch(/^AGT-\d{4}-\d{3}$/);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = { ...validAgentData };
      delete invalidData.name;

      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should return 400 for duplicate email', async () => {
      const duplicateData = { ...validAgentData };
      duplicateData.email = testAgent.email;

      await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = { ...validAgentData };
      invalidData.email = 'invalid-email';

      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 for invalid commission rate', async () => {
      const invalidData = { ...validAgentData };
      invalidData.commissionRate = 150; // Over 100%

      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/agents/:id', () => {
    it('should update an existing agent', async () => {
      const updateData = {
        name: 'John Smith Updated',
        commissionRate: 15.0
      };

      const res = await request(app)
        .put(`/api/agents/${testAgent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('John Smith Updated');
      expect(res.body.data.commissionRate).toBe(15.0);
    });

    it('should return 404 for non-existent agent', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/agents/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        email: 'invalid-email-format'
      };

      const res = await request(app)
        .put(`/api/agents/${testAgent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('should soft delete an agent', async () => {
      const res = await request(app)
        .delete(`/api/agents/${testAgent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify agent is soft deleted
      const deletedAgent = await Agent.findById(testAgent._id);
      expect(deletedAgent.isDeleted).toBe(true);
      expect(deletedAgent.status).toBe('terminated');
    });

    it('should return 404 for non-existent agent', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .delete(`/api/agents/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/agents/:id/notes', () => {
    it('should add a note to an agent', async () => {
      const noteData = {
        content: 'Excellent performance this quarter',
        isPrivate: false,
        tags: ['performance', 'review'],
        priority: 'high'
      };

      const res = await request(app)
        .post(`/api/agents/${testAgent._id}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe(noteData.content);
      expect(res.body.data.tags).toEqual(noteData.tags);
    });

    it('should return 400 for empty note content', async () => {
      const invalidData = {
        content: '',
        isPrivate: false
      };

      const res = await request(app)
        .post(`/api/agents/${testAgent._id}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/agents/:id/performance', () => {
    it('should return agent performance data', async () => {
      const res = await request(app)
        .get(`/api/agents/${testAgent._id}/performance`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.overview).toBeDefined();
      expect(res.body.data.monthlyData).toBeDefined();
      expect(res.body.data.targets).toBeDefined();
    });

    it('should filter performance by year', async () => {
      const res = await request(app)
        .get(`/api/agents/${testAgent._id}/performance?year=2024`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.monthlyData).toHaveLength(12);
    });
  });

  describe('GET /api/agents/search/:query', () => {
    it('should search agents by query', async () => {
      const res = await request(app)
        .get('/api/agents/search/John')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toContain('John');
    });

    it('should limit search results', async () => {
      const res = await request(app)
        .get('/api/agents/search/Smith?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/agents/stats/summary', () => {
    it('should return agent statistics', async () => {
      const res = await request(app)
        .get('/api/agents/stats/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAgents).toBeDefined();
      expect(res.body.data.activeAgents).toBeDefined();
      expect(res.body.data.bySpecialization).toBeDefined();
      expect(res.body.data.byRegion).toBeDefined();
    });
  });

  describe('PUT /api/agents/:id/targets', () => {
    it('should update agent performance targets', async () => {
      const targetsData = {
        monthly: {
          policies: 10,
          premium: 15000
        },
        quarterly: {
          policies: 30,
          premium: 45000
        }
      };

      const res = await request(app)
        .put(`/api/agents/${testAgent._id}/targets`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(targetsData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.monthlyTargets.policies).toBe(10);
      expect(res.body.data.quarterlyTargets.premium).toBe(45000);
    });

    it('should return 400 for invalid targets', async () => {
      const invalidData = {
        monthly: {
          policies: -5, // Negative value
          premium: 15000
        }
      };

      const res = await request(app)
        .put(`/api/agents/${testAgent._id}/targets`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/agents/bulk/update', () => {
    it('should bulk update agents', async () => {
      const bulkData = {
        agentIds: [testAgent._id],
        updateData: {
          status: 'inactive',
          commissionRate: 8.0
        }
      };

      const res = await request(app)
        .post('/api/agents/bulk/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('1 agents updated');

      // Verify the update
      const updatedAgent = await Agent.findById(testAgent._id);
      expect(updatedAgent.status).toBe('inactive');
      expect(updatedAgent.commissionRate).toBe(8.0);
    });

    it('should return 400 for empty agent IDs array', async () => {
      const invalidData = {
        agentIds: [],
        updateData: { status: 'inactive' }
      };

      const res = await request(app)
        .post('/api/agents/bulk/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/agents/export', () => {
    it('should export agents data', async () => {
      const res = await request(app)
        .get('/api/agents/export')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('John Smith');
      expect(res.body.totalRecords).toBe(1);
    });

    it('should filter export by status', async () => {
      const res = await request(app)
        .get('/api/agents/export?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('Role-based access control', () => {
    let agentUser;
    let agentToken;

    beforeEach(async () => {
      // Create agent user
      agentUser = new User({
        name: 'Agent User',
        email: 'agent@example.com',
        role: 'agent',
        password: 'hashedPassword'
      });
      await agentUser.save();

      agentToken = jwt.sign(
        { userId: agentUser._id, role: agentUser.role },
        process.env.JWT_SECRET
      );
    });

    afterEach(async () => {
      await User.findByIdAndDelete(agentUser._id);
    });

    it('should allow agent to view own profile', async () => {
      // Update test agent to match agent user ID
      await Agent.findByIdAndUpdate(testAgent._id, { _id: agentUser._id });

      const res = await request(app)
        .get(`/api/agents/${agentUser._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should prevent agent from creating new agents', async () => {
      const agentData = {
        name: 'New Agent',
        email: 'new@example.com',
        phone: '+1234567892',
        specialization: 'Auto Insurance',
        region: 'West',
        licenseNumber: 'LIC999999',
        licenseExpiry: '2025-12-31',
        hireDate: '2024-01-01',
        commissionRate: 10.0,
        address: {
          street: '789 Pine St',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        }
      };

      await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(agentData)
        .expect(403);
    });

    it('should prevent agent from deleting agents', async () => {
      await request(app)
        .delete(`/api/agents/${testAgent._id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });
});
