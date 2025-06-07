
# Activities API Documentation

## Overview
The Activities API provides comprehensive functionality for managing and tracking user activities within the insurance management system. This API supports CRUD operations, advanced filtering, search capabilities, bulk operations, and detailed analytics.

## Base URL
```
{API_BASE_URL}/api/activities
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Models

### Activity Model
```javascript
{
  _id: ObjectId,
  activityId: String, // Auto-generated unique ID (ACT-YYYYMM-XXXXXX)
  action: String, // Required, max 200 chars
  type: String, // Enum: ['client', 'policy', 'claim', 'quotation', 'lead', 'payment', 'document', 'commission', 'reminder', 'system']
  description: String, // Required, max 1000 chars
  details: String, // Optional, max 2000 chars
  entityType: String, // Enum: ['client', 'policy', 'claim', 'quotation', 'lead', 'agent', 'user']
  entityId: ObjectId, // Reference to the related entity
  entityName: String, // Name of the related entity
  clientId: ObjectId, // Optional reference to Client
  clientName: String, // Optional client name
  agentId: ObjectId, // Required reference to User (agent)
  agentName: String, // Required agent name
  userId: ObjectId, // Required reference to User (performer)
  userName: String, // Required user name
  metadata: {
    policyId: ObjectId,
    policyNumber: String,
    claimId: ObjectId,
    claimNumber: String,
    quotationId: ObjectId,
    quoteId: String,
    leadId: ObjectId,
    amount: Number,
    oldValue: String,
    newValue: String,
    ipAddress: String,
    userAgent: String
  },
  priority: String, // Enum: ['low', 'medium', 'high', 'critical'], default: 'medium'
  status: String, // Enum: ['active', 'archived', 'hidden'], default: 'active'
  tags: [String], // Array of tags
  isSystemGenerated: Boolean, // default: false
  isVisible: Boolean, // default: true
  createdBy: ObjectId, // Reference to User
  updatedBy: ObjectId, // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

## Endpoints

### 1. Get All Activities
Retrieve activities with filtering, pagination, and search capabilities.

**Endpoint:** `GET /api/activities`

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 20, max: 100) - Number of activities per page
- `type` (string) - Filter by activity type ('client', 'policy', 'claim', etc.)
- `entityType` (string) - Filter by entity type
- `agentId` (string) - Filter by agent ID
- `clientId` (string) - Filter by client ID
- `userId` (string) - Filter by user ID
- `entityId` (string) - Filter by entity ID
- `priority` (string) - Filter by priority level
- `status` (string, default: 'active') - Filter by status
- `search` (string) - Text search across multiple fields
- `sortBy` (string, default: 'createdAt') - Sort field
- `sortOrder` (string, default: 'desc') - Sort order ('asc', 'desc')
- `dateFilter` (string) - Predefined date filters ('today', 'yesterday', 'last7days', etc.)
- `startDate` (date) - Custom date range start
- `endDate` (date) - Custom date range end
- `isRecent` (boolean) - Filter activities from last 24 hours
- `tags` (string) - Comma-separated tags filter

**Example Request:**
```bash
GET /api/activities?page=1&limit=20&type=client&priority=high&dateFilter=last7days
```

**Response:**
```json
{
  "success": true,
  "message": "Activities retrieved successfully",
  "data": {
    "activities": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "activityId": "ACT-202406-000001",
        "action": "New client registered",
        "type": "client",
        "description": "A new client has been registered in the system",
        "entityType": "client",
        "entityId": "507f1f77bcf86cd799439012",
        "entityName": "John Doe",
        "agentId": {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "Agent",
          "lastName": "Smith",
          "email": "agent@example.com"
        },
        "priority": "high",
        "status": "active",
        "createdAt": "2024-06-07T10:30:00.000Z",
        "updatedAt": "2024-06-07T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    }
  }
}
```

### 2. Get Activity by ID
Retrieve a specific activity by its ID.

**Endpoint:** `GET /api/activities/:id`

**Parameters:**
- `id` (required) - Activity ID

**Example Request:**
```bash
GET /api/activities/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Activity retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "activityId": "ACT-202406-000001",
    "action": "New client registered",
    "type": "client",
    "description": "A new client has been registered in the system",
    "details": "Client registered with email john@example.com and phone +1234567890",
    "entityType": "client",
    "entityId": "507f1f77bcf86cd799439012",
    "entityName": "John Doe",
    "priority": "high",
    "status": "active",
    "tags": ["new-client", "high-value"],
    "metadata": {
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0..."
    },
    "createdAt": "2024-06-07T10:30:00.000Z",
    "updatedAt": "2024-06-07T10:30:00.000Z"
  }
}
```

### 3. Create Activity
Create a new activity record.

**Endpoint:** `POST /api/activities`

**Request Body:**
```json
{
  "action": "New client registered",
  "type": "client",
  "description": "A new client has been registered in the system",
  "details": "Client registered with email john@example.com",
  "entityType": "client",
  "entityId": "507f1f77bcf86cd799439012",
  "entityName": "John Doe",
  "clientId": "507f1f77bcf86cd799439012",
  "clientName": "John Doe",
  "agentId": "507f1f77bcf86cd799439013",
  "agentName": "Agent Smith",
  "priority": "high",
  "tags": ["new-client"],
  "metadata": {
    "amount": 50000
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Activity created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "activityId": "ACT-202406-000001",
    "action": "New client registered",
    "type": "client",
    "description": "A new client has been registered in the system",
    "priority": "high",
    "status": "active",
    "createdAt": "2024-06-07T10:30:00.000Z"
  }
}
```

### 4. Update Activity
Update an existing activity.

**Endpoint:** `PUT /api/activities/:id`

**Parameters:**
- `id` (required) - Activity ID

**Request Body:**
```json
{
  "action": "Updated activity action",
  "description": "Updated description",
  "details": "Additional details about the update",
  "priority": "critical",
  "tags": ["updated", "important"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Activity updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "action": "Updated activity action",
    "description": "Updated description",
    "priority": "critical",
    "updatedAt": "2024-06-07T11:00:00.000Z"
  }
}
```

### 5. Delete Activity
Soft delete an activity (marks as hidden).

**Endpoint:** `DELETE /api/activities/:id`

**Parameters:**
- `id` (required) - Activity ID

**Access:** Managers and Super Admins only

**Response:**
```json
{
  "success": true,
  "message": "Activity deleted successfully"
}
```

### 6. Get Activity Statistics
Retrieve aggregated statistics about activities.

**Endpoint:** `GET /api/activities/stats`

**Query Parameters:**
- `agentId` (string) - Filter stats by agent
- `startDate` (date) - Custom date range start
- `endDate` (date) - Custom date range end
- `period` (string, default: 'last30days') - Predefined period
- `groupBy` (string) - Group statistics by field

**Example Request:**
```bash
GET /api/activities/stats?period=last30days&groupBy=type
```

**Response:**
```json
{
  "success": true,
  "message": "Activity statistics retrieved successfully",
  "data": {
    "total": 250,
    "recent": 15,
    "byType": [
      {
        "type": "client",
        "count": 75,
        "highPriority": 12
      },
      {
        "type": "policy",
        "count": 68,
        "highPriority": 8
      },
      {
        "type": "claim",
        "count": 45,
        "highPriority": 15
      }
    ],
    "period": "last30days",
    "groupedBy": {
      "field": "type",
      "data": [
        {
          "_id": "client",
          "count": 75,
          "types": ["client"]
        }
      ]
    }
  }
}
```

### 7. Search Activities
Search activities using text search.

**Endpoint:** `GET /api/activities/search/:query`

**Parameters:**
- `query` (required) - Search query string (minimum 2 characters)

**Query Parameters:**
- `limit` (number, default: 10) - Number of results to return
- `type` (string) - Filter results by activity type
- `agentId` (string) - Filter results by agent

**Example Request:**
```bash
GET /api/activities/search/client%20registration?limit=5&type=client
```

**Response:**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "activityId": "ACT-202406-000001",
      "action": "Client registration completed",
      "type": "client",
      "description": "New client registration process completed",
      "entityName": "John Doe",
      "createdAt": "2024-06-07T10:30:00.000Z"
    }
  ]
}
```

### 8. Bulk Actions
Perform bulk operations on multiple activities.

**Endpoint:** `POST /api/activities/bulk`

**Request Body:**
```json
{
  "activityIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "action": "archive",
  "value": "important" // Required for addTag, removeTag, changePriority actions
}
```

**Available Actions:**
- `archive` - Archive activities
- `hide` - Hide activities
- `show` - Show activities
- `delete` - Delete activities (Managers/Super Admins only)
- `addTag` - Add tag to activities (requires `value`)
- `removeTag` - Remove tag from activities (requires `value`)
- `changePriority` - Change priority (requires `value`)

**Response:**
```json
{
  "success": true,
  "message": "Bulk archive completed successfully",
  "data": {
    "affected": 2,
    "action": "archive",
    "value": null
  }
}
```

## Role-Based Access Control

### Agent Role
- Can view and create activities for their own clients
- Can update their own activities
- Cannot delete activities
- Cannot access other agents' activities

### Manager Role
- Can view all activities
- Can create, update, and delete any activity
- Can perform all bulk operations
- Can access all statistics

### Super Admin Role
- Full access to all activities and operations
- Can perform system-level activities
- Can manage all user activities

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "action": "Action must be at least 2 characters long",
    "type": "Invalid activity type"
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Activity not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Usage Examples

### Create Client Activity
```javascript
const activityData = {
  action: "New client registered",
  type: "client",
  description: "Client John Doe has been registered",
  entityType: "client",
  entityId: "client123",
  entityName: "John Doe",
  clientId: "client123",
  clientName: "John Doe",
  agentId: "agent456",
  agentName: "Agent Smith",
  priority: "high"
};

fetch('/api/activities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify(activityData)
});
```

### Get Recent Activities
```javascript
fetch('/api/activities?isRecent=true&limit=10', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

### Bulk Archive Activities
```javascript
const bulkData = {
  activityIds: ["id1", "id2", "id3"],
  action: "archive"
};

fetch('/api/activities/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify(bulkData)
});
```

## Best Practices

1. **Activity Creation**: Always provide meaningful action descriptions and sufficient details
2. **Metadata Usage**: Use metadata to store additional context about the activity
3. **Tag Management**: Use consistent tagging conventions for better organization
4. **Performance**: Use pagination and filtering to manage large datasets
5. **Security**: Ensure proper role-based access control implementation
6. **Monitoring**: Regularly review activity statistics for system insights

## Rate Limiting
- Standard rate limiting applies: 100 requests per minute per user
- Bulk operations count as single requests regardless of the number of items processed

## Webhook Support
Activities can trigger webhooks for real-time notifications:
- Activity created
- Activity updated
- Activity deleted
- Bulk operations completed

Configure webhooks in the system settings to receive activity notifications at your specified endpoints.
