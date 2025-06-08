
# Communication Module API Documentation

## Overview
Comprehensive API for automated client communication system including WhatsApp, email, loyalty points, offers, and automation rules.

## Base URL
```
http://localhost:5000/api/communication
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Role-Based Access Control
- **Agent**: Access to communications for assigned clients only
- **Manager**: Access to all communications in their region/team
- **Admin**: Full access to all communications and system configuration

## API Endpoints

### 1. Communications

#### Get All Communications
**GET** `/`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `type` (string, optional): Filter by type (birthday, anniversary, offer, points, eligibility, renewal_reminder, custom)
- `status` (string, optional): Filter by status (pending, sent, delivered, failed, bounced)
- `channel` (string, optional): Filter by channel (email, whatsapp, sms)
- `clientId` (ObjectId, optional): Filter by client
- `sortField` (string, optional): Sort field (default: createdAt)
- `sortDirection` (string, optional): Sort direction (asc, desc) (default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "clientId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "displayName": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210"
      },
      "type": "birthday",
      "channel": "email",
      "status": "sent",
      "subject": "Happy Birthday!",
      "content": "Wishing you a very happy birthday!",
      "sentAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
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

#### Send Communication
**POST** `/`

**Request Body:**
```json
{
  "clientId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "policyId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "type": "custom",
  "channel": "email",
  "subject": "Policy Update",
  "content": "Your policy has been updated successfully.",
  "scheduledFor": "2024-01-16T09:00:00Z",
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Communication scheduled successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "clientId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "type": "custom",
    "channel": "email",
    "status": "pending",
    "scheduledFor": "2024-01-16T09:00:00Z"
  }
}
```

### 2. Loyalty Points

#### Get Client Loyalty Points
**GET** `/loyalty/:clientId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "clientId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "totalPoints": 1250,
    "availablePoints": 950,
    "tierLevel": "silver",
    "nextTierThreshold": 5000,
    "pointsToNextTier": 3750,
    "pointsHistory": [
      {
        "transactionType": "earned",
        "points": 100,
        "reason": "Policy renewal",
        "date": "2024-01-15T10:30:00Z",
        "expiryDate": "2025-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### Update Loyalty Points
**POST** `/loyalty/:clientId`

**Request Body:**
```json
{
  "points": 100,
  "reason": "Policy renewal",
  "transactionType": "earned",
  "policyId": "64f8a1b2c3d4e5f6a7b8c9d2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Loyalty points updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "totalPoints": 1350,
    "availablePoints": 1050,
    "tierLevel": "silver"
  }
}
```

### 3. Offers

#### Get Active Offers
**GET** `/offers`

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `type` (string, optional): Filter by offer type
- `applicableProduct` (string, optional): Filter by product
- `isActive` (boolean, optional): Filter by active status (default: true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "title": "Summer Health Special",
      "description": "Get 15% discount on health insurance",
      "type": "discount",
      "applicableProducts": ["health"],
      "discountPercentage": 15,
      "validFrom": "2024-06-01T00:00:00Z",
      "validUntil": "2024-08-31T23:59:59Z",
      "isValid": true,
      "remainingUsage": -1,
      "targetAudience": {
        "allClients": false,
        "birthdayClients": true
      }
    }
  ]
}
```

#### Create Offer
**POST** `/offers` (Admin/Manager only)

**Request Body:**
```json
{
  "title": "New Year Special",
  "description": "Special discount for new year",
  "type": "discount",
  "applicableProducts": ["life", "health"],
  "discountPercentage": 20,
  "eligibilityCriteria": {
    "minAge": 25,
    "maxAge": 60,
    "clientTypes": ["individual"],
    "minPremium": 10000
  },
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-01-31T23:59:59Z",
  "maxUsageCount": 100,
  "targetAudience": {
    "allClients": false,
    "tierBasedClients": ["gold", "platinum"]
  }
}
```

### 4. Automation Rules

#### Get Automation Rules
**GET** `/automation` (Admin/Manager only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "name": "Birthday Greetings",
      "type": "birthday",
      "trigger": {
        "event": "date_based",
        "daysOffset": 0,
        "timeOfDay": "09:00"
      },
      "conditions": {
        "clientTypes": ["individual"]
      },
      "action": {
        "channel": "email",
        "templateId": "64f8a1b2c3d4e5f6a7b8c9d7"
      },
      "isActive": true,
      "stats": {
        "totalRuns": 50,
        "successfulSends": 45,
        "failedSends": 5
      }
    }
  ]
}
```

#### Create Automation Rule
**POST** `/automation` (Admin/Manager only)

**Request Body:**
```json
{
  "name": "Policy Expiry Reminder",
  "type": "renewal_reminder",
  "trigger": {
    "event": "date_based",
    "daysOffset": -30,
    "timeOfDay": "10:00"
  },
  "conditions": {
    "policyTypes": ["life", "health"],
    "minPremium": 5000
  },
  "action": {
    "channel": "both",
    "delayMinutes": 0
  }
}
```

### 5. Statistics

#### Get Communication Statistics
**GET** `/stats`

**Query Parameters:**
- `startDate` (date, optional): Filter from date
- `endDate` (date, optional): Filter to date

**Response:**
```json
{
  "success": true,
  "data": {
    "communications": {
      "totalCommunications": 150,
      "byStatus": [
        { "_id": "sent", "count": 120 },
        { "_id": "pending", "count": 20 },
        { "_id": "failed", "count": 10 }
      ],
      "byType": [
        { "_id": "birthday", "count": 50 },
        { "_id": "offer", "count": 40 },
        { "_id": "reminder", "count": 30 }
      ],
      "byChannel": [
        { "_id": "email", "count": 100 },
        { "_id": "whatsapp", "count": 50 }
      ]
    },
    "loyalty": [
      { "_id": "bronze", "count": 1000, "totalPoints": 500000 },
      { "_id": "silver", "count": 300, "totalPoints": 750000 },
      { "_id": "gold", "count": 80, "totalPoints": 600000 },
      { "_id": "platinum", "count": 20, "totalPoints": 500000 }
    ]
  }
}
```

### 6. Special Endpoints

#### Get Upcoming Birthdays
**GET** `/upcoming-birthdays`

**Query Parameters:**
- `days` (number, optional): Days ahead to look (default: 7)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "clientId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john@example.com",
      "birthday": "1990-01-20",
      "daysUntil": 3,
      "communicationPreferences": {
        "email": { "birthday": true },
        "whatsapp": { "birthday": false }
      }
    }
  ]
}
```

#### Trigger Birthday Greetings
**POST** `/trigger-birthdays`

**Response:**
```json
{
  "success": true,
  "message": "Birthday greetings triggered successfully",
  "data": {
    "processed": 5,
    "scheduled": 5,
    "failed": 0
  }
}
```

#### Send Bulk Communication
**POST** `/bulk`

**Request Body:**
```json
{
  "clientIds": ["64f8a1b2c3d4e5f6a7b8c9d1", "64f8a1b2c3d4e5f6a7b8c9d2"],
  "type": "offer",
  "channel": "email",
  "subject": "Special Offer for You",
  "content": "Check out our latest insurance offers",
  "scheduledFor": "2024-01-16T09:00:00Z"
}
```

#### Preview Communication
**POST** `/preview`

**Request Body:**
```json
{
  "clientId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "templateId": "64f8a1b2c3d4e5f6a7b8c9d7",
  "variables": {
    "firstName": "John",
    "offerTitle": "Summer Special"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": "Happy Birthday, John!",
    "content": "Dear John, Wishing you a very happy birthday! Check out our Summer Special offer.",
    "estimatedLength": 85,
    "variables": ["firstName", "offerTitle"]
  }
}
```

## Communication Types

### Birthday Communications
- Automatically triggered on client birthdays
- Supports email, WhatsApp, and SMS channels
- Customizable templates with client information
- Respect client communication preferences

### Anniversary Communications
- Marriage anniversary for individual clients
- Incorporation date for corporate clients
- Group formation date for group clients
- Automated scheduling and delivery

### Offer Notifications
- Targeted based on client eligibility
- Support for various offer types (discount, cashback, bonus points)
- Audience segmentation (all clients, specific tiers, birthday clients)
- Usage tracking and limits

### Points/Eligibility Updates
- Automatic notifications when points are earned/redeemed
- Tier upgrade notifications
- Eligibility status changes
- Referral program updates

## Loyalty Program Tiers

### Bronze (0-999 points)
- Basic benefits
- Standard communication frequency

### Silver (1000-4999 points)
- Enhanced benefits
- Priority communication
- Exclusive offers

### Gold (5000-14999 points)
- Premium benefits
- Dedicated support
- Early access to offers

### Platinum (15000+ points)
- VIP benefits
- Personal account manager
- Custom offers

## Error Handling

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "clientId",
      "message": "Client ID must be a valid ObjectId"
    }
  ]
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Client not found or access denied"
}
```

## Rate Limiting
- 100 requests per minute for communication endpoints
- 500 requests per minute for read-only operations
- 1000 requests per minute for admin users

## Webhook Integration
The system supports webhooks for:
- WhatsApp delivery status
- Email open/click tracking
- SMS delivery confirmations
- Integration with external communication providers

## Best Practices
1. Always check client communication preferences before sending
2. Use templates for consistent messaging
3. Monitor delivery rates and adjust strategies
4. Respect opt-out requests immediately
5. Maintain communication frequency limits
6. Use A/B testing for offer communications
