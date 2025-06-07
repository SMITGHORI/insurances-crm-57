
# Settings API Documentation

## Overview

The Settings API provides comprehensive endpoints for managing user settings including profile information, notifications, security preferences, user preferences, and privacy settings. The API supports role-based access control and includes features for password management, settings import/export, and administrative statistics.

## Base URL

```
/api/settings
```

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Common Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Endpoints

### 1. Get User Settings

**GET** `/api/settings`

Retrieves the current user's settings. Creates default settings if none exist.

#### Headers
- `Authorization: Bearer <token>` (required)

#### Response
```json
{
  "success": true,
  "message": "Settings retrieved successfully",
  "data": {
    "settingsId": "SET-202401-000001",
    "userId": "60d5ecb74b24a1001f5e4321",
    "userName": "John Doe",
    "profile": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "jobTitle": "Insurance Agent",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Experienced insurance professional"
    },
    "notifications": {
      "emailNotifications": true,
      "smsNotifications": false,
      "pushNotifications": true,
      "marketingEmails": false,
      "activityNotifications": true,
      "systemAlerts": true,
      "weeklyReports": true,
      "monthlyReports": false
    },
    "security": {
      "twoFactorAuth": false,
      "sessionTimeout": 30,
      "loginAlerts": true,
      "passwordLastChanged": "2024-01-10T10:30:00.000Z"
    },
    "preferences": {
      "theme": "light",
      "language": "en",
      "timezone": "UTC",
      "dateFormat": "MM/DD/YYYY",
      "timeFormat": "12h",
      "currency": "USD",
      "dashboardLayout": "comfortable",
      "itemsPerPage": 20
    },
    "privacy": {
      "profileVisibility": "team",
      "activityVisibility": "team",
      "dataSharing": false,
      "analytics": true
    },
    "version": 1,
    "lastSyncedAt": "2024-01-15T10:30:00.000Z",
    "isActive": true,
    "createdAt": "2024-01-01T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Create Settings

**POST** `/api/settings`

Creates initial settings for a user. Only works if no settings exist.

#### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

#### Request Body
```json
{
  "profile": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "jobTitle": "Insurance Agent",
    "bio": "Experienced professional"
  },
  "notifications": {
    "emailNotifications": true,
    "pushNotifications": true
  },
  "preferences": {
    "theme": "light",
    "language": "en"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Settings created successfully",
  "data": {
    "settingsId": "SET-202401-000001",
    // ... full settings object
  }
}
```

### 3. Update Settings

**PUT** `/api/settings`

Updates user settings. Supports partial updates.

#### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

#### Request Body
```json
{
  "notifications": {
    "emailNotifications": false,
    "smsNotifications": true
  },
  "preferences": {
    "theme": "dark",
    "itemsPerPage": 50
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    // ... updated settings object
  }
}
```

### 4. Update Profile

**PUT** `/api/settings/profile`

Updates only profile information.

#### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

#### Request Body
```json
{
  "name": "John Updated",
  "jobTitle": "Senior Agent",
  "bio": "Updated biography"
}
```

#### Validation Rules
- `name`: 2-100 characters
- `email`: Valid email format, max 255 characters
- `phone`: Valid phone format (optional)
- `jobTitle`: Max 100 characters (optional)
- `bio`: Max 500 characters (optional)

### 5. Update Notifications

**PUT** `/api/settings/notifications`

Updates notification preferences.

#### Request Body
```json
{
  "emailNotifications": false,
  "pushNotifications": true,
  "marketingEmails": true,
  "weeklyReports": false
}
```

#### Available Options
- `emailNotifications`: Boolean
- `smsNotifications`: Boolean
- `pushNotifications`: Boolean
- `marketingEmails`: Boolean
- `activityNotifications`: Boolean
- `systemAlerts`: Boolean
- `weeklyReports`: Boolean
- `monthlyReports`: Boolean

### 6. Update Security

**PUT** `/api/settings/security`

Updates security preferences.

#### Request Body
```json
{
  "twoFactorAuth": true,
  "sessionTimeout": 60,
  "loginAlerts": false
}
```

#### Validation Rules
- `sessionTimeout`: Integer between 5-120 minutes

### 7. Update Preferences

**PUT** `/api/settings/preferences`

Updates user interface preferences.

#### Request Body
```json
{
  "theme": "dark",
  "language": "es",
  "currency": "EUR",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h",
  "dashboardLayout": "compact",
  "itemsPerPage": 50
}
```

#### Valid Values
- `theme`: "light", "dark", "system"
- `language`: "en", "es", "fr", "de", "it", "pt", "hi"
- `currency`: "USD", "EUR", "GBP", "INR", "CAD", "AUD"
- `dateFormat`: "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"
- `timeFormat`: "12h", "24h"
- `dashboardLayout`: "compact", "comfortable", "spacious"
- `itemsPerPage`: Integer between 10-100

### 8. Update Privacy

**PUT** `/api/settings/privacy`

Updates privacy settings.

#### Request Body
```json
{
  "profileVisibility": "private",
  "activityVisibility": "team",
  "dataSharing": false,
  "analytics": true
}
```

#### Valid Values
- `profileVisibility`: "public", "team", "private"
- `activityVisibility`: "public", "team", "private"
- `dataSharing`: Boolean
- `analytics`: Boolean

### 9. Change Password

**PUT** `/api/settings/change-password`

Changes user password with validation.

#### Request Body
```json
{
  "currentPassword": "oldPassword123!",
  "newPassword": "newPassword123!",
  "confirmPassword": "newPassword123!"
}
```

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

#### Response
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 10. Reset Settings

**POST** `/api/settings/reset`

Resets all settings to default values.

#### Response
```json
{
  "success": true,
  "message": "Settings reset to defaults successfully",
  "data": {
    // ... reset settings object
  }
}
```

### 11. Delete Settings

**DELETE** `/api/settings`

Soft deletes (deactivates) user settings.

#### Response
```json
{
  "success": true,
  "message": "Settings deactivated successfully"
}
```

### 12. Export Settings

**GET** `/api/settings/export`

Exports user settings for backup or migration.

#### Response
```json
{
  "success": true,
  "message": "Settings exported successfully",
  "data": {
    "settingsId": "SET-202401-000001",
    "profile": {...},
    "notifications": {...},
    "preferences": {...},
    "privacy": {...},
    "exportedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 13. Import Settings

**POST** `/api/settings/import`

Imports settings from exported data.

#### Request Body
```json
{
  "settingsData": {
    "notifications": {...},
    "preferences": {...},
    "privacy": {...}
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Settings imported successfully",
  "data": {
    // ... updated settings object
  }
}
```

### 14. Get Settings Statistics

**GET** `/api/settings/stats`

**Access**: Super Admin only

Retrieves platform-wide settings statistics.

#### Response
```json
{
  "success": true,
  "message": "Settings statistics retrieved successfully",
  "data": {
    "totalUsers": 1250,
    "twoFactorEnabled": 425,
    "emailNotificationsEnabled": 1100,
    "darkThemeUsers": 380,
    "completeProfiles": 950
  }
}
```

## Data Models

### Settings Object Structure

```javascript
{
  settingsId: String,           // Unique identifier (SET-YYYYMM-NNNNNN)
  userId: ObjectId,             // Reference to User
  userName: String,             // User display name
  profile: {
    name: String,               // Full name (required, 2-100 chars)
    email: String,              // Email address (required, valid format)
    phone: String,              // Phone number (optional, valid format)
    jobTitle: String,           // Job title (optional, max 100 chars)
    avatar: String,             // Avatar URL (optional, max 500 chars)
    bio: String                 // Biography (optional, max 500 chars)
  },
  notifications: {
    emailNotifications: Boolean,    // Default: true
    smsNotifications: Boolean,      // Default: false
    pushNotifications: Boolean,     // Default: true
    marketingEmails: Boolean,       // Default: false
    activityNotifications: Boolean, // Default: true
    systemAlerts: Boolean,          // Default: true
    weeklyReports: Boolean,         // Default: true
    monthlyReports: Boolean         // Default: false
  },
  security: {
    twoFactorAuth: Boolean,         // Default: false
    sessionTimeout: Number,         // Default: 30 (5-120 minutes)
    loginAlerts: Boolean,           // Default: true
    passwordLastChanged: Date,      // Timestamp of last password change
    lastPasswordChangeRequest: Date // Timestamp of last change request
  },
  preferences: {
    theme: String,                  // "light"|"dark"|"system", default: "system"
    language: String,               // "en"|"es"|"fr"|"de"|"it"|"pt"|"hi", default: "en"
    timezone: String,               // Default: "UTC"
    dateFormat: String,             // "MM/DD/YYYY"|"DD/MM/YYYY"|"YYYY-MM-DD"
    timeFormat: String,             // "12h"|"24h", default: "12h"
    currency: String,               // "USD"|"EUR"|"GBP"|"INR"|"CAD"|"AUD"
    dashboardLayout: String,        // "compact"|"comfortable"|"spacious"
    itemsPerPage: Number            // 10-100, default: 20
  },
  privacy: {
    profileVisibility: String,      // "public"|"team"|"private"
    activityVisibility: String,     // "public"|"team"|"private"
    dataSharing: Boolean,           // Default: false
    analytics: Boolean              // Default: true
  },
  version: Number,                  // Settings version
  lastSyncedAt: Date,              // Last sync timestamp
  isActive: Boolean,               // Default: true
  createdBy: ObjectId,             // User who created
  updatedBy: ObjectId,             // User who last updated
  createdAt: Date,                 // Creation timestamp
  updatedAt: Date                  // Last update timestamp
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Settings not found |
| 409 | Conflict - Settings already exist |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

## Rate Limiting

- **General endpoints**: 100 requests per hour per user
- **Password change**: 5 requests per hour per user
- **Settings reset**: 3 requests per hour per user

## Security Considerations

1. **Password Validation**: Strong password requirements enforced
2. **Rate Limiting**: Prevents brute force attacks
3. **Input Validation**: All inputs validated and sanitized
4. **CORS Protection**: Proper CORS headers configured
5. **Data Encryption**: Sensitive data encrypted at rest
6. **Audit Logging**: All changes logged for security

## Examples

### Complete Settings Update
```javascript
// Update multiple settings sections
const settingsData = {
  profile: {
    name: "John Smith",
    jobTitle: "Senior Insurance Agent"
  },
  notifications: {
    emailNotifications: false,
    pushNotifications: true
  },
  preferences: {
    theme: "dark",
    language: "es",
    itemsPerPage: 50
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: 45
  }
};

const response = await fetch('/api/settings', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(settingsData)
});
```

### Password Change with Validation
```javascript
const passwordData = {
  currentPassword: "currentPass123!",
  newPassword: "newSecurePass456@",
  confirmPassword: "newSecurePass456@"
};

const response = await fetch('/api/settings/change-password', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(passwordData)
});
```

### Export and Import Settings
```javascript
// Export settings
const exportResponse = await fetch('/api/settings/export', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const exportedData = await exportResponse.json();

// Import settings
const importResponse = await fetch('/api/settings/import', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    settingsData: exportedData.data
  })
});
```

## Webhooks (Future Enhancement)

Settings changes can trigger webhooks for integration with external systems:

- `settings.profile.updated`
- `settings.security.changed`
- `settings.password.changed`
- `settings.preferences.updated`

## SDK Integration

The Settings API is fully compatible with the frontend JavaScript SDK:

```javascript
import { settingsBackendApi } from './services/api/settingsApiBackend';

// Get settings
const settings = await settingsBackendApi.getSettings();

// Update profile
const updatedProfile = await settingsBackendApi.updateProfile({
  name: "New Name",
  jobTitle: "New Title"
});

// Change password
await settingsBackendApi.changePassword({
  currentPassword: "old",
  newPassword: "new123!",
  confirmPassword: "new123!"
});
```
