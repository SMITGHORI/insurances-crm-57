
# Dashboard API Documentation

## Overview
The Dashboard API provides endpoints for retrieving cross-module data aggregation, analytics, and real-time dashboard information.

## Base URL
```
/api/dashboard
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get Dashboard Overview
**GET** `/overview`

Retrieves overview statistics for the dashboard.

#### Response
```json
{
  "success": true,
  "message": "Dashboard overview retrieved successfully",
  "data": {
    "clients": {
      "total": 1250,
      "active": 1100,
      "trend": "+12%"
    },
    "policies": {
      "total": 2340,
      "active": 2180,
      "trend": "+8%"
    },
    "claims": {
      "total": 156,
      "pending": 23,
      "trend": "-5%"
    },
    "leads": {
      "total": 450,
      "active": 320,
      "conversionRate": "28.50",
      "trend": "+15%"
    },
    "quotations": {
      "total": 680,
      "pending": 120,
      "conversionRate": "65.20",
      "trend": "+10%"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Get Recent Activities
**GET** `/activities`

Retrieves recent activities for the dashboard.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 10 | Maximum number of activities to return (1-100) |

#### Response
```json
{
  "success": true,
  "message": "Recent activities retrieved successfully",
  "data": [
    {
      "_id": "60f7b3b3b3f3b3b3b3f3b3b3",
      "activityId": "ACT-2024-001234",
      "type": "policy_created",
      "description": "New auto policy created for John Client",
      "performedBy": {
        "_id": "60f7b3b3b3f3b3b3b3f3b3b3",
        "name": "Agent Smith",
        "email": "agent@example.com"
      },
      "relatedClient": {
        "_id": "60f7b3b3b3f3b3b3b3f3b3b3",
        "name": "John Client",
        "email": "john@example.com"
      },
      "metadata": {
        "policyNumber": "POL-2024-001234",
        "premium": 1200
      },
      "createdAt": "2024-01-15T09:30:00Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 3. Get Performance Metrics
**GET** `/performance`

Retrieves performance metrics for a specified time period.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | 30d | Time period: 7d, 30d, 90d |

#### Response
```json
{
  "success": true,
  "message": "Performance metrics retrieved successfully",
  "data": {
    "period": "30d",
    "newClients": 45,
    "newPolicies": 78,
    "newClaims": 12,
    "newLeads": 156,
    "totalRevenue": 234000,
    "averageDealSize": "3000.00"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4. Get Charts Data
**GET** `/charts`

Retrieves data for dashboard charts and visualizations.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| type | string | all | Chart type: all, revenue, leads, claims |

#### Response
```json
{
  "success": true,
  "message": "Charts data retrieved successfully",
  "data": {
    "revenue": [
      {
        "month": "2024-01",
        "revenue": 145000,
        "policies": 45
      },
      {
        "month": "2024-02",
        "revenue": 162000,
        "policies": 52
      }
    ],
    "leadsFunnel": [
      {
        "status": "new",
        "count": 120
      },
      {
        "status": "contacted",
        "count": 89
      },
      {
        "status": "qualified",
        "count": 45
      }
    ],
    "claimsStatus": [
      {
        "status": "submitted",
        "count": 15,
        "amount": 125000
      },
      {
        "status": "approved",
        "count": 8,
        "amount": 89000
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 5. Get Quick Actions
**GET** `/quick-actions`

Retrieves items that need immediate attention.

#### Response
```json
{
  "success": true,
  "message": "Quick actions data retrieved successfully",
  "data": {
    "pendingClaims": {
      "count": 5,
      "items": [
        {
          "claimId": "CLM-2024-001234",
          "claimAmount": 5000,
          "status": "submitted",
          "createdAt": "2024-01-14T10:30:00Z"
        }
      ]
    },
    "expiringPolicies": {
      "count": 3,
      "items": [
        {
          "policyNumber": "POL-2024-001234",
          "premium": 1200,
          "endDate": "2024-01-20T00:00:00Z"
        }
      ]
    },
    "overdueLeads": {
      "count": 8,
      "items": [
        {
          "name": "John Prospect",
          "email": "john@example.com",
          "phone": "+1234567890",
          "status": "contacted",
          "lastContactDate": "2024-01-08T10:30:00Z"
        }
      ]
    },
    "pendingQuotations": {
      "count": 4,
      "items": [
        {
          "quotationNumber": "QUO-2024-001234",
          "totalAmount": 1500,
          "status": "sent",
          "createdAt": "2024-01-12T10:30:00Z"
        }
      ]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Data Filtering
- **Super Admin**: Can view all data across the system
- **Agent**: Can only view data assigned to them or related to their activities
- **Manager**: Can view data for their team members

## Performance Periods
- `7d`: Last 7 days
- `30d`: Last 30 days (default)
- `90d`: Last 90 days

## Chart Types
- `all`: Returns all chart data
- `revenue`: Revenue and policy trends
- `leads`: Lead funnel data
- `claims`: Claims status distribution

## Error Codes
| Code | Message | Description |
|------|---------|-------------|
| 400 | Validation error | Invalid query parameters |
| 401 | Access denied | Missing or invalid authorization token |
| 403 | Forbidden | Insufficient permissions |
| 500 | Internal Server Error | Server-side error occurred |

## Real-time Data Sync
The dashboard API supports real-time data synchronization through:
- WebSocket connections for live updates
- Polling mechanism for periodic data refresh
- Event-driven updates when related data changes
