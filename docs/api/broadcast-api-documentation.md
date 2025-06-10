
# Broadcast Management API Documentation

## Overview
Comprehensive API for managing broadcast communications including offers, festival greetings, announcements, and client opt-in/opt-out functionality.

## Base URL
```
http://localhost:5000/api/broadcast
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Get All Broadcasts
**GET** `/`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `type` (string, optional): Filter by type (offer, festival, announcement, promotion, newsletter, reminder)
- `status` (string, optional): Filter by status (draft, scheduled, sending, sent, failed)
- `sortField` (string, optional): Sort field (default: createdAt)
- `sortDirection` (string, optional): Sort direction (asc, desc) (default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Diwali Special Offer",
      "description": "Special insurance offers for Diwali season",
      "type": "festival",
      "channels": ["email", "whatsapp"],
      "subject": "🪔 Diwali Special Insurance Offers",
      "content": "Dear {{name}}, Wishing you a very Happy Diwali! Check out our special offers...",
      "status": "sent",
      "scheduledAt": "2024-01-15T10:30:00Z",
      "stats": {
        "totalRecipients": 500,
        "sentCount": 495,
        "deliveredCount": 480,
        "failedCount": 15,
        "optedOutCount": 5
      },
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "John Agent",
        "email": "john@agency.com"
      },
      "createdAt": "2024-01-15T10:00:00Z"
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

### 2. Create New Broadcast
**POST** `/`

**Request Body:**
```json
{
  "title": "Summer Health Checkup Offer",
  "description": "Annual health checkup promotion",
  "type": "offer",
  "channels": ["email", "whatsapp"],
  "subject": "Get Your Annual Health Checkup Done!",
  "content": "Dear {{name}}, It's time for your annual health checkup. Get 20% off on comprehensive health insurance plans.",
  "targetAudience": {
    "allClients": false,
    "clientTypes": ["individual"],
    "tierLevels": ["gold", "platinum"],
    "locations": [
      {
        "city": "Mumbai",
        "state": "Maharashtra"
      }
    ]
  },
  "scheduledAt": "2024-01-20T09:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Broadcast created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "title": "Summer Health Checkup Offer",
    "type": "offer",
    "status": "scheduled",
    "scheduledAt": "2024-01-20T09:00:00Z",
    "createdAt": "2024-01-15T11:00:00Z"
  }
}
```

### 3. Get Eligible Clients
**POST** `/eligible-clients`

**Request Body:**
```json
{
  "targetAudience": {
    "allClients": false,
    "clientTypes": ["individual"],
    "tierLevels": ["gold", "platinum"]
  },
  "channels": ["email", "whatsapp"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "displayName": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "clientType": "individual",
      "city": "Mumbai",
      "state": "Maharashtra",
      "tierLevel": "gold",
      "status": "Active",
      "communicationPreferences": {
        "email": {
          "offers": true,
          "newsletters": true,
          "reminders": true,
          "birthday": true,
          "anniversary": true
        },
        "whatsapp": {
          "offers": true,
          "newsletters": false,
          "reminders": true,
          "birthday": true,
          "anniversary": false
        }
      }
    }
  ],
  "total": 1
}
```

### 4. Update Client Communication Preferences
**PUT** `/clients/:clientId/preferences`

**Request Body:**
```json
{
  "channel": "email",
  "type": "offers",
  "optIn": true
}
```

**Alternative (bulk update):**
```json
{
  "channel": "email",
  "type": "all",
  "optIn": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Communication preferences updated successfully",
  "data": {
    "email": {
      "offers": true,
      "newsletters": true,
      "reminders": true,
      "birthday": true,
      "anniversary": true
    },
    "whatsapp": {
      "offers": true,
      "newsletters": false,
      "reminders": true,
      "birthday": true,
      "anniversary": false
    }
  }
}
```

### 5. Get Broadcast Statistics
**GET** `/:broadcastId/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "broadcast": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Diwali Special Offer",
      "type": "festival",
      "status": "sent",
      "stats": {
        "totalRecipients": 500,
        "sentCount": 495,
        "deliveredCount": 480,
        "failedCount": 15,
        "optedOutCount": 5
      }
    },
    "recipientStats": [
      { "_id": "sent", "count": 495 },
      { "_id": "delivered", "count": 480 },
      { "_id": "failed", "count": 15 },
      { "_id": "opted_out", "count": 5 }
    ],
    "channelStats": [
      {
        "_id": "email",
        "total": 250,
        "sent": 248,
        "delivered": 240,
        "failed": 8
      },
      {
        "_id": "whatsapp",
        "total": 250,
        "sent": 247,
        "delivered": 240,
        "failed": 7
      }
    ]
  }
}
```

## Broadcast Types

### Offer
- Special insurance product offers
- Discount promotions
- Limited-time deals

### Festival
- Festival greetings (Diwali, Christmas, Eid, etc.)
- Seasonal wishes
- Cultural celebrations

### Announcement
- Company news and updates
- Policy changes
- Important notices

### Promotion
- Product launches
- Feature updates
- Service enhancements

### Newsletter
- Regular updates
- Industry insights
- Company newsletters

### Reminder
- Premium payment reminders
- Policy renewal alerts
- Document submission reminders

## Target Audience Options

### All Clients
- Sends to all active clients
- Respects individual opt-out preferences

### Specific Clients
- Target specific client IDs
- Manual selection

### Client Types
- `individual`: Individual clients
- `corporate`: Corporate clients  
- `group`: Group clients

### Tier Levels
- `bronze`: Bronze tier clients
- `silver`: Silver tier clients
- `gold`: Gold tier clients
- `platinum`: Platinum tier clients

### Locations
- Filter by city and/or state
- Geographic targeting

## Communication Channels

### Email
- Rich HTML content support
- Subject line required
- Attachment support (future)
- Open/click tracking (future)

### WhatsApp
- Text and media messages
- Template message support
- Delivery status tracking
- Business API integration

### SMS (Future)
- Text-only messages
- Character limit enforcement
- Delivery tracking

## Personalization Variables

Use these placeholders in broadcast content:

- `{{name}}`: Client's display name
- `{{firstName}}`: Client's first name
- `{{email}}`: Client's email address
- `{{phone}}`: Client's phone number

## Communication Preferences

### Email Preferences
- `offers`: Marketing offers and promotions
- `newsletters`: Company newsletters and updates
- `reminders`: Payment and renewal reminders
- `birthday`: Birthday greetings
- `anniversary`: Anniversary greetings

### WhatsApp Preferences
- `offers`: Marketing offers and promotions
- `newsletters`: Company newsletters and updates
- `reminders`: Payment and renewal reminders
- `birthday`: Birthday greetings
- `anniversary`: Anniversary greetings

### Default Behavior
- New clients are opted-in for all communication types by default
- Clients can opt-out of specific types or channels
- Reminders are typically kept enabled for important notifications

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "channels",
      "message": "At least one channel must be selected"
    }
  ]
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions to create broadcasts"
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
- 50 requests per minute for broadcast creation
- 100 requests per minute for read operations
- 200 requests per minute for preference updates

## Best Practices

### Content Guidelines
1. Keep messages concise and relevant
2. Use personalization to increase engagement
3. Include clear call-to-action
4. Respect cultural sensitivities in festival messages
5. Provide opt-out instructions

### Targeting Best Practices
1. Segment audiences based on client behavior
2. Consider time zones for scheduling
3. Test with small groups before large campaigns
4. Monitor delivery rates and adjust strategies
5. Respect client preferences and opt-outs

### Scheduling Recommendations
1. Avoid sending during non-business hours
2. Consider cultural events and holidays
3. Space out communications to avoid spam
4. Use A/B testing for optimal timing
5. Monitor engagement patterns

## Integration with Other Modules

### Client Module
- Automatically includes new clients in broadcast audience
- Syncs communication preferences
- Updates client interaction history

### Communication Module
- Creates individual communication records for tracking
- Links to broader communication history
- Integrates with loyalty point system

### Analytics Module
- Provides detailed performance metrics
- Tracks engagement over time
- Supports campaign optimization

## Webhook Integration (Future)

### Delivery Status Updates
```json
{
  "event": "broadcast.message_delivered",
  "data": {
    "broadcastId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "clientId": "64f8a1b2c3d4e5f6a7b8c9d3",
    "channel": "whatsapp",
    "status": "delivered",
    "timestamp": "2024-01-15T10:35:00Z"
  }
}
```

### Opt-out Notifications
```json
{
  "event": "broadcast.client_opted_out",
  "data": {
    "clientId": "64f8a1b2c3d4e5f6a7b8c9d3",
    "channel": "email",
    "type": "offers",
    "timestamp": "2024-01-15T10:40:00Z"
  }
}
```
