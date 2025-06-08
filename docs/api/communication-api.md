
# Communication Management API Documentation

## Overview

The Communication Management API provides comprehensive functionality for automating client communications through WhatsApp, email, and SMS. This includes birthday/anniversary greetings, offer notifications, loyalty program management, and automated communication rules.

## Base URL

```
https://your-domain.com/api/communication
```

## Authentication

All endpoints require authentication via Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Communications

#### GET /
Get all communications with filtering and pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `type` (string, optional): Filter by communication type
- `status` (string, optional): Filter by status
- `channel` (string, optional): Filter by channel
- `clientId` (string, optional): Filter by client ID
- `sortField` (string, optional): Sort field (default: createdAt)
- `sortDirection` (string, optional): Sort direction (default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a7b2c8d9e1f2a3b4c5d6",
      "clientId": {
        "_id": "64f5a7b2c8d9e1f2a3b4c5d7",
        "displayName": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "type": "birthday",
      "channel": "email",
      "subject": "Happy Birthday!",
      "content": "Wishing you a wonderful birthday...",
      "status": "sent",
      "sentAt": "2024-06-08T10:00:00Z",
      "agentId": "64f5a7b2c8d9e1f2a3b4c5d8",
      "createdAt": "2024-06-08T10:00:00Z"
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

#### POST /
Send a manual communication.

**Request Body:**
```json
{
  "clientId": "64f5a7b2c8d9e1f2a3b4c5d7",
  "type": "custom",
  "channel": "email",
  "subject": "Important Update",
  "content": "We have an important update...",
  "scheduledFor": "2024-06-10T14:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Communication scheduled successfully",
  "data": {
    "_id": "64f5a7b2c8d9e1f2a3b4c5d9",
    "clientId": "64f5a7b2c8d9e1f2a3b4c5d7",
    "type": "custom",
    "channel": "email",
    "subject": "Important Update",
    "content": "We have an important update...",
    "status": "pending",
    "scheduledFor": "2024-06-10T14:00:00Z",
    "agentId": "64f5a7b2c8d9e1f2a3b4c5d8",
    "createdAt": "2024-06-08T10:00:00Z"
  }
}
```

### 2. Loyalty Points

#### GET /loyalty/:clientId
Get loyalty points for a specific client.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a7b2c8d9e1f2a3b4c5da",
    "clientId": "64f5a7b2c8d9e1f2a3b4c5d7",
    "totalPoints": 2500,
    "availablePoints": 1800,
    "tierLevel": "gold",
    "nextTierThreshold": 5000,
    "pointsHistory": [
      {
        "transactionType": "earned",
        "points": 500,
        "reason": "Policy renewal",
        "date": "2024-06-08T10:00:00Z",
        "agentId": "64f5a7b2c8d9e1f2a3b4c5d8"
      }
    ]
  }
}
```

#### POST /loyalty/:clientId
Update loyalty points for a client.

**Request Body:**
```json
{
  "points": 500,
  "reason": "Policy renewal bonus",
  "transactionType": "earned",
  "policyId": "64f5a7b2c8d9e1f2a3b4c5db"
}
```

### 3. Offers

#### GET /offers
Get all active offers.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `type` (string, optional): Offer type
- `applicableProduct` (string, optional): Product type
- `isActive` (boolean, optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a7b2c8d9e1f2a3b4c5dc",
      "title": "Summer Health Insurance Discount",
      "description": "Get 20% off on health insurance premiums",
      "type": "discount",
      "discountPercentage": 20,
      "applicableProducts": ["health"],
      "validFrom": "2024-06-01T00:00:00Z",
      "validUntil": "2024-08-31T23:59:59Z",
      "isActive": true,
      "targetAudience": {
        "allClients": true
      },
      "createdBy": "64f5a7b2c8d9e1f2a3b4c5d8"
    }
  ]
}
```

#### POST /offers
Create a new offer (Admin/Manager only).

**Request Body:**
```json
{
  "title": "Birthday Special Discount",
  "description": "Special 15% discount for birthday month",
  "type": "discount",
  "discountPercentage": 15,
  "applicableProducts": ["health", "life"],
  "validFrom": "2024-06-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "targetAudience": {
    "birthdayClients": true
  }
}
```

### 4. Automation Rules

#### GET /automation
Get automation rules.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `type` (string, optional): Rule type
- `isActive` (boolean, optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a7b2c8d9e1f2a3b4c5dd",
      "name": "Birthday Greetings",
      "type": "birthday",
      "trigger": {
        "event": "date_based",
        "daysOffset": 0,
        "timeOfDay": "09:00"
      },
      "action": {
        "channel": "email",
        "templateId": "64f5a7b2c8d9e1f2a3b4c5de"
      },
      "isActive": true,
      "stats": {
        "totalRuns": 45,
        "successfulSends": 43,
        "failedSends": 2
      }
    }
  ]
}
```

#### POST /automation
Create automation rule (Admin/Manager only).

**Request Body:**
```json
{
  "name": "Policy Renewal Reminder",
  "type": "renewal_reminder",
  "trigger": {
    "event": "date_based",
    "daysOffset": -30,
    "timeOfDay": "14:00"
  },
  "conditions": {
    "policyTypes": ["health", "life"]
  },
  "action": {
    "channel": "email",
    "templateId": "64f5a7b2c8d9e1f2a3b4c5df"
  }
}
```

### 5. Statistics

#### GET /stats
Get communication statistics.

**Query Parameters:**
- `startDate` (string, optional): Start date for filtering
- `endDate` (string, optional): End date for filtering

**Response:**
```json
{
  "success": true,
  "data": {
    "communications": {
      "totalCommunications": 1250,
      "byStatus": [
        { "status": "sent", "count": 1100 },
        { "status": "pending", "count": 100 },
        { "status": "failed", "count": 50 }
      ],
      "byType": [
        { "type": "birthday", "count": 400 },
        { "type": "offer", "count": 350 },
        { "type": "custom", "count": 300 }
      ],
      "byChannel": [
        { "channel": "email", "count": 800 },
        { "channel": "whatsapp", "count": 300 },
        { "channel": "sms", "count": 150 }
      ]
    },
    "loyalty": [
      { "tierLevel": "bronze", "count": 245, "totalPoints": 125000 },
      { "tierLevel": "silver", "count": 89, "totalPoints": 180000 },
      { "tierLevel": "gold", "count": 34, "totalPoints": 240000 },
      { "tierLevel": "platinum", "count": 12, "totalPoints": 360000 }
    ]
  }
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "clientId",
      "message": "Client ID is required"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- 100 requests per minute for standard endpoints
- 10 requests per minute for bulk operations
- 5 requests per minute for automation triggers

## Webhooks

Configure webhooks to receive real-time updates:

### Communication Status Updates
```json
{
  "event": "communication.status_changed",
  "data": {
    "communicationId": "64f5a7b2c8d9e1f2a3b4c5d6",
    "status": "delivered",
    "timestamp": "2024-06-08T10:05:00Z"
  }
}
```

### Loyalty Tier Upgrades
```json
{
  "event": "loyalty.tier_upgraded",
  "data": {
    "clientId": "64f5a7b2c8d9e1f2a3b4c5d7",
    "oldTier": "silver",
    "newTier": "gold",
    "timestamp": "2024-06-08T10:00:00Z"
  }
}
```

## Best Practices

1. **Rate Limiting**: Implement proper rate limiting to avoid overwhelming recipients
2. **Personalization**: Use client data to personalize messages
3. **Opt-out Management**: Always respect client communication preferences
4. **Testing**: Test automation rules thoroughly before activation
5. **Analytics**: Monitor delivery rates and engagement metrics
6. **Compliance**: Ensure compliance with data protection regulations

## SDK Examples

### JavaScript/Node.js
```javascript
const communicationApi = new CommunicationAPI('your-api-key');

// Send birthday greeting
await communicationApi.sendCommunication({
  clientId: 'client-id',
  type: 'birthday',
  channel: 'email',
  subject: 'Happy Birthday!',
  content: 'Wishing you a wonderful birthday...'
});

// Update loyalty points
await communicationApi.updateLoyaltyPoints('client-id', {
  points: 500,
  reason: 'Policy renewal',
  transactionType: 'earned'
});
```

### Python
```python
from communication_api import CommunicationAPI

api = CommunicationAPI('your-api-key')

# Get client loyalty points
loyalty_data = api.get_loyalty_points('client-id')
print(f"Client has {loyalty_data['availablePoints']} points")

# Create automation rule
rule = api.create_automation_rule({
    'name': 'Birthday Greetings',
    'type': 'birthday',
    'trigger': {
        'event': 'date_based',
        'daysOffset': 0,
        'timeOfDay': '09:00'
    },
    'action': {
        'channel': 'email'
    }
})
```

## Testing

Use the following test endpoints for development:

- **Sandbox Base URL**: `https://sandbox.your-domain.com/api/communication`
- **Test Client ID**: `test_client_64f5a7b2c8d9e1f2a3b4c5d7`
- **Test API Key**: Contact support for test credentials

## Support

For API support and questions:
- Email: api-support@your-domain.com
- Documentation: https://docs.your-domain.com/api
- Status Page: https://status.your-domain.com
