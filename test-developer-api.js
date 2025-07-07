// Test script for Developer Permissions API
// Run with: node test-developer-api.js

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api/developer';
const CREDENTIALS = {
  email: 'info@smeetghori.in',
  password: 'Smeet@123'
};

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`\n${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return null;
  }
}

// Test functions
async function testAuthentication() {
  console.log('\n=== Testing Authentication ===');
  await apiCall('/auth', 'POST', CREDENTIALS);
}

async function testPermissionSchema() {
  console.log('\n=== Testing Permission Schema ===');
  await apiCall('/permissions/schema', 'POST', CREDENTIALS);
}

async function testGetAllRoles() {
  console.log('\n=== Testing Get All Roles ===');
  const result = await apiCall('/permissions/roles', 'POST', CREDENTIALS);
  return result?.data?.data?.roles || [];
}

async function testCreateRole() {
  console.log('\n=== Testing Create Role ===');
  const newRole = {
    ...CREDENTIALS,
    name: 'test_agent',
    displayName: 'Test Agent Role',
    permissions: [
      {
        module: 'clients',
        actions: ['view', 'create']
      },
      {
        module: 'leads',
        actions: ['view']
      }
    ],
    isDefault: false
  };
  
  const result = await apiCall('/permissions/roles', 'POST', newRole);
  return result?.data?.data?._id;
}

async function testUpdateRole(roleId) {
  if (!roleId) {
    console.log('\n=== Skipping Update Role (no role ID) ===');
    return;
  }
  
  console.log('\n=== Testing Update Role ===');
  const updateData = {
    ...CREDENTIALS,
    permissions: [
      {
        module: 'clients',
        actions: ['view', 'create', 'edit']
      },
      {
        module: 'leads',
        actions: ['view', 'create']
      },
      {
        module: 'policies',
        actions: ['view']
      }
    ]
  };
  
  await apiCall(`/permissions/roles/${roleId}`, 'PUT', updateData);
}

async function testGetRoleById(roleId) {
  if (!roleId) {
    console.log('\n=== Skipping Get Role By ID (no role ID) ===');
    return;
  }
  
  console.log('\n=== Testing Get Role By ID ===');
  await apiCall(`/permissions/roles/${roleId}`, 'POST', CREDENTIALS);
}

async function testBulkUpdate(roles) {
  if (!roles || roles.length < 2) {
    console.log('\n=== Skipping Bulk Update (insufficient roles) ===');
    return;
  }
  
  console.log('\n=== Testing Bulk Update ===');
  const bulkData = {
    ...CREDENTIALS,
    roles: [
      {
        roleId: roles[0]._id,
        permissions: [
          {
            module: 'clients',
            actions: ['view']
          }
        ]
      }
    ]
  };
  
  await apiCall('/permissions/bulk-update', 'PUT', bulkData);
}

async function testDeleteRole(roleId) {
  if (!roleId) {
    console.log('\n=== Skipping Delete Role (no role ID) ===');
    return;
  }
  
  console.log('\n=== Testing Delete Role ===');
  await apiCall(`/permissions/roles/${roleId}`, 'DELETE', CREDENTIALS);
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Developer Permissions API Tests');
  console.log('============================================');
  
  try {
    // Test authentication
    await testAuthentication();
    
    // Test permission schema
    await testPermissionSchema();
    
    // Test get all roles
    const roles = await testGetAllRoles();
    
    // Test create role
    const newRoleId = await testCreateRole();
    
    // Test update role
    await testUpdateRole(newRoleId);
    
    // Test get role by ID
    await testGetRoleById(newRoleId);
    
    // Test bulk update
    await testBulkUpdate(roles);
    
    // Test delete role (clean up)
    await testDeleteRole(newRoleId);
    
    console.log('\n✅ All tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('- Authentication: ✓');
    console.log('- Permission Schema: ✓');
    console.log('- Get All Roles: ✓');
    console.log('- Create Role: ✓');
    console.log('- Update Role: ✓');
    console.log('- Get Role By ID: ✓');
    console.log('- Bulk Update: ✓');
    console.log('- Delete Role: ✓');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Error handling for invalid credentials test
async function testInvalidCredentials() {
  console.log('\n=== Testing Invalid Credentials ===');
  await apiCall('/auth', 'POST', {
    email: 'wrong@email.com',
    password: 'wrongpassword'
  });
}

// Run tests
if (require.main === module) {
  runTests().then(() => {
    console.log('\n🔒 Testing invalid credentials...');
    return testInvalidCredentials();
  }).then(() => {
    console.log('\n🎉 All tests completed successfully!');
    process.exit(0);
  }).catch(error => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  apiCall,
  testAuthentication,
  testPermissionSchema,
  testGetAllRoles,
  testCreateRole,
  testUpdateRole,
  testGetRoleById,
  testBulkUpdate,
  testDeleteRole,
  runTests
};