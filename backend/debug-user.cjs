const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Role = require('./models/Role');
const User = require('./models/User');

async function debugUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the admin user
    const user = await User.findOne({ email: 'admin@gmail.com' }).select('+password').populate('role');
    
    if (!user) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('- ID:', user._id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Active:', user.isActive);
    console.log('- Role:', user.role?.name);
    console.log('- Password hash exists:', !!user.password);
    console.log('- Password hash length:', user.password?.length);
    
    // Test password verification
    const testPassword = 'admin@123';
    console.log('\nTesting password verification...');
    console.log('Test password:', testPassword);
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password verification result:', isValid);
    
    if (!isValid) {
      console.log('\n❌ Password verification failed!');
      console.log('Let\'s try creating a new hash...');
      
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log('New hash:', newHash);
      
      const testNewHash = await bcrypt.compare(testPassword, newHash);
      console.log('New hash verification:', testNewHash);
    } else {
      console.log('\n✅ Password verification successful!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

debugUser();