
# Claims Form Data API Documentation

## Overview
API endpoints for fetching policies and clients data for claims forms with role-based access control.

## Base URL
```
http://localhost:5000/api/claims/form-data
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Get Policies for Claim Form
**GET** `/policies`

**Description:** Get list of policies available for creating claims based on user role

**Access Control:**
- **Super Admin:** All policies in the system
- **Manager:** All policies in their region/team
- **Agent:** Only policies assigned to them

**Query Parameters:**
- `search` (string, optional): Search in policy number, client name
- `type` (string, optional): Filter by insurance type (health|life|auto|property)
- `status` (string, optional): Filter by policy status (active|expired|cancelled)
- `limit` (number, optional): Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "policyNumber": "POL-2025-0125",
      "type": "health",
      "status": "active",
      "clientId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "displayName": "John Doe",
        "email": "john.doe@email.com"
      },
      "company": "HDFC ERGO",
      "premium": {
        "amount": 15000,
        "frequency": "annual"
      },
      "coverage": {
        "amount": 500000
      },
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2025-12-31T23:59:59Z"
    }
  ],
  "total": 25
}
```

### 2. Get Clients for Claim Form
**GET** `/clients`

**Description:** Get list of clients available for creating claims based on user role

**Access Control:**
- **Super Admin:** All clients in the system
- **Manager:** All clients in their region/team
- **Agent:** Only clients assigned to them

**Query Parameters:**
- `search` (string, optional): Search in client name, email, clientId
- `type` (string, optional): Filter by client type (individual|corporate|group)
- `status` (string, optional): Filter by client status (Active|Inactive|Pending)
- `limit` (number, optional): Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "clientId": "CL001",
      "clientType": "individual",
      "displayName": "John Doe",
      "email": "john.doe@email.com",
      "phone": "9876543210",
      "status": "Active",
      "activePoliciesCount": 3,
      "lastClaimDate": "2024-12-15T10:30:00Z"
    }
  ],
  "total": 120
}
```

### 3. Get Policy Details
**GET** `/policy/:policyId`

**Description:** Get detailed information about a specific policy for claim creation

**Access Control:**
- **Super Admin:** Any policy
- **Manager:** Policies in their region/team
- **Agent:** Only policies assigned to them

**URL Parameters:**
- `policyId` (string, required): Policy ObjectId

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "policyNumber": "POL-2025-0125",
    "type": "health",
    "subType": "Individual Health Insurance",
    "status": "active",
    "clientId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "clientId": "CL001",
      "displayName": "John Doe",
      "email": "john.doe@email.com",
      "phone": "9876543210",
      "clientType": "individual"
    },
    "company": "HDFC ERGO",
    "companyPolicyNumber": "HDFC-H-2025-001234",
    "premium": {
      "amount": 15000,
      "frequency": "annual",
      "nextDueDate": "2025-12-31T23:59:59Z"
    },
    "coverage": {
      "amount": 500000,
      "deductible": 5000,
      "benefits": [
        "Hospitalization",
        "Day Care Procedures",
        "Pre and Post Hospitalization"
      ],
      "exclusions": [
        "Pre-existing diseases (2 years)",
        "Cosmetic surgery"
      ]
    },
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "assignedAgentId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "firstName": "Agent",
      "lastName": "Smith",
      "email": "agent.smith@company.com"
    },
    "claimsHistory": {
      "totalClaims": 2,
      "settledClaims": 1,
      "pendingClaims": 1,
      "totalClaimedAmount": 45000,
      "totalSettledAmount": 25000
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid policy ID format"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. You can only view policies assigned to you."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Policy not found or not accessible"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Usage Examples

### Get Policies for Agent
```javascript
// Agent gets only assigned policies
fetch('/api/claims/form-data/policies?type=health&status=active', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
```

### Get Policy Details
```javascript
// Get specific policy for claim creation
fetch('/api/claims/form-data/policy/64f8a1b2c3d4e5f6a7b8c9d0', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
```

### Search Clients
```javascript
// Search for clients by name or email
fetch('/api/claims/form-data/clients?search=john&limit=20', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
```

## Role-Based Data Access

### Agent Access Rules
- Can only see policies where `assignedAgentId` matches their user ID
- Can only see clients where `assignedAgentId` matches their user ID
- Cannot access policies/clients assigned to other agents

### Manager Access Rules
- Can see all policies and clients in their region/team
- Access scope determined by manager's team assignment
- Can view data across multiple agents under their management

### Super Admin Access Rules
- Full access to all policies and clients
- No restrictions on data access
- Can view system-wide information

## Data Relationships

```
User (Agent/Manager/Super Admin)
  ↓
Policy (assignedAgentId → User._id)
  ↓
Client (assignedAgentId → User._id)
  ↓
Claim (policyId → Policy._id, clientId → Client._id)
```
