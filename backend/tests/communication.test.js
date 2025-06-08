
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { Communication, LoyaltyPoints, Offer } = require('../models/Communication');
const Client = require('../models/Client');
const User = require('../models/User');

describe('Communication API', () => {
  let authToken;
  let testClient;
  let testAgent;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_DB_URI || 'mongodb://localhost:27017/test-crm');
    
    // Create test agent
    testAgent = new User({
      name: 'Test Agent',
      email: 'agent@test.com',
      password: 'password123',
      role: 'agent'
    });
    await testAgent.save();

    // Create test client
    testClient = new Client({
      clientId: 'CL000001',
      clientType: 'individual',
      email: 'client@test.com',
      phone: '9876543210',
      address: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      individualData: {
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date('1990-01-15'),
        gender: 'male',
        panNumber: 'ABCDE1234F'
      },
      assignedAgentId: testAgent._id,
      createdBy: testAgent._id
    });
    await testClient.save();

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'agent@test.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await Communication.deleteMany({});
    await LoyaltyPoints.deleteMany({});
    await Offer.deleteMany({});
    await Client.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Communication.deleteMany({});
    await LoyaltyPoints.deleteMany({});
    await Offer.deleteMany({});
  });

  describe('GET /api/communication', () => {
    it('should get all communications for agent', async () => {
      // Create test communication
      const communication = new Communication({
        clientId: testClient._id,
        type: 'birthday',
        channel: 'email',
        subject: 'Happy Birthday!',
        content: 'Wishing you a very happy birthday!',
        agentId: testAgent._id,
        status: 'sent'
      });
      await communication.save();

      const response = await request(app)
        .get('/api/communication')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('birthday');
    });

    it('should filter communications by type', async () => {
      // Create test communications
      await Communication.create([
        {
          clientId: testClient._id,
          type: 'birthday',
          channel: 'email',
          subject: 'Happy Birthday!',
          content: 'Birthday message',
          agentId: testAgent._id
        },
        {
          clientId: testClient._id,
          type: 'offer',
          channel: 'email',
          subject: 'Special Offer',
          content: 'Offer message',
          agentId: testAgent._id
        }
      ]);

      const response = await request(app)
        .get('/api/communication?type=birthday')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('birthday');
    });
  });

  describe('POST /api/communication', () => {
    it('should send a communication successfully', async () => {
      const communicationData = {
        clientId: testClient._id.toString(),
        type: 'custom',
        channel: 'email',
        subject: 'Test Subject',
        content: 'Test content for communication'
      };

      const response = await request(app)
        .post('/api/communication')
        .set('Authorization', `Bearer ${authToken}`)
        .send(communicationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('custom');
      expect(response.body.data.status).toBe('sent');
    });

    it('should schedule a communication for future', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const communicationData = {
        clientId: testClient._id.toString(),
        type: 'reminder',
        channel: 'email',
        subject: 'Scheduled Message',
        content: 'This is a scheduled message',
        scheduledFor: futureDate.toISOString()
      };

      const response = await request(app)
        .post('/api/communication')
        .set('Authorization', `Bearer ${authToken}`)
        .send(communicationData)
        .expect(201);

      expect(response.body.data.status).toBe('pending');
      expect(new Date(response.body.data.scheduledFor)).toEqual(futureDate);
    });

    it('should fail with invalid client ID', async () => {
      const communicationData = {
        clientId: 'invalid-id',
        type: 'custom',
        channel: 'email',
        subject: 'Test Subject',
        content: 'Test content'
      };

      const response = await request(app)
        .post('/api/communication')
        .set('Authorization', `Bearer ${authToken}`)
        .send(communicationData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/communication/loyalty/:clientId', () => {
    it('should get loyalty points for client', async () => {
      const response = await request(app)
        .get(`/api/communication/loyalty/${testClient._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clientId).toBe(testClient._id.toString());
      expect(response.body.data.totalPoints).toBe(0);
      expect(response.body.data.tierLevel).toBe('bronze');
    });
  });

  describe('POST /api/communication/loyalty/:clientId', () => {
    it('should update loyalty points successfully', async () => {
      const pointsData = {
        points: 100,
        reason: 'Policy renewal',
        transactionType: 'earned'
      };

      const response = await request(app)
        .post(`/api/communication/loyalty/${testClient._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(pointsData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalPoints).toBe(100);
      expect(response.body.data.availablePoints).toBe(100);
    });

    it('should update tier when threshold is reached', async () => {
      // Add enough points to reach silver tier
      const pointsData = {
        points: 1000,
        reason: 'Premium policy purchase',
        transactionType: 'earned'
      };

      const response = await request(app)
        .post(`/api/communication/loyalty/${testClient._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(pointsData)
        .expect(200);

      expect(response.body.data.tierLevel).toBe('silver');
    });
  });

  describe('GET /api/communication/offers', () => {
    it('should get active offers', async () => {
      // Create test offer
      const offer = new Offer({
        title: 'Summer Special',
        description: 'Special discount for summer season',
        type: 'discount',
        applicableProducts: ['life', 'health'],
        discountPercentage: 10,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        targetAudience: { allClients: true },
        createdBy: testAgent._id
      });
      await offer.save();

      const response = await request(app)
        .get('/api/communication/offers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Summer Special');
    });
  });

  describe('GET /api/communication/stats', () => {
    it('should get communication statistics', async () => {
      // Create test communications
      await Communication.create([
        {
          clientId: testClient._id,
          type: 'birthday',
          channel: 'email',
          content: 'Birthday message',
          agentId: testAgent._id,
          status: 'sent'
        },
        {
          clientId: testClient._id,
          type: 'offer',
          channel: 'whatsapp',
          content: 'Offer message',
          agentId: testAgent._id,
          status: 'delivered'
        }
      ]);

      const response = await request(app)
        .get('/api/communication/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.communications.totalCommunications).toBe(2);
    });
  });
});
