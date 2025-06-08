
# Follow-up Management API Documentation

## Overview
RESTful API for managing client interactions and follow-ups in the insurance CRM system.

## Base URLs
- Interactions: `http://localhost:5000/api/interactions`
- Follow-ups: `http://localhost:5000/api/follow-ups`

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Interactions API

### 1. Get All Interactions
**GET** `/api/interactions`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `clientId` (string, optional): Filter by client ID
- `type` (string, optional): Filter by interaction type
- `outcome` (string, optional): Filter by outcome
- `priority` (string, optional): Filter by priority
- `startDate` (date, optional): Start date for date range filter
- `endDate` (date, optional): End date for date range filter
- `search` (string, optional): Search in subject, description, notes

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "interactionId": "INT000001",
      "clientId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "displayName": "John Doe",
        "email": "john@example.com"
      },
      "type": "call",
      "subject": "Policy renewal discussion",
      "description": "Discussed renewal options for health policy",
      "outcome": "positive",
      "priority": "medium",
      "interactionDate": "2024-01-15T10:30:00Z",
      "followUpRequired": true,
      "followUpDate": "2024-01-20T10:00:00Z"
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

### 2. Create Interaction
**POST** `/api/interactions`

**Request Body:**
```json
{
  "clientId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "policyId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "type": "call",
  "subject": "Policy renewal discussion",
  "description": "Discussed renewal options and premium changes",
  "outcome": "positive",
  "priority": "medium",
  "duration": 30,
  "interactionDate": "2024-01-15T10:30:00Z",
  "notes": "Client interested in upgrading coverage",
  "followUpRequired": true,
  "followUpDate": "2024-01-20T10:00:00Z",
  "followUpNotes": "Prepare quotes for upgraded coverage"
}
```

### 3. Get Interactions by Client
**GET** `/api/interactions/client/:clientId`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "interactionId": "INT000001",
      "type": "call",
      "subject": "Policy renewal discussion",
      "interactionDate": "2024-01-15T10:30:00Z",
      "outcome": "positive"
    }
  ]
}
```

### 4. Upload Interaction Attachment
**POST** `/api/interactions/:id/attachments`

**Request:** Multipart form data
- `attachment` (file): Document file

**Response:**
```json
{
  "success": true,
  "message": "Attachment uploaded successfully",
  "data": {
    "fileName": "meeting_notes.pdf",
    "fileUrl": "/uploads/interactions/64f8a1b2c3d4e5f6a7b8c9d2.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "uploadedAt": "2024-01-15T12:00:00Z"
  }
}
```

## Follow-ups API

### 1. Get All Follow-ups
**GET** `/api/follow-ups`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `clientId` (string, optional): Filter by client ID
- `status` (string, optional): Filter by status (default: 'scheduled')
- `priority` (string, optional): Filter by priority
- `type` (string, optional): Filter by follow-up type
- `startDate` (date, optional): Start date for scheduled date filter
- `endDate` (date, optional): End date for scheduled date filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "followUpId": "FU000001",
      "clientId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "displayName": "John Doe",
        "email": "john@example.com"
      },
      "title": "Follow-up: Policy renewal discussion",
      "type": "call",
      "priority": "medium",
      "scheduledDate": "2024-01-20T00:00:00Z",
      "scheduledTime": "10:00",
      "status": "scheduled",
      "timeUntilFollowUp": "2 days"
    }
  ]
}
```

### 2. Create Follow-up
**POST** `/api/follow-ups`

**Request Body:**
```json
{
  "clientId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "policyId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "title": "Follow-up on quote request",
  "description": "Provide detailed quote for comprehensive coverage",
  "type": "call",
  "priority": "high",
  "scheduledDate": "2024-01-20",
  "scheduledTime": "10:00",
  "duration": 30,
  "tags": ["quote", "health_insurance"]
}
```

### 3. Complete Follow-up
**POST** `/api/follow-ups/:id/complete`

**Request Body:**
```json
{
  "outcome": "successful",
  "completionNotes": "Client agreed to upgrade policy. Sent new quote.",
  "nextFollowUpDate": "2024-01-25T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Follow-up completed successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "status": "completed",
    "completedDate": "2024-01-20T10:30:00Z",
    "outcome": "successful"
  }
}
```

### 4. Get Today's Follow-ups
**GET** `/api/follow-ups/today/list`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "followUpId": "FU000001",
      "clientId": {
        "displayName": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210"
      },
      "title": "Follow-up on quote request",
      "scheduledTime": "10:00",
      "priority": "high"
    }
  ]
}
```

### 5. Get Overdue Follow-ups
**GET** `/api/follow-ups/overdue/list`

### 6. Get Follow-up Statistics
**GET** `/api/follow-ups/stats/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFollowUps": 150,
    "completedFollowUps": 120,
    "scheduledFollowUps": 25,
    "cancelledFollowUps": 5,
    "todayCount": 8,
    "overdueCount": 3,
    "completionRate": 80,
    "averageDuration": 35.5
  }
}
```

## Data Models

### Interaction Schema
```javascript
{
  interactionId: String, // Auto-generated: INT000001
  clientId: ObjectId,
  policyId: ObjectId,
  agentId: ObjectId,
  type: ['call', 'email', 'meeting', 'whatsapp', 'sms', 'visit', 'other'],
  subject: String,
  description: String,
  outcome: ['positive', 'neutral', 'negative', 'follow_up_needed', 'no_response'],
  priority: ['low', 'medium', 'high', 'urgent'],
  duration: Number, // in minutes
  interactionDate: Date,
  notes: String,
  attachments: Array,
  tags: Array,
  followUpRequired: Boolean,
  followUpDate: Date,
  followUpNotes: String,
  status: ['completed', 'follow_up_scheduled', 'closed']
}
```

### Follow-up Schema
```javascript
{
  followUpId: String, // Auto-generated: FU000001
  clientId: ObjectId,
  policyId: ObjectId,
  agentId: ObjectId,
  interactionId: ObjectId,
  title: String,
  description: String,
  type: ['call', 'email', 'meeting', 'quote_follow_up', 'renewal_reminder', 'claim_check', 'policy_review', 'other'],
  priority: ['low', 'medium', 'high', 'urgent'],
  scheduledDate: Date,
  scheduledTime: String, // HH:MM format
  duration: Number, // in minutes
  status: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'],
  outcome: ['successful', 'reschedule_needed', 'not_interested', 'follow_up_needed', 'converted'],
  completedDate: Date,
  completionNotes: String,
  nextFollowUpDate: Date,
  tags: Array,
  attachments: Array
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
      "field": "scheduledDate",
      "message": "Scheduled date must be in the future"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Follow-up not found or access denied"
}
```

## Role-Based Access Control

### Agent
- Can view/create/update their own interactions and follow-ups
- Cannot view other agents' data
- Cannot delete interactions

### Manager
- Can view all interactions and follow-ups in their region
- Can assign follow-ups to agents
- Can view reports and statistics

### Super Admin
- Full access to all endpoints
- Can delete interactions and follow-ups
- Can view system-wide statistics
