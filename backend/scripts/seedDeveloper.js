const mongoose = require('mongoose');
const Developer = require('../models/Developer');
require('dotenv').config();

const seedDeveloper = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance-crm');
    console.log('Connected to MongoDB');

    // Check if developer already exists
    const existingDeveloper = await Developer.findOne({ email: 'info@smeetghori.in' });
    
    if (existingDeveloper) {
      console.log('Developer account already exists');
      return;
    }

    // Create initial developer account
    const developer = new Developer({
      name: 'Smeet Ghori',
      email: 'info@smeetghori.in',
      password: 'Smeet@123',
      isActive: true
    });

    await developer.save();
    console.log('Initial developer account created successfully');
    console.log('Email: info@smeetghori.in');
    console.log('Password: Smeet@123');
    
  } catch (error) {
    console.error('Error seeding developer:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeder
if (require.main === module) {
  seedDeveloper();
}

module.exports = seedDeveloper;