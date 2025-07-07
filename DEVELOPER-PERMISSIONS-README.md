# Developer Permissions Management System

## Overview

This system provides a comprehensive interface for developers to create, edit, and manage permissions in the Insurance CRM application. It includes both backend API endpoints and a frontend interface with hardcoded authentication for security.

## 🔐 Authentication

**Hardcoded Developer Credentials:**
- **Email:** `info@smeetghori.in`
- **Password:** `Smeet@123`

These credentials are required for all developer permission operations.

## 🚀 Quick Start

### 1. Backend Setup

The developer routes are automatically registered when the backend starts:

```bash
cd backend
npm start
```

The backend will be available at `http://localhost:5000`

### 2. Frontend Access

Start the frontend development server:

```bash
npm run dev
```

Access the developer interface at: `http://localhost:8081/developer`

### 3. API Testing

Run the comprehensive test suite:

```bash
node test-developer-api.js
```

## 📁 File Structure

```
insurance-crm/
├── backend/
│   ├── controllers/
│   │   └── developerController.js     # Developer API logic
│   ├── routes/
│   │   └── developerRoutes.js         # Developer API routes
│   └── app.js                         # Updated with developer routes
├── src/
│   ├── components/
│   │   └── developer/
│   │       └── DeveloperPermissions.jsx  # Frontend interface
│   └── App.jsx                        # Updated with developer route
├── docs/
│   └── api/
│       └── developer-permissions-api-documentation.md
├── test-developer-api.js              # API test suite
└── DEVELOPER-PERMISSIONS-README.md    # This file
```

## 🔧 API Endpoints

### Base URL: `/api/developer`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth` | Authenticate developer |
| GET | `/permissions/schema` | Get available modules and actions |
| GET | `/permissions/roles` | Get all roles with permissions |
| GET | `/permissions/roles/:id` | Get specific role by ID |
| POST | `/permissions/roles` | Create new role |
| PUT | `/permissions/roles/:id` | Update role permissions |
| DELETE | `/permissions/roles/:id` | Delete role |
| PUT | `/permissions/bulk-update` | Bulk update multiple roles |

## 🎯 Available Modules

- `clients` - Client management
- `leads` - Lead management  
- `quotations` - Quotation management
- `policies` - Policy management
- `claims` - Claims management
- `invoices` - Invoice management
- `agents` - Agent management
- `reports` - Reporting system
- `settings` - System settings
- `activities` - Activity tracking
- `offers` - Offer management

## 🎯 Available Actions

- `view` - Read access to resources
- `create` - Create new resources
- `edit` - Modify existing resources
- `delete` - Remove resources
- `export` - Export data
- `approve` - Approve workflows
- `edit_sensitive` - Edit sensitive information
- `edit_status` - Modify status fields

## 💻 Frontend Interface Features

### Authentication Screen
- Secure login with hardcoded credentials
- Password visibility toggle
- Clear error messaging

### Role Management
- **View All Roles:** Display all existing roles with permission counts
- **Edit Permissions:** Interactive permission editor with checkboxes
- **Create Roles:** Form to create new roles with custom permissions
- **Delete Roles:** Remove non-essential roles (protects super_admin and default roles)

### Permission Schema
- View available modules and actions
- Understand the permission structure

## 🔨 Usage Examples

### 1. Creating a Custom Role via API

```javascript
const createRole = async () => {
  const response = await fetch('/api/developer/permissions/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'info@smeetghori.in',
      password: 'Smeet@123',
      name: 'senior_agent',
      displayName: 'Senior Insurance Agent',
      permissions: [
        {
          module: 'clients',
          actions: ['view', 'create', 'edit', 'delete']
        },
        {
          module: 'leads',
          actions: ['view', 'create', 'edit']
        }
      ],
      isDefault: false
    }),
  });
  
  const data = await response.json();
  console.log('Role created:', data);
};
```

### 2. Updating Role Permissions

```javascript
const updatePermissions = async (roleId) => {
  const response = await fetch(`/api/developer/permissions/roles/${roleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'info@smeetghori.in',
      password: 'Smeet@123',
      permissions: [
        {
          module: 'clients',
          actions: ['view', 'create', 'edit', 'delete', 'export']
        }
      ]
    }),
  });
  
  const data = await response.json();
  console.log('Permissions updated:', data);
};
```

### 3. Bulk Permission Updates

```javascript
const bulkUpdate = async () => {
  const response = await fetch('/api/developer/permissions/bulk-update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'info@smeetghori.in',
      password: 'Smeet@123',
      roles: [
        {
          roleId: 'role_id_1',
          permissions: [{
            module: 'clients',
            actions: ['view', 'create']
          }]
        },
        {
          roleId: 'role_id_2',
          permissions: [{
            module: 'leads',
            actions: ['view', 'create', 'edit']
          }]
        }
      ]
    }),
  });
  
  const data = await response.json();
  console.log('Bulk update result:', data);
};
```

## 🛡️ Security Features

### 1. Hardcoded Authentication
- Only developers with specific credentials can access the system
- No token-based authentication to prevent unauthorized access

### 2. Role Protection
- **Super Admin Protection:** Cannot modify or delete `super_admin` role
- **Default Role Protection:** Cannot delete roles marked as `isDefault: true`
- **Validation:** All inputs are validated against predefined schemas

### 3. Audit Logging
- All permission changes are logged in the console
- Includes user ID and timestamp for tracking

## 🧪 Testing

### Automated Test Suite

Run the comprehensive test suite:

```bash
node test-developer-api.js
```

The test suite covers:
- ✅ Authentication with valid credentials
- ✅ Authentication with invalid credentials
- ✅ Permission schema retrieval
- ✅ Role creation
- ✅ Role updates
- ✅ Role deletion
- ✅ Bulk updates
- ✅ Error handling

### Manual Testing

1. **Frontend Interface:**
   - Navigate to `/developer`
   - Login with hardcoded credentials
   - Test all CRUD operations

2. **API Endpoints:**
   - Use Postman or curl to test endpoints
   - Verify error responses
   - Test edge cases

## 🔧 Integration with Existing RBAC

The developer permissions system integrates seamlessly with the existing RBAC system:

### 1. Database Integration
- Uses the same `Role` model and MongoDB collections
- Changes are immediately reflected in the main application
- Maintains data consistency

### 2. Real-time Updates
- Permission changes trigger real-time updates via WebSocket
- Users see permission changes without needing to log out/in
- Maintains system synchronization

### 3. Validation
- Uses the same validation schemas as the main RBAC system
- Ensures data integrity and consistency
- Prevents invalid permission configurations

## 🚨 Error Handling

### Common Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | Invalid developer credentials | Wrong email/password |
| 400 | Validation error | Invalid request data |
| 404 | Role not found | Role ID doesn't exist |
| 403 | Forbidden operation | Cannot modify protected roles |
| 409 | Role already exists | Duplicate role name |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## 📚 Documentation

Detailed API documentation is available at:
- `docs/api/developer-permissions-api-documentation.md`

## 🔄 Future Enhancements

### Planned Features
1. **Permission Templates:** Pre-defined permission sets for common roles
2. **Permission History:** Track changes over time
3. **Role Cloning:** Duplicate existing roles with modifications
4. **Advanced Validation:** More sophisticated permission conflict detection
5. **Export/Import:** Backup and restore permission configurations

### Integration Possibilities
1. **CI/CD Integration:** Automated permission deployment
2. **Monitoring:** Permission usage analytics
3. **Notifications:** Alert on permission changes

## 🤝 Contributing

When contributing to the developer permissions system:

1. **Follow existing patterns:** Use the same code style and structure
2. **Add tests:** Include tests for new functionality
3. **Update documentation:** Keep API docs current
4. **Security first:** Maintain hardcoded authentication approach

## 📞 Support

For issues or questions regarding the developer permissions system:

1. Check the API documentation
2. Run the test suite to verify functionality
3. Review error logs for debugging information
4. Ensure backend and frontend are properly connected

---

**Note:** This system is designed for developer use only. The hardcoded credentials ensure that only authorized developers can modify system permissions. Always use this system responsibly and maintain proper backup procedures before making significant permission changes.