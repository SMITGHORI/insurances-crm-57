
# Claims API Documentation

## Overview
The Claims API provides comprehensive functionality for managing insurance claims within the CRM system. This includes claims processing, document management, status tracking, and commission calculations.

## Base URL
```
http://localhost:5000/api/claims
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Role-Based Access Control
- **Super Admin**: Full access to all claims and operations
- **Manager**: Access to team claims and management functions
- **Agent**: Access only to assigned claims

## API Endpoints

### 1. Get All Claims
**GET** `/api/claims`

**Description**: Retrieve all claims with filtering, pagination, and search capabilities.

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search in claim number, description
- `status` (string, optional): Filter by claim status
- `claimType` (string, optional): Filter by claim type
- `priority` (string, optional): Filter by priority level
- `assignedTo` (string, optional): Filter by assigned agent
- `clientId` (string, optional): Filter by client
- `policyId` (string, optional): Filter by policy
- `minAmount` (number, optional): Minimum claim amount
- `maxAmount` (number, optional): Maximum claim amount
- `dateFrom` (date, optional): Claims from date
- `dateTo` (date, optional): Claims to date
- `sortField` (string, optional): Field to sort by
- `sortDirection` (string, optional): 'asc' or 'desc'

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "claim_id",
      "claimNumber": "CLM-2024-001",
      "clientId": "client_id",
      "policyId": "policy_id",
      "claimType": "Auto",
      "status": "Under Review",
      "priority": "High",
      "claimAmount": 25000,
      "approvedAmount": 22000,
      "incidentDate": "2024-01-15T00:00:00.000Z",
      "reportedDate": "2024-01-16T00:00:00.000Z",
      "description": "Vehicle collision claim",
      "assignedTo": "agent_id",
      "estimatedSettlement": "2024-02-15T00:00:00.000Z",
      "documents": ["doc1_id", "doc2_id"],
      "notes": ["note1_id", "note2_id"],
      "timeline": [],
      "createdAt": "2024-01-16T00:00:00.000Z",
      "updatedAt": "2024-01-20T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

### 2. Get Claim by ID
**GET** `/api/claims/:id`

**Description**: Retrieve a specific claim by its ID.

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "claim_id",
    "claimNumber": "CLM-2024-001",
    "clientId": {
      "_id": "client_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com"
    },
    "policyId": {
      "_id": "policy_id",
      "policyNumber": "POL-2024-001",
      "policyType": "Auto Insurance"
    },
    // ... full claim details with populated references
  },
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

### 3. Create New Claim
**POST** `/api/claims`

**Request Body**:
```json
{
  "clientId": "client_id",
  "policyId": "policy_id",
  "claimType": "Auto",
  "priority": "High",
  "claimAmount": 25000,
  "incidentDate": "2024-01-15",
  "description": "Vehicle collision on Highway 101",
  "assignedTo": "agent_id",
  "estimatedSettlement": "2024-02-15"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Claim created successfully",
  "data": {
    "_id": "new_claim_id",
    "claimNumber": "CLM-2024-002",
    // ... full claim details
  },
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

### 4. Update Claim
**PUT** `/api/claims/:id`

**Request Body**: (partial update supported)
```json
{
  "status": "Approved",
  "approvedAmount": 22000,
  "description": "Updated description"
}
```

### 5. Delete Claim
**DELETE** `/api/claims/:id`

**Description**: Soft delete a claim (sets status to 'Deleted').

### 6. Upload Claim Document
**POST** `/api/claims/:id/documents`

**Request**: Multipart form data
- `document` (file): Document file
- `documentType` (string): Type of document
- `name` (string, optional): Custom document name

### 7. Get Claim Documents
**GET** `/api/claims/:id/documents`

### 8. Delete Claim Document
**DELETE** `/api/claims/:id/documents/:documentId`

### 9. Update Claim Status
**PUT** `/api/claims/:id/status`

**Request Body**:
```json
{
  "status": "Approved",
  "reason": "All documentation verified",
  "approvedAmount": 22000
}
```

### 10. Add Claim Note
**POST** `/api/claims/:id/notes`

**Request Body**:
```json
{
  "content": "Contacted client for additional information",
  "type": "internal",
  "priority": "normal"
}
```

### 11. Get Claim Notes
**GET** `/api/claims/:id/notes`

### 12. Get Claims Statistics
**GET** `/api/claims/stats`

**Query Parameters**:
- `period` (string): 'day', 'week', 'month', 'year'
- `startDate` (date, optional)
- `endDate` (date, optional)

### 13. Search Claims
**GET** `/api/claims/search/:query`

### 14. Bulk Update Claims
**POST** `/api/claims/bulk/update`

**Request Body**:
```json
{
  "claimIds": ["claim1_id", "claim2_id"],
  "updateData": {
    "assignedTo": "new_agent_id",
    "priority": "High"
  }
}
```

### 15. Export Claims
**GET** `/api/claims/export`

**Query Parameters**: Same as Get All Claims for filtering

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "claimAmount",
      "message": "Claim amount must be a positive number"
    }
  ],
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No valid token provided.",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Claim not found",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user

## File Upload Limitations
- Maximum file size: 10MB
- Supported formats: PDF, DOC, DOCX, JPG, PNG, XLSX
- Maximum 10 files per claim

## Status Workflow
1. **Reported** → Initial claim submission
2. **Under Review** → Claim being investigated
3. **Pending** → Waiting for additional information
4. **Approved** → Claim approved for payment
5. **Rejected** → Claim denied
6. **Settled** → Payment completed
7. **Closed** → Claim finalized

## Business Rules
- Claims can only be created for active policies
- Claim amount cannot exceed policy coverage limits
- Only assigned agents or managers can update claim status
- Documents are required before claim approval
- Timeline events are automatically created for status changes
