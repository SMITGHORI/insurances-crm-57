
# Authentication API Documentation

## Overview
The Authentication API provides endpoints for user authentication, session management, and logout functionality.

## Base URL
```
/api/auth
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Logout User
**POST** `/logout`

Logs out the current user and updates their activity status.

#### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Response
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Access denied. No valid token provided.",
  "error": "UNAUTHORIZED",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Get Current User
**GET** `/me`

Retrieves the current authenticated user's information.

#### Request Headers
```
Authorization: Bearer <token>
```

#### Response
```json
{
  "success": true,
  "message": "User authenticated",
  "data": {
    "_id": "60f7b3b3b3f3b3b3b3f3b3b3",
    "userId": "USR-2024-001234",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "agent",
    "status": "active",
    "lastActivity": "2024-01-15T10:30:00Z",
    "isOnline": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 3. Refresh Session
**POST** `/refresh`

Refreshes the user's session and updates their activity status.

#### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Response
```json
{
  "success": true,
  "message": "Session refreshed",
  "data": {
    "_id": "60f7b3b3b3f3b3b3b3f3b3b3",
    "userId": "USR-2024-001234",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "agent",
    "lastActivity": "2024-01-15T10:30:00Z",
    "isOnline": true
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 401 | Access denied. No valid token provided. | Missing or invalid authorization token |
| 401 | Invalid token. | Token is malformed or expired |
| 404 | User not found | User associated with token doesn't exist |
| 500 | Internal Server Error | Server-side error occurred |

## Rate Limiting
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Security Considerations
- All endpoints require HTTPS in production
- JWT tokens should be stored securely on the client side
- Implement proper token refresh mechanisms
- Log all authentication events for audit purposes
