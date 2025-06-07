
# Quotations API Documentation

## Overview

The Quotations API provides comprehensive functionality for managing insurance quotations in the system. It supports CRUD operations, status management, email sending, search capabilities, and statistical reporting with role-based access control.

## Base URL

```
/api/quotations
```

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Data Models

### Quotation Object

```json
{
  "_id": "ObjectId",
  "quoteId": "QT-2025-0001",
  "clientId": "ObjectId",
  "clientName": "John Doe",
  "insuranceType": "Health Insurance",
  "insuranceCompany": "Star Health",
  "products": ["Family Floater Plan", "Critical Illness Add-on"],
  "sumInsured": 500000,
  "premium": 25000,
  "agentId": "ObjectId",
  "agentName": "Agent Name",
  "status": "draft",
  "emailSent": false,
  "sentDate": null,
  "viewedAt": null,
  "acceptedAt": null,
  "rejectedAt": null,
  "rejectionReason": null,
  "convertedToPolicy": null,
  "validUntil": "2025-07-01T00:00:00.000Z",
  "notes": "Client specific notes",
  "attachments": [],
  "customFields": {},
  "createdBy": "ObjectId",
  "updatedBy": "ObjectId",
  "createdAt": "2025-06-01T00:00:00.000Z",
  "updatedAt": "2025-06-01T00:00:00.000Z"
}
```

### Status Values

- `draft` - Initial state, quotation being prepared
- `sent` - Quotation sent to client via email
- `viewed` - Client has viewed the quotation
- `accepted` - Client accepted the quotation
- `rejected` - Client rejected the quotation
- `expired` - Quotation validity period has passed

### Insurance Types

- Health Insurance
- Life Insurance
- Motor Insurance
- Home Insurance
- Travel Insurance
- Business Insurance
- Group Health Insurance

## API Endpoints

### 1. Get All Quotations

**GET** `/api/quotations`

Retrieve all quotations with filtering, searching, and pagination.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number for pagination |
| limit | number | 10 | Number of items per page (max 100) |
| status | string | all | Filter by status |
| insuranceType | string | all | Filter by insurance type |
| agentId | string | all | Filter by agent ID |
| clientId | string | - | Filter by client ID |
| search | string | - | Search in quote ID, client name, company |
| sortBy | string | createdAt | Sort field |
| sortOrder | string | desc | Sort direction (asc/desc) |
| dateFrom | date | - | Filter by creation date from |
| dateTo | date | - | Filter by creation date to |
| validFrom | date | - | Filter by validity date from |
| validTo | date | - | Filter by validity date to |

#### Response

```json
{
  "success": true,
  "message": "Quotations retrieved successfully",
  "data": {
    "quotations": [/* array of quotation objects */],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "limit": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Role-based Access

- **Agent**: Can only view their own quotations
- **Manager/Super Admin**: Can view all quotations

### 2. Get Quotation by ID

**GET** `/api/quotations/:id`

Retrieve a specific quotation by its ID.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Quotation ObjectId |

#### Response

```json
{
  "success": true,
  "message": "Quotation retrieved successfully",
  "data": {
    /* quotation object with populated references */
  }
}
```

### 3. Create Quotation

**POST** `/api/quotations`

Create a new quotation.

#### Required Permissions

- Agent, Manager, Super Admin

#### Request Body

```json
{
  "clientId": "ObjectId",
  "clientName": "John Doe",
  "insuranceType": "Health Insurance",
  "insuranceCompany": "Star Health",
  "products": ["Family Floater Plan"],
  "sumInsured": 500000,
  "premium": 25000,
  "agentId": "ObjectId",
  "agentName": "Agent Name",
  "validUntil": "2025-07-01T00:00:00.000Z",
  "notes": "Optional notes"
}
```

#### Validation Rules

- `clientId`: Required, valid ObjectId
- `clientName`: Required, 2-100 characters
- `insuranceType`: Required, must be from allowed enum
- `insuranceCompany`: Required, max 100 characters
- `products`: Required array, at least one item
- `sumInsured`: Required, 0-100,000,000
- `premium`: Required, 0-10,000,000
- `validUntil`: Required, must be future date

#### Response

```json
{
  "success": true,
  "message": "Quotation created successfully",
  "data": {
    /* created quotation object */
  }
}
```

### 4. Update Quotation

**PUT** `/api/quotations/:id`

Update an existing quotation.

#### Required Permissions

- Agent (own quotations only), Manager, Super Admin

#### Request Body

All fields are optional for updates:

```json
{
  "clientName": "Updated Name",
  "premium": 30000,
  "notes": "Updated notes",
  "validUntil": "2025-08-01T00:00:00.000Z"
}
```

#### Business Rules

- Cannot update quotations with status `accepted`
- Agents can only update their own quotations

### 5. Delete Quotation

**DELETE** `/api/quotations/:id`

Delete a quotation.

#### Required Permissions

- Manager, Super Admin only

#### Business Rules

- Cannot delete quotations with status `accepted`

### 6. Send Quotation

**POST** `/api/quotations/:id/send`

Send quotation to client via email and update status to 'sent'.

#### Required Permissions

- Agent (own quotations only), Manager, Super Admin

#### Request Body

```json
{
  "emailTo": "client@example.com",
  "emailSubject": "Your Insurance Quotation",
  "emailMessage": "Please find your quotation attached."
}
```

#### Response

Updates quotation with:
- `status`: "sent"
- `emailSent`: true
- `sentDate`: current timestamp

### 7. Update Quotation Status

**PUT** `/api/quotations/:id/status`

Update the status of a quotation with status-specific logic.

#### Required Permissions

- Agent (own quotations only), Manager, Super Admin

#### Request Body

```json
{
  "status": "accepted",
  "rejectionReason": "Only required for rejected status",
  "convertedToPolicy": "Policy ID for accepted quotations"
}
```

#### Status-specific Behavior

- **viewed**: Sets `viewedAt` timestamp
- **accepted**: Sets `acceptedAt` timestamp
- **rejected**: Sets `rejectedAt` timestamp and requires `rejectionReason`

### 8. Get Quotations Statistics

**GET** `/api/quotations/stats`

Retrieve quotation statistics and analytics.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | number | 30 | Days to look back for statistics |
| agentId | string | all | Filter statistics by agent |

#### Response

```json
{
  "success": true,
  "message": "Quotation statistics retrieved successfully",
  "data": {
    "totalQuotations": 100,
    "statusBreakdown": {
      "draft": 10,
      "sent": 25,
      "viewed": 20,
      "accepted": 15,
      "rejected": 20,
      "expired": 10
    },
    "premiumStats": {
      "totalPremium": 5000000,
      "averagePremium": 50000,
      "minPremium": 5000,
      "maxPremium": 200000
    },
    "conversionRate": 37.5,
    "period": 30
  }
}
```

### 9. Search Quotations

**GET** `/api/quotations/search/:query`

Search quotations by text query.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Search query string |
| limit | number | No | Max results (default: 10) |

#### Search Fields

- Quote ID
- Client name
- Insurance company
- Notes

#### Response

```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": [
    /* array of matching quotation objects */
  ]
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "statusCode": 400
}
```

### Common Error Codes

- **400 Bad Request**: Validation errors, business rule violations
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions for the operation
- **404 Not Found**: Quotation not found
- **409 Conflict**: Duplicate quotation ID or constraint violations
- **500 Internal Server Error**: Server-side errors

### Validation Error Example

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "details": [
      {
        "message": "Premium is required",
        "path": ["premium"],
        "type": "any.required"
      }
    ]
  },
  "statusCode": 400
}
```

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per user
- **Search endpoints**: 30 requests per minute per user
- **Statistics endpoints**: 20 requests per minute per user

## Pagination

All list endpoints support pagination:

- Default page size: 10 items
- Maximum page size: 100 items
- Page numbers start from 1

## Sorting

Supported sort fields:
- `createdAt` (default)
- `updatedAt`
- `premium`
- `validUntil`
- `clientName`
- `sentDate`

Sort orders: `asc`, `desc` (default)

## Role-Based Access Control

### Agent Role
- Can create quotations
- Can view/update/send own quotations only
- Can view own statistics

### Manager Role
- Can perform all operations on quotations
- Can view statistics for all agents
- Cannot delete quotations (business rule)

### Super Admin Role
- Full access to all operations
- Can delete quotations
- Can view system-wide statistics

## Data Relationships

### Populated Fields

When retrieving quotations, the following references are populated:

- `clientId`: Client name, email, phone, address
- `agentId`: Agent name, email
- `createdBy`: Creator name, email
- `updatedBy`: Last updater name, email

## Business Rules

1. **Quote ID Generation**: Automatically generated as `QT-YYYY-NNNN`
2. **Status Progression**: draft → sent → viewed → accepted/rejected
3. **Expiry Logic**: Quotations automatically expire after `validUntil` date
4. **Edit Restrictions**: Cannot edit accepted quotations
5. **Delete Restrictions**: Cannot delete accepted quotations
6. **Agent Isolation**: Agents can only access their own quotations

## Integration Examples

### Create and Send Quotation Flow

```javascript
// 1. Create quotation
const quotation = await fetch('/api/quotations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(quotationData)
});

// 2. Send to client
const sentQuotation = await fetch(`/api/quotations/${quotation.id}/send`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    emailTo: 'client@example.com',
    emailSubject: 'Your Insurance Quotation'
  })
});
```

### Search and Filter

```javascript
const searchResults = await fetch('/api/quotations?search=health&status=sent&page=1&limit=20', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

This API provides comprehensive quotation management functionality with proper security, validation, and business logic enforcement.
