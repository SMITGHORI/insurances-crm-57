
# Policies API Documentation

## Overview
This document provides comprehensive API documentation for the Insurance CRM Policies module built with Node.js, Express.js, and MongoDB.

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
- **Super Admin**: Full access to all policies and operations
- **Manager**: Access to all policies within their region/team
- **Agent**: Access only to policies assigned to them

## API Endpoints

### 1. Get All Policies
**GET** `/api/policies`

**Description**: Retrieve all policies with filtering, pagination, and search capabilities

**Query Parameters**:
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of items per page (default: 10, max: 100)
- `search` (string, optional): Search in policy number, client name, or company
- `status` (string, optional): Filter by policy status (active, expired, cancelled, pending)
- `type` (string, optional): Filter by policy type (life, health, auto, home, business)
- `clientId` (ObjectId, optional): Filter by specific client
- `agentId` (ObjectId, optional): Filter by assigned agent
- `sortField` (string, optional): Field to sort by (default: createdAt)
- `sortDirection` (string, optional): Sort direction (asc, desc) (default: desc)
- `minPremium` (number, optional): Minimum premium amount filter
- `maxPremium` (number, optional): Maximum premium amount filter
- `startDate` (date, optional): Filter policies created after this date
- `endDate` (date, optional): Filter policies created before this date

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb74b24a42e9c5f2a1b",
      "policyNumber": "POL-2024-001",
      "clientId": {
        "_id": "60d5ecb74b24a42e9c5f2a1a",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "type": "life",
      "status": "active",
      "company": "ABC Insurance",
      "premium": {
        "amount": 1200,
        "frequency": "annual"
      },
      "coverage": {
        "amount": 100000,
        "deductible": 500
      },
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.999Z",
      "assignedAgentId": "60d5ecb74b24a42e9c5f2a1c",
      "commission": {
        "rate": 10,
        "amount": 120
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

### 2. Get Policy by ID
**GET** `/api/policies/:id`

**Parameters**:
- `id` (ObjectId, required): Policy ID

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb74b24a42e9c5f2a1b",
    "policyNumber": "POL-2024-001",
    "clientId": {
      "_id": "60d5ecb74b24a42e9c5f2a1a",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "type": "life",
    "status": "active",
    "company": "ABC Insurance",
    "premium": {
      "amount": 1200,
      "frequency": "annual",
      "nextDueDate": "2024-12-01T00:00:00.000Z"
    },
    "coverage": {
      "amount": 100000,
      "deductible": 500,
      "benefits": ["Death Benefit", "Disability Coverage"]
    },
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "assignedAgentId": "60d5ecb74b24a42e9c5f2a1c",
    "commission": {
      "rate": 10,
      "amount": 120,
      "paid": false
    },
    "documents": [
      {
        "_id": "60d5ecb74b24a42e9c5f2a1d",
        "name": "Policy Document",
        "type": "policy_document",
        "url": "/uploads/policies/policy-doc.pdf",
        "uploadedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "paymentHistory": [
      {
        "_id": "60d5ecb74b24a42e9c5f2a1e",
        "amount": 1200,
        "date": "2024-01-01T10:00:00.000Z",
        "method": "bank_transfer",
        "status": "completed"
      }
    ],
    "renewalHistory": [
      {
        "_id": "60d5ecb74b24a42e9c5f2a1f",
        "renewalDate": "2024-01-01T00:00:00.000Z",
        "previousEndDate": "2023-12-31T23:59:59.999Z",
        "premium": 1200,
        "agentId": "60d5ecb74b24a42e9c5f2a1c"
      }
    ],
    "notes": [
      {
        "_id": "60d5ecb74b24a42e9c5f2a20",
        "content": "Client requested additional coverage",
        "createdBy": "60d5ecb74b24a42e9c5f2a1c",
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 3. Create New Policy
**POST** `/api/policies`

**Request Body**:
```json
{
  "policyNumber": "POL-2024-002",
  "clientId": "60d5ecb74b24a42e9c5f2a1a",
  "type": "life",
  "status": "active",
  "company": "ABC Insurance",
  "premium": {
    "amount": 1500,
    "frequency": "annual"
  },
  "coverage": {
    "amount": 150000,
    "deductible": 1000,
    "benefits": ["Death Benefit", "Disability Coverage"]
  },
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z",
  "assignedAgentId": "60d5ecb74b24a42e9c5f2a1c",
  "commission": {
    "rate": 12,
    "amount": 180
  }
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "message": "Policy created successfully",
  "data": {
    "_id": "60d5ecb74b24a42e9c5f2a21",
    "policyNumber": "POL-2024-002",
    // ... full policy object
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 4. Update Policy
**PUT** `/api/policies/:id`

**Parameters**:
- `id` (ObjectId, required): Policy ID

**Request Body**: (same as create, all fields optional)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Policy updated successfully",
  "data": {
    // ... updated policy object
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 5. Delete Policy
**DELETE** `/api/policies/:id`

**Parameters**:
- `id` (ObjectId, required): Policy ID

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Policy deleted successfully",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 6. Upload Policy Document
**POST** `/api/policies/:id/documents`

**Parameters**:
- `id` (ObjectId, required): Policy ID

**Request Body** (multipart/form-data):
- `document` (file, required): Document file
- `documentType` (string, required): Type of document (policy_document, claim_form, amendment, etc.)
- `name` (string, optional): Custom document name

**Response**: 201 Created
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "60d5ecb74b24a42e9c5f2a22",
    "name": "Updated Policy Document",
    "type": "policy_document",
    "url": "/uploads/policies/updated-policy-doc.pdf",
    "size": 245760,
    "uploadedAt": "2024-01-01T10:00:00.000Z"
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 7. Get Policy Documents
**GET** `/api/policies/:id/documents`

**Parameters**:
- `id` (ObjectId, required): Policy ID

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb74b24a42e9c5f2a22",
      "name": "Policy Document",
      "type": "policy_document",
      "url": "/uploads/policies/policy-doc.pdf",
      "size": 245760,
      "uploadedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 8. Delete Policy Document
**DELETE** `/api/policies/:id/documents/:documentId`

**Parameters**:
- `id` (ObjectId, required): Policy ID
- `documentId` (ObjectId, required): Document ID

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 9. Add Payment Record
**POST** `/api/policies/:id/payments`

**Parameters**:
- `id` (ObjectId, required): Policy ID

**Request Body**:
```json
{
  "amount": 1200,
  "method": "bank_transfer",
  "transactionId": "TXN-123456",
  "notes": "Annual premium payment"
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "message": "Payment record added successfully",
  "data": {
    "_id": "60d5ecb74b24a42e9c5f2a23",
    "amount": 1200,
    "date": "2024-01-01T10:00:00.000Z",
    "method": "bank_transfer",
    "status": "completed",
    "transactionId": "TXN-123456",
    "notes": "Annual premium payment"
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 10. Renew Policy
**POST** `/api/policies/:id/renew`

**Parameters**:
- `id` (ObjectId, required): Policy ID

**Request Body**:
```json
{
  "newEndDate": "2025-12-31T23:59:59.999Z",
  "premium": 1300,
  "commission": {
    "rate": 10,
    "amount": 130
  }
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Policy renewed successfully",
  "data": {
    // ... updated policy with renewal record
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 11. Search Policies
**GET** `/api/policies/search/:query`

**Parameters**:
- `query` (string, required): Search query

**Query Parameters**:
- `limit` (number, optional): Limit results (default: 10, max: 50)

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb74b24a42e9c5f2a1b",
      "policyNumber": "POL-2024-001",
      "clientName": "John Doe",
      "type": "life",
      "status": "active",
      "premium": 1200
    }
  ],
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 12. Get Policies by Agent
**GET** `/api/policies/agent/:agentId`

**Parameters**:
- `agentId` (ObjectId, required): Agent ID

**Response**: 200 OK (same format as Get All Policies)

### 13. Get Policy Statistics
**GET** `/api/policies/stats/summary`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "totalPolicies": 150,
    "activePolicies": 120,
    "expiredPolicies": 20,
    "cancelledPolicies": 10,
    "totalPremium": 180000,
    "avgPremium": 1200,
    "byType": {
      "life": 60,
      "health": 40,
      "auto": 30,
      "home": 15,
      "business": 5
    },
    "byStatus": {
      "active": 120,
      "expired": 20,
      "cancelled": 10
    },
    "recentPolicies": 5,
    "renewalsThisMonth": 8
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
      "field": "premium.amount",
      "message": "Premium amount must be a positive number",
      "value": -100
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
  "message": "Policy not found",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

## Rate Limiting
- 100 requests per minute per IP for general endpoints
- 1000 requests per minute for authenticated users
- 5000 requests per minute for super admin users

## Data Validation Rules
- Policy numbers must be unique
- Premium amounts must be positive numbers
- Start date cannot be in the past (for new policies)
- End date must be after start date
- Commission rates must be between 0 and 100
- Client must exist and be active
- Agent must exist and be active
