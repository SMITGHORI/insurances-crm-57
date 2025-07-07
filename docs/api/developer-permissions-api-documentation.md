# Developer Permissions API Documentation

## Overview

The Developer Permissions API provides a comprehensive interface for managing roles and permissions in the Insurance CRM system. This API is designed exclusively for developers and system administrators with hardcoded authentication credentials.

**Base URL:** `/api/developer`

**Authentication:** Hardcoded credentials required for all endpoints
- Email: `info@smeetghori.in`
- Password: `Smeet@123`

## Authentication

### Developer Login

**Endpoint:** `POST /api/developer/auth`

**Description:** Authenticate developer with hardcoded credentials

**Request Body:**
```json
{
  "email": "info@smeetghori.in",
  "password": "Smeet@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Developer authenticated successfully",
  "data": {
    "authenticated": true,
    "email": "info@smeetghori.in",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Permission Schema

### Get Permission Schema

**Endpoint:** `GET /api/developer/permissions/schema`

**Description:** Retrieve available modules, actions, and schema information

**Request Body:**
```json
{
  "email": "info@smeetghori.in",
  "password": "Smeet@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Permission schema retrieved successfully",
  "data": {
    "modules": [
      "clients", "leads", "quotations", "policies", "claims",
      "invoices", "agents", "reports", "settings", "activities", "offers"
    ],
    "actions": [
      "view", "create", "edit", "delete", "export",
      "approve", "edit_sensitive", "edit_status"
    ],
    "schema": {
      "permission": {
        "module": "string (enum)",
        "actions": "array of strings (enum)"
      },
      "role": {
        "name": "string (enum: agent, manager, admin)",
        "displayName": "string",
        "permissions": "array of permission objects",
        "isDefault": "boolean"
      }
    }
  }
}
```

## Role Management

### Get All Roles

**Endpoint:** `GET /api/developer/permissions/roles`

**Description:** Retrieve all roles with their permissions

**Request Body:**
```json
{
  "email": "info@smeetghori.in",
  "password": "Smeet@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "All roles retrieved successfully",
  "data": {
    "roles": [
      {
        "_id": "role_id_1",
        "name": "agent",
        "displayName": "Insurance Agent",
        "permissions": [
          {
            "module": "clients",
            "actions": ["view", "create", "edit"]
          },
          {
            "module": "leads",
            "actions": ["view", "create"]
          }
        ],
        "isDefault": true,
        "permissionCount": 5,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 4,
    "summary": [
      {
        "id": "role_id_1",
        "name": "agent",
        "displayName": "Insurance Agent",
        "permissionCount": 5,
        "isDefault": true
      }
    ]
  }
}
```

### Get Role by ID

**Endpoint:** `GET /api/developer/permissions/roles/:id`

**Description:** Retrieve specific role by ID

**Request Body:**
```json
{
  "email": "info@smeetghori.in",
  "password": "Smeet@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role retrieved successfully",
  "data": {
    "_id": "role_id_1",
    "name": "agent",
    "displayName": "Insurance Agent",
    "permissions": [
      {
        "module": "clients",
        "actions": ["view", "create", "edit"]
      }
    ],
    "isDefault": true,
    "permissionCount": 3,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Create New Role

**Endpoint:** `POST /api/developer/permissions/roles`

**Description:** Create a new role with permissions

**Request Body:**
```json
{
  "email": "info@smeetghori.in",
  "password": "Smeet@123",
  "name": "senior_agent",
  "displayName": "Senior Insurance Agent",
  "permissions": [
    {
      "module": "clients",
      "actions": ["view", "create", "edit", "delete"]
    },
    {
      "module": "leads",
      "actions": ["view", "create", "edit"]
    },
    {
      "module": "policies",
      "actions": ["view", "create"]
    }
  ],
  "isDefault": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role 'Senior Insurance Agent' created successfully",
  "data": {
    "_id": "new_role_id",
    "name": "senior_agent",
    "displayName": "Senior Insurance Agent",
    "permissions": [
      {
        "module": "clients",
        "actions": ["view", "create", "edit", "delete"]
      },
      {
        "module": "leads",
        "actions": ["view", "create", "edit"]
      },
      {
        "module": "policies",
        "actions": ["view", "create"]
      }
    ],
    "isDefault": false,
    "permissionCount": 9,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Role Permissions

**Endpoint:** `PUT /api/developer/permissions/roles/:id`

**Description:** Update permissions for a specific role

**Request Body:**
```json
{
  "email": "info@smeetghori.in",
  "password": "Smeet@123",
  "permissions": [
    {
      "module": "clients",
      "actions": ["view", "create", "edit", "delete", "export"]
    },
    {
      "module": "leads",
      "actions": ["view", "create", "edit", "delete"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role 'Insurance Agent' permissions updated successfully",
  "data": {
    "roleId": "role_id_1",
    "name": "agent",
    "displayName": "Insurance Agent",
    "permissions": [
      {
        "module": "clients",
        "actions": ["view", "create", "edit", "delete", "export"]
      },
      {
        "module": "leads",
        "actions": ["view", "create", "edit", "delete"]
      }
    ],
    "permissionCount": 9,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Delete Role

**Endpoint:** `DELETE /api/developer/permissions/roles/:id`

**Description:** Delete a role (except super_admin and default roles)

**Request Body:**
```json
{
  "email": "info@smeetghori.in",
  "password": "Smeet@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role 'Senior Insurance Agent' deleted successfully",
  "data": {
    "deletedRole": {
      "id": "role_id_1",
      "name": "senior_agent",
      "displayName": "Senior Insurance Agent"
    }
  }
}
```

### Bulk Update Permissions

**Endpoint:** `PUT /api/developer/permissions/bulk-update`

**Description:** Update permissions for multiple roles simultaneously

**Request Body:**
```json
{
  "email": "info@smeetghori.in",
  "password": "Smeet@123",
  "roles": [
    {
      "roleId": "role_id_1",
      "permissions": [
        {
          "module": "clients",
          "actions": ["view", "create", "edit"]
        }
      ]
    },
    {
      "roleId": "role_id_2",
      "permissions": [
        {
          "module": "leads",
          "actions": ["view", "create", "edit", "delete"]
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk update completed. 2 roles updated, 0 errors",
  "data": {
    "updated": [
      {
        "roleId": "role_id_1",
        "name": "agent",
        "displayName": "Insurance Agent",
        "permissionCount": 3,
        "status": "updated"
      },
      {
        "roleId": "role_id_2",
        "name": "manager",
        "displayName": "Insurance Manager",
        "permissionCount": 4,
        "status": "updated"
      }
    ],
    "errors": [],
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    }
  }
}
```

## Error Responses

### Authentication Error
```json
{
  "success": false,
  "error": "Invalid developer credentials",
  "statusCode": 401
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Validation error: Role name is required",
  "statusCode": 400
}
```

### Role Not Found
```json
{
  "success": false,
  "error": "Role not found",
  "statusCode": 404
}
```

### Forbidden Operation
```json
{
  "success": false,
  "error": "Cannot modify super_admin role permissions",
  "statusCode": 403
}
```

### Role Already Exists
```json
{
  "success": false,
  "error": "Role 'agent' already exists",
  "statusCode": 409
}
```

## Available Modules

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

## Available Actions

- `view` - Read access to resources
- `create` - Create new resources
- `edit` - Modify existing resources
- `delete` - Remove resources
- `export` - Export data
- `approve` - Approve workflows
- `edit_sensitive` - Edit sensitive information
- `edit_status` - Modify status fields

## Security Notes

1. **Hardcoded Authentication**: This API uses hardcoded credentials for developer access only
2. **Super Admin Protection**: The `super_admin` role cannot be modified or deleted
3. **Default Role Protection**: Default roles cannot be deleted
4. **Validation**: All inputs are validated against predefined schemas
5. **Audit Logging**: All permission changes are logged for audit purposes

## Frontend Integration

Access the developer interface at: `/developer`

The interface provides:
- Authentication with hardcoded credentials
- Visual role management
- Permission editing with checkboxes
- Real-time validation
- Bulk operations support

## Usage Examples

### Creating a Custom Agent Role

```javascript
const createCustomAgent = async () => {
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
        },
        {
          module: 'policies',
          actions: ['view', 'create']
        }
      ],
      isDefault: false
    }),
  });
  
  const data = await response.json();
  console.log('Role created:', data);
};
```

### Updating Role Permissions

```javascript
const updateRolePermissions = async (roleId) => {
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

This API provides comprehensive control over the RBAC system while maintaining security through hardcoded developer authentication.