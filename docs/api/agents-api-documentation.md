
# Agents API Documentation

## Overview
This document provides comprehensive API documentation for the Insurance CRM Agents module built with Node.js, Express.js, and MongoDB.

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:5000/api
```

## Authentication
All API endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access Control
- **Super Admin**: Full access to all agents and operations
- **Manager**: Access to agents within their region/team
- **Agent**: Limited access to own profile and assigned resources

## API Endpoints

### 1. Get All Agents
**GET** `/api/agents`

**Description**: Retrieve all agents with filtering, pagination, and search capabilities

**Query Parameters**:
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of items per page (default: 10, max: 100)
- `search` (string, optional): Search in agent name, email, or phone
- `status` (string, optional): Filter by agent status (active, inactive, onboarding, terminated)
- `specialization` (string, optional): Filter by specialization
- `region` (string, optional): Filter by region
- `teamId` (ObjectId, optional): Filter by team
- `sortField` (string, optional): Field to sort by (default: createdAt)
- `sortDirection` (string, optional): Sort direction (asc, desc) (default: desc)
- `hireDate` (date, optional): Filter agents hired after this date
- `minCommission` (number, optional): Minimum commission amount filter
- `maxCommission` (number, optional): Maximum commission amount filter

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb74b24a42e9c5f2a1b",
      "agentId": "AGT-2024-001",
      "name": "John Smith",
      "email": "john.smith@ambainsurance.com",
      "phone": "+1234567890",
      "status": "active",
      "specialization": "Life Insurance",
      "region": "North",
      "teamId": "60d5ecb74b24a42e9c5f2a1a",
      "licenseNumber": "LIC-123456789",
      "licenseExpiry": "2025-12-31T23:59:59.999Z",
      "hireDate": "2024-01-01T00:00:00.000Z",
      "commissionRate": 12.5,
      "performance": {
        "clientsCount": 45,
        "policiesCount": 67,
        "totalPremium": 125000,
        "conversionRate": 75.5,
        "avgDealSize": 1865
      },
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 95,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 2. Get Agent by ID
**GET** `/api/agents/:id`

**Parameters**:
- `id` (ObjectId, required): Agent ID

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb74b24a42e9c5f2a1b",
    "agentId": "AGT-2024-001",
    "name": "John Smith",
    "email": "john.smith@ambainsurance.com",
    "phone": "+1234567890",
    "status": "active",
    "specialization": "Life Insurance",
    "region": "North",
    "teamId": {
      "_id": "60d5ecb74b24a42e9c5f2a1a",
      "name": "Life Insurance Team",
      "region": "North"
    },
    "licenseNumber": "LIC-123456789",
    "licenseExpiry": "2025-12-31T23:59:59.999Z",
    "hireDate": "2024-01-01T00:00:00.000Z",
    "commissionRate": 12.5,
    "personalInfo": {
      "dateOfBirth": "1985-05-15T00:00:00.000Z",
      "gender": "male",
      "emergencyContact": {
        "name": "Jane Smith",
        "relationship": "spouse",
        "phone": "+1234567891"
      }
    },
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "bankDetails": {
      "accountNumber": "****1234",
      "routingNumber": "****5678",
      "bankName": "Chase Bank"
    },
    "performance": {
      "clientsCount": 45,
      "policiesCount": 67,
      "totalPremium": 125000,
      "conversionRate": 75.5,
      "avgDealSize": 1865,
      "monthlyTargets": {
        "policies": 8,
        "premium": 15000
      },
      "achievements": [
        {
          "title": "Top Performer Q1 2024",
          "date": "2024-03-31T00:00:00.000Z",
          "description": "Exceeded quarterly targets by 150%"
        }
      ]
    },
    "documents": [
      {
        "_id": "60d5ecb74b24a42e9c5f2a1d",
        "name": "License Certificate",
        "type": "license",
        "url": "/uploads/agents/license-cert.pdf",
        "uploadedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "notes": [
      {
        "_id": "60d5ecb74b24a42e9c5f2a1e",
        "content": "Excellent performance in Q1",
        "createdBy": "60d5ecb74b24a42e9c5f2a1c",
        "createdAt": "2024-01-01T10:00:00.000Z",
        "isPrivate": false
      }
    ],
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 3. Create New Agent
**POST** `/api/agents`

**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@ambainsurance.com",
  "phone": "+1234567890",
  "specialization": "Health Insurance",
  "region": "South",
  "teamId": "60d5ecb74b24a42e9c5f2a1a",
  "licenseNumber": "LIC-987654321",
  "licenseExpiry": "2025-12-31T23:59:59.999Z",
  "hireDate": "2024-02-01T00:00:00.000Z",
  "commissionRate": 10.0,
  "personalInfo": {
    "dateOfBirth": "1990-08-20T00:00:00.000Z",
    "gender": "female",
    "emergencyContact": {
      "name": "John Doe",
      "relationship": "spouse",
      "phone": "+1234567891"
    }
  },
  "address": {
    "street": "456 Oak Ave",
    "city": "Miami",
    "state": "FL",
    "zipCode": "33101",
    "country": "USA"
  },
  "bankDetails": {
    "accountNumber": "1234567890",
    "routingNumber": "987654321",
    "bankName": "Bank of America"
  }
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "message": "Agent created successfully",
  "data": {
    "_id": "60d5ecb74b24a42e9c5f2a21",
    "agentId": "AGT-2024-002",
    // ... full agent object
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 4. Update Agent
**PUT** `/api/agents/:id`

**Parameters**:
- `id` (ObjectId, required): Agent ID

**Request Body**: (same as create, all fields optional)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Agent updated successfully",
  "data": {
    // ... updated agent object
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 5. Delete Agent
**DELETE** `/api/agents/:id`

**Parameters**:
- `id` (ObjectId, required): Agent ID

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Agent deleted successfully",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 6. Upload Agent Document
**POST** `/api/agents/:id/documents`

**Parameters**:
- `id` (ObjectId, required): Agent ID

**Request Body** (multipart/form-data):
- `document` (file, required): Document file
- `documentType` (string, required): Type of document (license, contract, certification, etc.)
- `name` (string, optional): Custom document name

**Response**: 201 Created
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "60d5ecb74b24a42e9c5f2a22",
    "name": "Updated License",
    "type": "license",
    "url": "/uploads/agents/updated-license.pdf",
    "size": 245760,
    "uploadedAt": "2024-01-01T10:00:00.000Z"
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 7. Get Agent Clients
**GET** `/api/agents/:id/clients`

**Parameters**:
- `id` (ObjectId, required): Agent ID

**Query Parameters**:
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `status` (string, optional): Client status filter

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb74b24a42e9c5f2a23",
      "name": "Client Name",
      "email": "client@example.com",
      "phone": "+1234567890",
      "status": "active",
      "totalPolicies": 3,
      "totalPremium": 5000
    }
  ],
  "pagination": { /* ... */ },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 8. Get Agent Policies
**GET** `/api/agents/:id/policies`

**Parameters**:
- `id` (ObjectId, required): Agent ID

**Response**: 200 OK (similar to clients endpoint)

### 9. Get Agent Commissions
**GET** `/api/agents/:id/commissions`

**Parameters**:
- `id` (ObjectId, required): Agent ID

**Query Parameters**:
- `startDate` (date, optional): Start date filter
- `endDate` (date, optional): End date filter
- `status` (string, optional): Commission status filter

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "totalCommissions": 15000,
    "paidCommissions": 12000,
    "pendingCommissions": 3000,
    "commissionHistory": [
      {
        "_id": "60d5ecb74b24a42e9c5f2a24",
        "policyId": "60d5ecb74b24a42e9c5f2a25",
        "amount": 150,
        "rate": 10,
        "status": "paid",
        "paidDate": "2024-01-15T10:00:00.000Z",
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 10. Get Agent Performance
**GET** `/api/agents/:id/performance`

**Parameters**:
- `id` (ObjectId, required): Agent ID

**Query Parameters**:
- `period` (string, optional): Time period (month, quarter, year)
- `year` (number, optional): Specific year

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "overview": {
      "clientsCount": 45,
      "policiesCount": 67,
      "totalPremium": 125000,
      "conversionRate": 75.5,
      "avgDealSize": 1865
    },
    "monthlyData": [
      {
        "month": "2024-01",
        "newClients": 5,
        "newPolicies": 8,
        "premium": 12000,
        "commission": 1200
      }
    ],
    "targets": {
      "monthly": {
        "policies": 8,
        "premium": 15000
      },
      "quarterly": {
        "policies": 24,
        "premium": 45000
      },
      "annual": {
        "policies": 96,
        "premium": 180000
      }
    },
    "achievements": [
      {
        "title": "Top Performer Q1 2024",
        "date": "2024-03-31T00:00:00.000Z",
        "description": "Exceeded quarterly targets by 150%"
      }
    ]
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 11. Add Agent Note
**POST** `/api/agents/:id/notes`

**Parameters**:
- `id` (ObjectId, required): Agent ID

**Request Body**:
```json
{
  "content": "Performance review completed",
  "isPrivate": false,
  "tags": ["performance", "review"]
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "_id": "60d5ecb74b24a42e9c5f2a26",
    "content": "Performance review completed",
    "createdBy": "60d5ecb74b24a42e9c5f2a1c",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "isPrivate": false,
    "tags": ["performance", "review"]
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 12. Update Agent Performance Targets
**PUT** `/api/agents/:id/targets`

**Parameters**:
- `id` (ObjectId, required): Agent ID

**Request Body**:
```json
{
  "monthly": {
    "policies": 10,
    "premium": 18000
  },
  "quarterly": {
    "policies": 30,
    "premium": 54000
  },
  "annual": {
    "policies": 120,
    "premium": 216000
  }
}
```

**Response**: 200 OK

### 13. Search Agents
**GET** `/api/agents/search/:query`

**Parameters**:
- `query` (string, required): Search query

**Response**: 200 OK

### 14. Get Agent Statistics
**GET** `/api/agents/stats/summary`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "totalAgents": 50,
    "activeAgents": 45,
    "inactiveAgents": 3,
    "onboardingAgents": 2,
    "avgCommissionRate": 11.2,
    "topPerformers": [
      {
        "_id": "60d5ecb74b24a42e9c5f2a1b",
        "name": "John Smith",
        "totalPremium": 125000,
        "conversionRate": 75.5
      }
    ],
    "bySpecialization": {
      "Life Insurance": 20,
      "Health Insurance": 15,
      "Auto Insurance": 10,
      "Home Insurance": 5
    },
    "byRegion": {
      "North": 15,
      "South": 12,
      "East": 13,
      "West": 10
    }
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No valid token provided.",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Agent not found",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

## Rate Limiting
- 100 requests per minute per IP for general endpoints
- 1000 requests per minute for authenticated users
- 5000 requests per minute for super admin users

## Data Validation Rules
- Agent IDs must be unique and auto-generated
- Email addresses must be unique and valid
- License numbers must be unique
- Commission rates must be between 0 and 100
- Phone numbers must follow international format
- All required fields must be provided
