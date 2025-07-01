const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Role = require('../models/Role');

/**
 * Simple Admin User Seeder
 */
async function seedAdminUser() {
  try {
    console.log('🚀 Starting admin user seeding process...');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Check if super_admin role exists, create if not
    let superAdminRole = await Role.findOne({ name: 'super_admin' });
    if (!superAdminRole) {
      console.log('🏗️  Creating super_admin role...');
      superAdminRole = await Role.create({
        name: 'super_admin',
        displayName: 'Super Administrator',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'export', 'edit_sensitive'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'delete', 'export', 'approve'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'edit_sensitive'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'delete', 'export', 'approve'] },
          { module: 'invoices', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'agents', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'reports', actions: ['view', 'create', 'export'] },
          { module: 'settings', actions: ['view', 'edit'] },
          { module: 'activities', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'offers', actions: ['view', 'create', 'edit', 'delete', 'approve'] }
        ],
        isDefault: true
      });
      console.log('✅ Super admin role created');
    } else {
      console.log('✅ Super admin role already exists');
    }
    
    // Check if admin user already exists
    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminEmail);
      console.log('✅ Admin user seeding completed (user already exists)');
    } else {
      // Create admin user
      console.log('👤 Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('admin@123', 12);
      
      const adminUser = await User.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'System Administrator',
        phone: '+1-800-ADMIN-01',
        role: superAdminRole._id,
        branch: 'main',
        isActive: true
      });
      
      console.log('✅ Admin user created successfully!');
    }
    
    console.log('=' .repeat(50));
    console.log('🎉 Admin user seeding completed successfully!');
    console.log('');
    console.log('📋 ADMIN LOGIN CREDENTIALS:');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: admin@123');
    console.log('   Role: Super Administrator');
    console.log('');
    console.log('⚠️  SECURITY NOTICE:');
    console.log('   - Change the default password after first login');
    console.log('   - Store credentials securely');
    console.log('   - This is a license-based system - add users manually');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Error during admin user seeding:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding function
seedAdminUser();