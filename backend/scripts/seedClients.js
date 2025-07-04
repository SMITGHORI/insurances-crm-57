const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const Client = require('../models/Client');

async function seedClients() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if clients already exist
    const existingClients = await Client.countDocuments();
    if (existingClients > 0) {
      console.log('Clients already exist, skipping seeding...');
      return;
    }

    const sampleClients = [
      {
        clientId: 'CL001',
        clientType: 'individual',
        email: 'john.doe@email.com',
        phone: '9876543210',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        status: 'Active',
        source: 'Website',
        individualData: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-15'),
          gender: 'Male',
          occupation: 'Software Engineer',
          annualIncome: 1200000
        }
      },
      {
        clientId: 'CL002',
        clientType: 'corporate',
        email: 'contact@techcorp.com',
        phone: '9876543211',
        address: '456 Business Park',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
        status: 'Active',
        source: 'Referral',
        corporateData: {
          companyName: 'Tech Corp Ltd',
          registrationNumber: 'REG123456',
          industry: 'Technology',
          employeeCount: 150,
          annualRevenue: 50000000,
          contactPerson: 'Jane Smith',
          designation: 'HR Manager'
        }
      },
      {
        clientId: 'CL003',
        clientType: 'individual',
        email: 'alice.johnson@email.com',
        phone: '9876543212',
        address: '789 Park Avenue',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India',
        status: 'Active',
        source: 'Agent',
        individualData: {
          firstName: 'Alice',
          lastName: 'Johnson',
          dateOfBirth: new Date('1985-05-20'),
          gender: 'Female',
          occupation: 'Doctor',
          annualIncome: 2000000
        }
      }
    ];

    await Client.insertMany(sampleClients);
    console.log('Sample clients created successfully!');
    
  } catch (error) {
    console.error('Error seeding clients:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedClients();