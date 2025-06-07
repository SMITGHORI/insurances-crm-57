# Leads API Documentation

## Overview

The Leads API provides comprehensive functionality for managing insurance leads, including CRUD operations, follow-ups, notes, assignments, and conversion tracking. This API is built with Node.js, Express, and MongoDB with proper authentication, authorization, and validation.

## Base URL

```
Production: https://your-domain.com/api/leads
Development: http://localhost:5000/api/leads
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Authorization Roles

- **Super Admin**: Full access to all leads and operations
- **Manager**: Access to all leads in their team/region
- **Agent**: Access only to assigned leads

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message",
      "value": "invalid_value"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Endpoints

### 1. Get All Leads

**GET** `/api/leads`

Retrieve all leads with filtering, pagination, and search capabilities.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number for pagination |
| limit | integer | 10 | Number of items per page (max 100) |
| status | string | all | Filter by status: 'New', 'In Progress', 'Qualified', 'Not Interested', 'Converted', 'Lost', 'all' |
| source | string | all | Filter by source: 'Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Advertisement', 'Other', 'all' |
| priority | string | all | Filter by priority: 'High', 'Medium', 'Low', 'all' |
| assignedTo | string | all | Filter by assigned agent name |
| search | string | - | Search in name, email, phone, leadId, additionalInfo |
| sortBy | string | createdAt | Sort field: 'createdAt', 'updatedAt', 'name', 'lastInteraction', 'nextFollowUp', 'priority' |
| sortOrder | string | desc | Sort order: 'asc', 'desc' |
| dateFrom | date | - | Filter leads created from this date |
| dateTo | date | - | Filter leads created up to this date |

#### Example Request

```bash
GET /api/leads?page=1&limit=20&status=New&source=Website&search=john&sortBy=createdAt&sortOrder=desc
```

#### Example Response

```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": {
    "leads": [
      {
        "_id": "64a1b2c3d4e5f67890123456",
        "leadId": "LD000001",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "9876543210",
        "address": "123 Main Street, Mumbai",
        "source": "Website",
        "product": "Health Insurance",
        "status": "New",
        "budget": 500000,
        "assignedTo": {
          "agentId": "64a1b2c3d4e5f67890123457",
          "name": "Agent Smith"
        },
        "priority": "High",
        "additionalInfo": "Looking for family health insurance",
        "followUps": [],
        "notes": [],
        "nextFollowUp": "2024-01-20T10:00:00.000Z",
        "lastInteraction": "2024-01-15T10:30:00.000Z",
        "tags": ["family", "urgent"],
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 45,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    },
    "totalCount": 45
  }
}
```

---

### 2. Get Lead by ID

**GET** `/api/leads/:id`

Retrieve a specific lead by its ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the lead |

#### Example Request

```bash
GET /api/leads/64a1b2c3d4e5f67890123456
```

#### Example Response

```json
{
  "success": true,
  "message": "Lead retrieved successfully",
  "data": {
    "_id": "64a1b2c3d4e5f67890123456",
    "leadId": "LD000001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "address": "123 Main Street, Mumbai",
    "source": "Website",
    "product": "Health Insurance",
    "status": "New",
    "budget": 500000,
    "assignedTo": {
      "agentId": {
        "_id": "64a1b2c3d4e5f67890123457",
        "name": "Agent Smith",
        "email": "agent.smith@company.com"
      },
      "name": "Agent Smith"
    },
    "priority": "High",
    "additionalInfo": "Looking for family health insurance",
    "followUps": [
      {
        "_id": "64a1b2c3d4e5f67890123458",
        "date": "2024-01-16T00:00:00.000Z",
        "time": "14:30",
        "type": "Call",
        "outcome": "Customer interested in premium plan",
        "nextAction": "Send brochure",
        "createdBy": "Agent Smith",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "notes": [
      {
        "_id": "64a1b2c3d4e5f67890123459",
        "content": "Customer has specific requirements for maternity coverage",
        "createdBy": "Agent Smith",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "nextFollowUp": "2024-01-20T10:00:00.000Z",
    "lastInteraction": "2024-01-15T10:30:00.000Z",
    "tags": ["family", "urgent"],
    "customFields": {
      "referredBy": "John Smith",
      "campaignId": "CAMP001"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3. Create New Lead

**POST** `/api/leads`

Create a new lead with the provided information.

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "9876543210",
  "address": "123 Main Street, Mumbai",
  "source": "Website",
  "product": "Health Insurance",
  "status": "New",
  "budget": 500000,
  "assignedTo": {
    "agentId": "64a1b2c3d4e5f67890123457",
    "name": "Agent Smith"
  },
  "priority": "High",
  "additionalInfo": "Looking for family health insurance",
  "nextFollowUp": "2024-01-20T10:00:00.000Z",
  "tags": ["family", "urgent"],
  "customFields": {
    "referredBy": "John Smith",
    "campaignId": "CAMP001"
  }
}
```

#### Required Fields

- `name` (string, 2-100 chars)
- `email` (valid email format)
- `phone` (10-15 digits with optional formatting)
- `source` (enum: Website, Referral, Cold Call, Social Media, Event, Advertisement, Other)
- `product` (enum: Health Insurance, Life Insurance, Motor Insurance, Home Insurance, Travel Insurance, Business Insurance)
- `assignedTo.name` (string)

#### Optional Fields

- `address` (string, max 500 chars)
- `status` (enum: New, In Progress, Qualified, Not Interested, Converted, Lost) - defaults to 'New'
- `budget` (number, 0-10,000,000)
- `assignedTo.agentId` (MongoDB ObjectId)
- `priority` (enum: High, Medium, Low) - defaults to 'Medium'
- `additionalInfo` (string, max 1000 chars)
- `nextFollowUp` (date)
- `tags` (array of strings, max 50 chars each)
- `customFields` (object with string values)

#### Example Response

```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f67890123456",
    "leadId": "LD000001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    // ... other fields
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 4. Update Lead

**PUT** `/api/leads/:id`

Update an existing lead with new information.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the lead |

#### Request Body

Any fields from the create lead schema can be updated. All fields are optional in updates.

```json
{
  "status": "In Progress",
  "priority": "High",
  "additionalInfo": "Updated information after call",
  "nextFollowUp": "2024-01-25T14:00:00.000Z"
}
```

#### Example Response

```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "_id": "64a1b2c3d4e5f67890123456",
    "leadId": "LD000001",
    // ... updated fields
    "lastInteraction": "2024-01-15T12:45:00.000Z",
    "updatedAt": "2024-01-15T12:45:00.000Z"
  }
}
```

---

### 5. Delete Lead

**DELETE** `/api/leads/:id`

Delete a lead. Only accessible by managers and super admins.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the lead |

#### Example Response

```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "data": null
}
```

---

### 6. Add Follow-up

**POST** `/api/leads/:id/followups`

Add a follow-up record to a lead.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the lead |

#### Request Body

```json
{
  "date": "2024-01-20T00:00:00.000Z",
  "time": "14:30",
  "type": "Call",
  "outcome": "Customer interested in premium plan. Discussed coverage options.",
  "nextAction": "Send detailed brochure and schedule meeting"
}
```

#### Required Fields

- `date` (date) - Follow-up date
- `time` (string) - Time in HH:MM format
- `type` (enum: Call, Email, Meeting, SMS, WhatsApp)
- `outcome` (string, max 1000 chars) - What happened during follow-up

#### Optional Fields

- `nextAction` (string, max 500 chars) - What to do next

#### Example Response

```json
{
  "success": true,
  "message": "Follow-up added successfully",
  "data": {
    // ... full lead object with new follow-up included
    "followUps": [
      {
        "_id": "64a1b2c3d4e5f67890123458",
        "date": "2024-01-20T00:00:00.000Z",
        "time": "14:30",
        "type": "Call",
        "outcome": "Customer interested in premium plan. Discussed coverage options.",
        "nextAction": "Send detailed brochure and schedule meeting",
        "createdBy": "Agent Smith",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 7. Add Note

**POST** `/api/leads/:id/notes`

Add a note to a lead.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the lead |

#### Request Body

```json
{
  "content": "Customer has specific requirements for maternity coverage. Spouse is pregnant and due in 6 months."
}
```

#### Required Fields

- `content` (string, max 2000 chars) - Note content

#### Example Response

```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    // ... full lead object with new note included
    "notes": [
      {
        "_id": "64a1b2c3d4e5f67890123459",
        "content": "Customer has specific requirements for maternity coverage. Spouse is pregnant and due in 6 months.",
        "createdBy": "Agent Smith",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 8. Assign Lead

**PUT** `/api/leads/:id/assign`

Assign a lead to an agent. Only accessible by managers and super admins.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the lead |

#### Request Body

```json
{
  "agentId": "64a1b2c3d4e5f67890123457",
  "agentName": "Agent Smith"
}
```

#### Required Fields

- `agentId` (string) - MongoDB ObjectId of the agent
- `agentName` (string) - Agent's name

#### Example Response

```json
{
  "success": true,
  "message": "Lead assigned successfully",
  "data": {
    // ... full lead object with updated assignment
    "assignedTo": {
      "agentId": "64a1b2c3d4e5f67890123457",
      "name": "Agent Smith"
    }
  }
}
```

---

### 9. Convert Lead to Client

**POST** `/api/leads/:id/convert`

Convert a qualified lead to a client.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the lead |

#### Example Response

```json
{
  "success": true,
  "message": "Lead converted successfully",
  "data": {
    "leadId": "64a1b2c3d4e5f67890123456",
    "clientId": "CL123456",
    "message": "Lead converted to client successfully"
  }
}
```

---

### 10. Get Lead Statistics

**GET** `/api/leads/stats`

Get comprehensive statistics about leads.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | 30d | Time period: '7d', '30d', '90d' |
| agentId | string | - | Filter stats for specific agent |

#### Example Request

```bash
GET /api/leads/stats?period=30d&agentId=64a1b2c3d4e5f67890123457
```

#### Example Response

```json
{
  "success": true,
  "message": "Lead statistics retrieved successfully",
  "data": {
    "totalLeads": 145,
    "newLeads": 45,
    "inProgress": 32,
    "qualified": 28,
    "converted": 25,
    "lost": 15,
    "conversionRate": "17.2",
    "topSources": [
      {
        "_id": "Website",
        "count": 65
      },
      {
        "_id": "Referral",
        "count": 35
      },
      {
        "_id": "Social Media",
        "count": 25
      }
    ],
    "priorityDistribution": [
      {
        "_id": "High",
        "count": 45
      },
      {
        "_id": "Medium",
        "count": 70
      },
      {
        "_id": "Low",
        "count": 30
      }
    ],
    "period": "30d"
  }
}
```

---

### 11. Search Leads

**GET** `/api/leads/search/:query`

Search leads using text search across multiple fields.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Search query (min 2 characters) |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 10 | Maximum number of results |

#### Example Request

```bash
GET /api/leads/search/john?limit=20
```

#### Example Response

```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": [
    {
      "_id": "64a1b2c3d4e5f67890123456",
      "leadId": "LD000001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      // ... other fields
      "score": 1.5  // Text search relevance score
    }
  ]
}
```

---

## Data Models

### Lead Schema

```javascript
{
  leadId: String,           // Auto-generated: LD000001
  name: String,             // Required, 2-100 chars
  phone: String,            // Required, valid phone format
  email: String,            // Required, valid email format
  address: String,          // Optional, max 500 chars
  source: String,           // Enum: Website, Referral, Cold Call, etc.
  product: String,          // Enum: Health Insurance, Life Insurance, etc.
  status: String,           // Enum: New, In Progress, Qualified, etc.
  budget: Number,           // Optional, 0-10,000,000
  assignedTo: {
    agentId: ObjectId,      // Reference to User
    name: String            // Agent name
  },
  priority: String,         // Enum: High, Medium, Low
  additionalInfo: String,   // Optional, max 1000 chars
  followUps: [FollowUpSchema],
  notes: [NoteSchema],
  nextFollowUp: Date,       // Optional
  lastInteraction: Date,    // Auto-updated
  convertedToClientId: ObjectId,  // Reference to Client
  tags: [String],           // Optional, max 50 chars each
  customFields: Map,        // Optional key-value pairs
  createdAt: Date,          // Auto-generated
  updatedAt: Date           // Auto-updated
}
```

### Follow-up Schema

```javascript
{
  date: Date,               // Required
  time: String,             // Required, HH:MM format
  type: String,             // Enum: Call, Email, Meeting, SMS, WhatsApp
  outcome: String,          // Required, max 1000 chars
  nextAction: String,       // Optional, max 500 chars
  createdBy: String,        // Auto-populated from user
  createdAt: Date           // Auto-generated
}
```

### Note Schema

```javascript
{
  content: String,          // Required, max 2000 chars
  createdBy: String,        // Auto-populated from user
  createdAt: Date           // Auto-generated
}
```

---

## HTTP Status Codes

- **200 OK**: Successful GET, PUT operations
- **201 Created**: Successful POST operations
- **400 Bad Request**: Validation errors, invalid data
- **401 Unauthorized**: Invalid or missing authentication token
- **403 Forbidden**: Insufficient permissions for the operation
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate email or phone number
- **500 Internal Server Error**: Server-side errors

---

## Rate Limiting

- **Rate Limit**: 100 requests per minute per IP
- **Burst Limit**: 10 requests per second per IP

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per minute
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the current window resets

---

## Pagination

All list endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Pagination info is included in the response:

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Security Features

### Authentication
- JWT-based authentication
- Token expiration and refresh mechanisms
- Secure password hashing with bcrypt

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions for agents
- API endpoint protection based on user roles

### Data Validation
- Comprehensive input validation using Joi
- SQL injection prevention
- XSS protection through input sanitization

### Data Protection
- Sensitive data encryption at rest
- HTTPS encryption in transit
- CORS configuration for cross-origin requests

---

## Examples

### Complete Lead Creation Workflow

```javascript
// 1. Create a new lead
const newLead = await fetch('/api/leads', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '9876543210',
    source: 'Website',
    product: 'Health Insurance',
    assignedTo: {
      agentId: '64a1b2c3d4e5f67890123457',
      name: 'Agent Smith'
    },
    priority: 'High'
  })
});

// 2. Add a follow-up
const followUp = await fetch(`/api/leads/${leadId}/followups`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    date: '2024-01-20',
    time: '14:30',
    type: 'Call',
    outcome: 'Customer interested in premium plan',
    nextAction: 'Send brochure'
  })
});

// 3. Update lead status
const updateLead = await fetch(`/api/leads/${leadId}`, {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'Qualified',
    nextFollowUp: '2024-01-25T10:00:00.000Z'
  })
});

// 4. Convert to client
const conversion = await fetch(`/api/leads/${leadId}/convert`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});
```

---

## Testing

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test leads.test.js
```

### Test Categories

1. **Unit Tests**: Individual function and method testing
2. **Integration Tests**: API endpoint testing with database
3. **Authentication Tests**: Token validation and role-based access
4. **Validation Tests**: Input validation and error handling
5. **Performance Tests**: Load testing and response time validation

### Test Data

Test environment uses a separate MongoDB database with seeded test data. All tests are isolated and clean up after execution.

---

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
- **Issue**: 401 Unauthorized
- **Solution**: Ensure valid JWT token in Authorization header
- **Check**: Token expiration, user status, token format

#### 2. Validation Errors
- **Issue**: 400 Bad Request with validation details
- **Solution**: Check request body against schema requirements
- **Check**: Required fields, data types, value constraints

#### 3. Permission Errors
- **Issue**: 403 Forbidden
- **Solution**: Verify user role and resource ownership
- **Check**: User role, lead assignment, operation permissions

#### 4. Database Connection Issues
- **Issue**: 500 Internal Server Error
- **Solution**: Check MongoDB connection and database status
- **Check**: Connection string, database availability, network connectivity

### Debugging

Enable debug logging by setting environment variable:
```bash
DEBUG=leads:* npm start
```

Check application logs for detailed error information and request/response data.

---

## Support

For technical support and questions:

- **Documentation**: [API Documentation Portal]
- **Support Email**: api-support@company.com
- **Developer Slack**: #api-support
- **Issue Tracker**: [GitHub Issues]

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial release of Leads API
- Complete CRUD operations
- Follow-up and note management
- Lead assignment and conversion
- Statistics and search functionality
- Comprehensive test suite
- Role-based access control
