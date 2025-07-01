const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find and unlock the admin user
    const adminUser = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('Found admin user:', adminUser.email);
    console.log('Current login attempts:', adminUser.loginAttempts);
    console.log('Account locked until:', adminUser.lockUntil);
    console.log('Is locked:', adminUser.isLocked);
    
    // Reset login attempts and unlock
    adminUser.loginAttempts = 0;
    adminUser.lockUntil = undefined;
    
    await adminUser.save();
    
    console.log('✅ Admin user unlocked successfully!');
    console.log('Login attempts reset to:', adminUser.loginAttempts);
    console.log('Lock until:', adminUser.lockUntil);
    
  } catch (error) {
    console.error('Error unlocking admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});