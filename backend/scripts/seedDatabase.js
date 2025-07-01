
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Client = require('../models/Client');
const Agent = require('../models/Agent');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');

class DatabaseSeeder {
  constructor() {
    this.seedData = {
      users: [],
      agents: [],
      clients: [],
      policies: [],
      claims: [],
      leads: [],
      quotations: []
    };
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_system');
      console.log('Connected to MongoDB for seeding');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }
  }

  async seedUsers() {
    console.log('Seeding users...');
    
    const users = [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@insurance.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'super_admin',
        isActive: true,
        permissions: ['all']
      },
      {
        firstName: 'John',
        lastName: 'Manager',
        email: 'manager@insurance.com',
        password: await bcrypt.hash('manager123', 12),
        role: 'manager',
        isActive: true,
        permissions: ['manage_team', 'view_reports', 'manage_policies']
      },
      {
        firstName: 'Jane',
        lastName: 'Agent',
        email: 'agent@insurance.com',
        password: await bcrypt.hash('agent123', 12),
        role: 'agent',
        isActive: true,
        permissions: ['manage_clients', 'create_policies', 'view_own_data']
      }
    ];

    await User.deleteMany({});
    const createdUsers = await User.insertMany(users);
    this.seedData.users = createdUsers;
    console.log(`Created ${createdUsers.length} users`);
  }

  async seedAgents() {
    console.log('Seeding agents...');
    
    const agentUser = this.seedData.users.find(u => u.role === 'agent');
    const managerUser = this.seedData.users.find(u => u.role === 'manager');

    const agents = [
      {
        userId: agentUser._id,
        employeeId: 'AGT001',
        firstName: 'Jane',
        lastName: 'Agent',
        email: 'agent@insurance.com',
        phone: '+1234567890',
        department: 'Sales',
        manager: managerUser._id,
        hireDate: new Date('2023-01-15'),
        status: 'active',
        commissionRate: 0.05,
        targets: {
          monthly: 50000,
          quarterly: 150000,
          annual: 600000
        }
      },
      {
        userId: managerUser._id,
        employeeId: 'MGR001',
        firstName: 'John',
        lastName: 'Manager',
        email: 'manager@insurance.com',
        phone: '+1234567891',
        department: 'Sales',
        hireDate: new Date('2022-06-01'),
        status: 'active',
        commissionRate: 0.03,
        targets: {
          monthly: 100000,
          quarterly: 300000,
          annual: 1200000
        }
      }
    ];

    await Agent.deleteMany({});
    const createdAgents = await Agent.insertMany(agents);
    this.seedData.agents = createdAgents;
    console.log(`Created ${createdAgents.length} agents`);
  }

  async seedClients() {
    console.log('Seeding clients...');
    
    const agent = this.seedData.agents[0];

    const clients = [
      {
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@email.com',
        phone: '+1234567892',
        dateOfBirth: new Date('1985-03-15'),
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        assignedAgent: agent._id,
        status: 'active',
        clientType: 'individual',
        tags: ['high-value', 'family'],
        communicationPreferences: {
          email: true,
          sms: true,
          phone: false
        }
      },
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@email.com',
        phone: '+1234567893',
        dateOfBirth: new Date('1990-07-22'),
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        assignedAgent: agent._id,
        status: 'active',
        clientType: 'individual',
        tags: ['young-professional'],
        communicationPreferences: {
          email: true,
          sms: true,
          phone: true
        }
      }
    ];

    await Client.deleteMany({});
    const createdClients = await Client.insertMany(clients);
    this.seedData.clients = createdClients;
    console.log(`Created ${createdClients.length} clients`);
  }

  async seedPolicies() {
    console.log('Seeding policies...');
    
    const client = this.seedData.clients[0];
    const agent = this.seedData.agents[0];

    const policies = [
      {
        policyNumber: 'POL-2024-001',
        clientId: client._id,
        policyType: 'Auto Insurance',
        insuranceType: 'Vehicle',
        provider: 'ABC Insurance',
        premium: 1200,
        deductible: 500,
        coverageAmount: 50000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        agentId: agent._id,
        paymentFrequency: 'monthly',
        paymentMethod: 'auto_debit'
      },
      {
        policyNumber: 'POL-2024-002',
        clientId: client._id,
        policyType: 'Health Insurance',
        insuranceType: 'Health',
        provider: 'XYZ Health',
        premium: 2400,
        deductible: 1000,
        coverageAmount: 100000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        agentId: agent._id,
        paymentFrequency: 'monthly',
        paymentMethod: 'manual'
      }
    ];

    await Policy.deleteMany({});
    const createdPolicies = await Policy.insertMany(policies);
    this.seedData.policies = createdPolicies;
    console.log(`Created ${createdPolicies.length} policies`);
  }

  async seedLeads() {
    console.log('Seeding leads...');
    
    const agent = this.seedData.agents[0];

    const leads = [
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@email.com',
        phone: '+1234567894',
        source: 'website',
        status: 'new',
        priority: 'high',
        insuranceType: 'Auto',
        estimatedValue: 15000,
        assignedTo: agent._id,
        notes: 'Interested in comprehensive auto coverage',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@email.com',
        phone: '+1234567895',
        source: 'referral',
        status: 'contacted',
        priority: 'medium',
        insuranceType: 'Home',
        estimatedValue: 25000,
        assignedTo: agent._id,
        notes: 'Looking for home insurance for new property',
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      }
    ];

    await Lead.deleteMany({});
    const createdLeads = await Lead.insertMany(leads);
    this.seedData.leads = createdLeads;
    console.log(`Created ${createdLeads.length} leads`);
  }

  async seedQuotations() {
    console.log('Seeding quotations...');
    
    const client = this.seedData.clients[0];
    const agent = this.seedData.agents[0];

    const quotations = [
      {
        quoteId: 'QT-2024-001',
        clientId: client._id,
        insuranceType: 'Auto',
        insuranceCompany: 'ABC Insurance',
        products: [{
          name: 'Comprehensive Auto Coverage',
          description: 'Full coverage auto insurance',
          sumInsured: 50000,
          premium: 1200
        }],
        sumInsured: 50000,
        premium: 1200,
        agentId: agent._id,
        status: 'draft',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes: 'Initial quote for auto insurance'
      }
    ];

    await Quotation.deleteMany({});
    const createdQuotations = await Quotation.insertMany(quotations);
    this.seedData.quotations = createdQuotations;
    console.log(`Created ${createdQuotations.length} quotations`);
  }

  async seedAll() {
    try {
      await this.connect();
      
      console.log('Starting database seeding...');
      
      await this.seedUsers();
      await this.seedAgents();
      await this.seedClients();
      await this.seedPolicies();
      await this.seedLeads();
      await this.seedQuotations();
      
      console.log('Database seeding completed successfully!');
      console.log('\nLogin credentials:');
      console.log('Super Admin: admin@insurance.com / admin123');
      console.log('Manager: manager@insurance.com / manager123');
      console.log('Agent: agent@insurance.com / agent123');
      
    } catch (error) {
      console.error('Seeding failed:', error);
    } finally {
      await mongoose.disconnect();
    }
  }

  async clearAll() {
    try {
      await this.connect();
      
      console.log('Clearing all collections...');
      
      await User.deleteMany({});
      await Agent.deleteMany({});
      await Client.deleteMany({});
      await Policy.deleteMany({});
      await Claim.deleteMany({});
      await Lead.deleteMany({});
      await Quotation.deleteMany({});
      
      console.log('All collections cleared!');
      
    } catch (error) {
      console.error('Clearing failed:', error);
    } finally {
      await mongoose.disconnect();
    }
  }
}

// CLI interface
const seeder = new DatabaseSeeder();

if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      seeder.seedAll();
      break;
    case 'clear':
      seeder.clearAll();
      break;
    default:
      console.log('Usage: node seedDatabase.js [seed|clear]');
      process.exit(1);
  }
}

module.exports = DatabaseSeeder;
