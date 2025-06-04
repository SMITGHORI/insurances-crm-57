
# Client Module API Documentation

## Overview
RESTful API for managing clients in the insurance CRM system with role-based access control.

## Base URL
```
http://localhost:5000/api/clients
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Get All Clients
**GET** `/`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search in name, email, clientId
- `type` (string, optional): Filter by clientType (individual|corporate|group)
- `status` (string, optional): Filter by status (Active|Inactive|Pending)
- `sortField` (string, optional): Sort field (name|createdAt|status)
- `sortDirection` (string, optional): Sort direction (asc|desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "clientId": "CL001",
      "clientType": "individual",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com",
      "phone": "9876543210",
      "status": "Active",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### 2. Get Client by ID
**GET** `/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "clientId": "CL001",
    "clientType": "individual",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "phone": "9876543210",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "status": "Active",
    "assignedAgentId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Create New Client
**POST** `/`

**Request Body:**
```json
{
  "clientType": "individual",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "phone": "9876543210",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "dob": "1985-06-15",
  "gender": "male",
  "panNumber": "ABCDE1234F",
  "assignedAgentId": "64f8a1b2c3d4e5f6a7b8c9d1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "clientId": "CL001",
    "clientType": "individual",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "status": "Active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Update Client
**PUT** `/:id`

**Request Body:** (Same as create, all fields optional)

**Response:**
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "clientId": "CL001",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

### 5. Delete Client
**DELETE** `/:id`

**Response:**
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

### 6. Upload Client Document
**POST** `/:id/documents`

**Request:** Multipart form data
- `document` (file): Document file
- `documentType` (string): Type of document (pan|aadhaar|idProof|addressProof)

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "documentId": "64f8a1b2c3d4e5f6a7b8c9d2",
    "documentType": "pan",
    "fileName": "pan_card.pdf",
    "fileUrl": "/uploads/documents/64f8a1b2c3d4e5f6a7b8c9d2.pdf",
    "uploadedAt": "2024-01-15T12:00:00Z"
  }
}
```

### 7. Get Client Documents
**GET** `/:id/documents`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "documentId": "64f8a1b2c3d4e5f6a7b8c9d2",
      "documentType": "pan",
      "fileName": "pan_card.pdf",
      "fileUrl": "/uploads/documents/64f8a1b2c3d4e5f6a7b8c9d2.pdf",
      "uploadedAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

### 8. Delete Client Document
**DELETE** `/:id/documents/:documentId`

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
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
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Client not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Role-Based Access Control

### Super Admin
- Full access to all endpoints
- Can view, create, update, delete any client
- Can assign agents to clients

### Agent
- Can only view clients assigned to them
- Can update clients assigned to them
- Cannot delete clients
- Cannot view other agents' clients

### Manager
- Can view all clients in their region/team
- Can assign agents to clients
- Can update client information
- Cannot delete clients
