const Role = require('../models/Role');
const User = require('../models/User');

/**
 * Seed default roles with comprehensive permission matrices
 * Runs automatically on app start when database is empty
 */
const seedDefaultRoles = async () => {
  try {
    // Check if roles already exist
    const existingRoles = await Role.countDocuments();
    if (existingRoles > 0) {
      console.log('Roles already seeded, skipping...');
      return;
    }

    console.log('Seeding default roles...');

    // Define default role configurations
    const defaultRoles = [
      {
        name: 'agent',
        displayName: 'Sales Agent',
        isDefault: true,
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit'] },
          { module: 'leads', actions: ['view', 'create', 'edit'] },
          { module: 'quotations', actions: ['view', 'create', 'edit'] },
          { module: 'policies', actions: ['view', 'create', 'edit'] },
          { module: 'claims', actions: ['view', 'create', 'edit'] },
          { module: 'activities', actions: ['view', 'create'] },
          { module: 'reports', actions: ['view'] },
          { module: 'settings', actions: ['view'] }
        ]
      },
      {
        name: 'manager',
        displayName: 'Branch Manager',
        isDefault: true,
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
          { module: 'invoices', actions: ['view', 'create', 'edit'] },
          { module: 'agents', actions: ['view', 'edit'] },
          { module: 'activities', actions: ['view', 'create', 'edit'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'settings', actions: ['view', 'edit'] }
        ]
      },
      {
        name: 'admin',
        displayName: 'System Administrator',
        isDefault: true,
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'edit_sensitive'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'delete', 'approve', 'edit_sensitive'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'delete', 'approve', 'edit_status'] },
          { module: 'invoices', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'agents', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'activities', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'offers', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'settings', actions: ['view', 'edit'] }
        ]
      },
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        isDefault: true,
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'export', 'edit_sensitive'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'edit_sensitive'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'edit_status'] },
          { module: 'invoices', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'agents', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'activities', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'offers', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'settings', actions: ['view', 'edit', 'export'] }
        ]
      }
    ];

    // Create roles
    const createdRoles = [];
    for (const roleData of defaultRoles) {
      const role = new Role(roleData);
      await role.save();
      createdRoles.push(role);
      console.log(`Created role: ${role.displayName}`);
    }

    // Assign super_admin role to first user (if exists)
    const firstUser = await User.findOne().sort({ createdAt: 1 });
    if (firstUser) {
      const superAdminRole = createdRoles.find(r => r.name === 'super_admin');
      if (superAdminRole) {
        firstUser.role = superAdminRole._id;
        await firstUser.save();
        console.log(`Assigned super_admin role to user: ${firstUser.email}`);
      }
    }

    console.log('Default roles seeded successfully!');
  } catch (error) {
    console.error('Error seeding default roles:', error);
    throw error;
  }
};

/**
 * Check and run seed if needed - called on app startup
 */
const initializeRoles = async () => {
  try {
    await seedDefaultRoles();
  } catch (error) {
    console.error('Failed to initialize roles:', error);
  }
};

module.exports = {
  seedDefaultRoles,
  initializeRoles
};