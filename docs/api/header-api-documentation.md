
# Header API Documentation

## Overview
The Header API provides endpoints for retrieving data needed by the application header, including profile information, notifications, and messages.

## Base URL
```
/api/header
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get Profile Data
**GET** `/profile`

Retrieves profile data for the header dropdown.

#### Response
```json
{
  "success": true,
  "message": "Profile data retrieved successfully",
  "data": {
    "id": "60f7b3b3b3f3b3b3b3f3b3b3",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "agent",
    "avatar": "https://example.com/avatar.jpg",
    "lastActivity": "2024-01-15T10:30:00Z",
    "isOnline": true,
    "jobTitle": "Senior Insurance Agent",
    "bio": "Experienced insurance professional"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Get Notifications
**GET** `/notifications`

Retrieves notifications for the header dropdown.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 5 | Maximum number of notifications to return (1-50) |

#### Response
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "id": "1",
        "title": "Policy Renewal Reminder",
        "message": "Policy #POL-2024-001234 expires in 3 days",
        "type": "warning",
        "isRead": false,
        "createdAt": "2024-01-15T08:30:00Z",
        "relatedEntity": {
          "type": "policy",
          "id": "POL-2024-001234"
        }
      }
    ],
    "unreadCount": 2,
    "totalCount": 15
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 3. Get Messages
**GET** `/messages`

Retrieves messages for the header dropdown.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 5 | Maximum number of messages to return (1-50) |

#### Response
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "id": "1",
        "sender": {
          "id": "user123",
          "name": "John Client",
          "avatar": null
        },
        "subject": "Policy Renewal Query",
        "preview": "Hi, I wanted to ask about my policy renewal process...",
        "isRead": false,
        "createdAt": "2024-01-15T09:20:00Z",
        "type": "client_inquiry"
      }
    ],
    "unreadCount": 3,
    "totalCount": 25
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4. Mark Notification as Read
**PUT** `/notifications/:id/read`

Marks a specific notification as read.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Notification ID |

#### Response
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 5. Mark Message as Read
**PUT** `/messages/:id/read`

Marks a specific message as read.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Message ID |

#### Response
```json
{
  "success": true,
  "message": "Message marked as read",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Notification Types
- `info`: Informational messages
- `warning`: Warning notifications
- `success`: Success notifications
- `error`: Error notifications

## Message Types
- `client_inquiry`: Messages from clients
- `internal`: Internal team messages
- `management`: Management communications
- `system`: System-generated messages

## Error Codes
| Code | Message | Description |
|------|---------|-------------|
| 400 | Validation error | Invalid query parameters |
| 401 | Access denied | Missing or invalid authorization token |
| 404 | Not found | Notification or message not found |
| 500 | Internal Server Error | Server-side error occurred |
