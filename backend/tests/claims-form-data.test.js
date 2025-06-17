
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

// Mock JWT tokens for different roles
const createMockToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// Mock user data
const mockUsers = {
  superAdmin: {
    _id: '64f8a1b2c3d4e5f6a7b8c9d0',
    role: 'super_admin',
    token: createMockToken('64f8a1b2c3d4e5f6a7b8c9d0', 'super_admin')
  },
  manager: {
    _id: '64f8a1b2c3d4e5f6a7b8c9d1',
    role: 'manager',
    token: createMockToken('64f8a1b2c3d4e5f6a7b8c9d1', 'manager')
  },
  agent1: {
    _id: '64f8a1b2c3d4e5f6a7b8c9d2',
    role: 'agent',
    token: createMockToken('64f8a1b2c3d4e5f6a7b8c9d2', 'agent')
  },
  agent2: {
    _id: '64f8a1b2c3d4e5f6a7b8c9d3',
    role: 'agent',
    token: createMockToken('64f8a1b2c3d4e5f6a7b8c9d3', 'agent')
  }
};

describe('Claims Form Data API', () => {
  
  describe('GET /api/claims/form-data/policies', () => {
    
    test('Super admin should get all policies', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThanOrEqual(0);
    });

    test('Agent should only get assigned policies', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies')
        .set('Authorization', `Bearer ${mockUsers.agent1.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Verify all returned policies are assigned to this agent
      response.body.data.forEach(policy => {
        expect(policy.assignedAgentId).toBe(mockUsers.agent1._id);
      });
    });

    test('Should filter policies by type', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies?type=health')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(policy => {
        expect(policy.type).toBe('health');
      });
    });

    test('Should filter policies by status', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies?status=active')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(policy => {
        expect(policy.status).toBe('active');
      });
    });

    test('Should search policies', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies?search=POL-2025')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('Should limit results', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies?limit=5')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    test('Should require authentication', async () => {
      await request(app)
        .get('/api/claims/form-data/policies')
        .expect(401);
    });

    test('Should reject invalid token', async () => {
      await request(app)
        .get('/api/claims/form-data/policies')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('GET /api/claims/form-data/clients', () => {
    
    test('Super admin should get all clients', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/clients')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThanOrEqual(0);
    });

    test('Agent should only get assigned clients', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/clients')
        .set('Authorization', `Bearer ${mockUsers.agent1.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Verify all returned clients are assigned to this agent
      response.body.data.forEach(client => {
        expect(client.assignedAgentId).toBe(mockUsers.agent1._id);
      });
    });

    test('Should filter clients by type', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/clients?type=individual')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(client => {
        expect(client.clientType).toBe('individual');
      });
    });

    test('Should filter clients by status', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/clients?status=Active')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(client => {
        expect(client.status).toBe('Active');
      });
    });

    test('Should search clients', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/clients?search=john')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/claims/form-data/policy/:policyId', () => {
    
    const testPolicyId = '64f8a1b2c3d4e5f6a7b8c9d0';
    
    test('Super admin should get any policy details', async () => {
      const response = await request(app)
        .get(`/api/claims/form-data/policy/${testPolicyId}`)
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('policyNumber');
      expect(response.body.data).toHaveProperty('clientId');
      expect(response.body.data).toHaveProperty('coverage');
      expect(response.body.data).toHaveProperty('claimsHistory');
    });

    test('Agent should only get assigned policy details', async () => {
      // This would normally fail if policy is not assigned to agent
      const response = await request(app)
        .get(`/api/claims/form-data/policy/${testPolicyId}`)
        .set('Authorization', `Bearer ${mockUsers.agent1.token}`);

      if (response.status === 200) {
        expect(response.body.data.assignedAgentId._id).toBe(mockUsers.agent1._id);
      } else {
        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      }
    });

    test('Should return 404 for non-existent policy', async () => {
      const nonExistentId = '64f8a1b2c3d4e5f6a7b8c999';
      await request(app)
        .get(`/api/claims/form-data/policy/${nonExistentId}`)
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(404);
    });

    test('Should return 400 for invalid policy ID format', async () => {
      await request(app)
        .get('/api/claims/form-data/policy/invalid-id')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(400);
    });

    test('Should require authentication', async () => {
      await request(app)
        .get(`/api/claims/form-data/policy/${testPolicyId}`)
        .expect(401);
    });
  });

  describe('Role-based access control', () => {
    
    test('Agent cannot access other agent\'s policies', async () => {
      // Mock scenario where agent2 tries to access agent1's policy
      const response = await request(app)
        .get('/api/claims/form-data/policies')
        .set('Authorization', `Bearer ${mockUsers.agent2.token}`)
        .expect(200);

      // Should not contain policies assigned to agent1
      response.body.data.forEach(policy => {
        expect(policy.assignedAgentId).not.toBe(mockUsers.agent1._id);
        expect(policy.assignedAgentId).toBe(mockUsers.agent2._id);
      });
    });

    test('Manager should get team policies', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies')
        .set('Authorization', `Bearer ${mockUsers.manager.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      // Manager should get more policies than individual agents
      // but specific team filtering logic would be implemented in controller
    });

    test('Invalid role should be rejected', async () => {
      const invalidToken = createMockToken('64f8a1b2c3d4e5f6a7b8c9d4', 'invalid_role');
      
      await request(app)
        .get('/api/claims/form-data/policies')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(403);
    });
  });

  describe('Query parameter validation', () => {
    
    test('Should handle invalid type parameter', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies?type=invalid_type')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      // Should return empty array or ignore invalid filter
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('Should handle invalid status parameter', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/clients?status=invalid_status')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('Should handle invalid limit parameter', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies?limit=-5')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      // Should use default limit
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('Should handle very large limit parameter', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies?limit=10000')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      // Should cap at maximum allowed limit
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(100); // Assuming max limit is 100
    });
  });

  describe('Performance and pagination', () => {
    
    test('Should return results within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/claims/form-data/policies?limit=50')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Response should be within 2 seconds
      expect(responseTime).toBeLessThan(2000);
    });

    test('Should include total count for pagination', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(typeof response.body.total).toBe('number');
      expect(response.body.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data integrity', () => {
    
    test('Policy data should include required fields', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/policies?limit=1')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      if (response.body.data.length > 0) {
        const policy = response.body.data[0];
        expect(policy).toHaveProperty('_id');
        expect(policy).toHaveProperty('policyNumber');
        expect(policy).toHaveProperty('type');
        expect(policy).toHaveProperty('status');
        expect(policy).toHaveProperty('clientId');
        expect(policy).toHaveProperty('coverage');
        expect(policy).toHaveProperty('premium');
      }
    });

    test('Client data should include required fields', async () => {
      const response = await request(app)
        .get('/api/claims/form-data/clients?limit=1')
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`)
        .expect(200);

      if (response.body.data.length > 0) {
        const client = response.body.data[0];
        expect(client).toHaveProperty('_id');
        expect(client).toHaveProperty('clientId');
        expect(client).toHaveProperty('displayName');
        expect(client).toHaveProperty('email');
        expect(client).toHaveProperty('status');
        expect(client).toHaveProperty('clientType');
      }
    });

    test('Policy details should include claims history', async () => {
      const testPolicyId = '64f8a1b2c3d4e5f6a7b8c9d0';
      
      const response = await request(app)
        .get(`/api/claims/form-data/policy/${testPolicyId}`)
        .set('Authorization', `Bearer ${mockUsers.superAdmin.token}`);

      if (response.status === 200) {
        expect(response.body.data).toHaveProperty('claimsHistory');
        expect(response.body.data.claimsHistory).toHaveProperty('totalClaims');
        expect(response.body.data.claimsHistory).toHaveProperty('settledClaims');
        expect(response.body.data.claimsHistory).toHaveProperty('pendingClaims');
      }
    });
  });
});
