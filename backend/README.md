# Insurance CRM Backend - Client Module

## Overview
This is a comprehensive Node.js + Express + MongoDB backend API for the client module of an insurance CRM system. It includes role-based access control, comprehensive validation, file uploads, and follows international coding standards.

## Tech Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Joi** - Validation
- **Multer** - File uploads
- **Jest** - Testing framework

## Features
- ✅ Role-based access control (Super Admin, Manager, Agent)
- ✅ Comprehensive client management (Individual, Corporate, Group)
- ✅ Document upload and management
- ✅ Advanced search and filtering
- ✅ Data validation and sanitization
- ✅ Error handling and logging
- ✅ Unit and integration tests
- ✅ API documentation
- ✅ Performance optimizations

## Project Structure
```
backend/
├── controllers/
│   └── clientController.js     # Client business logic
├── models/
│   └── Client.js              # MongoDB schema
├── routes/
│   └── clients.js             # API routes
├── middleware/
│   ├── auth.js                # Authentication
│   ├── roleMiddleware.js      # Authorization
│   ├── upload.js              # File upload
│   └── validation.js          # Input validation
├── validations/
│   └── clientValidation.js    # Joi schemas
├── utils/
│   ├── errorHandler.js        # Error management
│   ├── responseHandler.js     # Response formatting
│   └── fileHandler.js         # File operations
├── tests/
│   └── clients.test.js        # Test suites
└── docs/
    └── api/
        └── clients-api-documentation.md
```

## Installation

1. **Clone and setup:**
```bash
git clone <your-repo>
cd backend
npm install
```

2. **Environment variables:**
```bash
# Create .env file
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/insurance_crm
JWT_SECRET=your-super-secret-jwt-key
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

3. **Database setup:**
```bash
# Start MongoDB
mongod

# Create indexes (run once)
npm run create-indexes
```

4. **Start development server:**
```bash
npm run dev
```

## API Endpoints

### Authentication Required
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Base URL
```
http://localhost:5000/api/clients
```

### Available Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all clients | All roles |
| GET | `/:id` | Get client by ID | All roles |
| POST | `/` | Create client | Admin, Manager |
| PUT | `/:id` | Update client | All roles* |
| DELETE | `/:id` | Delete client | Admin only |
| POST | `/:id/documents` | Upload document | All roles* |
| GET | `/:id/documents` | Get documents | All roles* |
| DELETE | `/:id/documents/:docId` | Delete document | All roles* |

*Agents can only access their assigned clients

## Role-Based Access Control

### Super Admin
- Full access to all clients
- Can create, read, update, delete any client
- Can assign agents to clients
- Can view system statistics

### Manager
- Can view all clients in their region/team
- Can create and update clients
- Can assign agents to clients
- Cannot delete clients

### Agent
- Can only view clients assigned to them
- Can update assigned clients
- Can upload documents for assigned clients
- Cannot delete clients or view other agents' clients

## Data Models

### Individual Client
```javascript
{
  clientType: "individual",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@email.com",
  phone: "9876543210",
  dob: "1985-06-15",
  gender: "male",
  panNumber: "ABCDE1234F",
  // ... other fields
}
```

### Corporate Client
```javascript
{
  clientType: "corporate",
  companyName: "Tech Solutions Ltd",
  registrationNo: "REG123456",
  email: "contact@techsolutions.com",
  industry: "IT",
  employeeCount: 250,
  contactPersonName: "Vijay Rao",
  // ... other fields
}
```

### Group Client
```javascript
{
  clientType: "group",
  groupName: "Family Insurance Group",
  groupType: "family",
  memberCount: 5,
  primaryContactName: "John Smith",
  // ... other fields
}
```

## Validation Rules

### Common Validations
- Email: Valid email format, unique
- Phone: 10-digit number
- PIN code: 6-digit number
- PAN: Format ABCDE1234F
- GST: Valid GST number format

### File Upload
- Max size: 5MB
- Allowed types: PDF, JPG, PNG
- Virus scanning (configurable)

## Error Handling

### Error Response Format
```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Testing

### Run Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Test coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Structure
- Unit tests for models and utilities
- Integration tests for API endpoints
- Authentication and authorization tests
- Validation tests
- File upload tests

## Performance Optimizations

### Database Indexes
```javascript
// Compound indexes for common queries
{ assignedAgentId: 1, status: 1 }
{ clientType: 1, status: 1 }
{ createdAt: -1 }

// Text index for search
{ clientId: "text", email: "text", "individualData.firstName": "text" }
```

### Query Optimizations
- Pagination with skip/limit
- Field selection with lean()
- Proper use of aggregation pipeline
- Connection pooling

## Security Features

### Input Validation
- Joi schema validation
- XSS protection
- SQL injection prevention
- File type validation

### Authentication & Authorization
- JWT token validation
- Role-based access control
- Resource ownership checks
- Password hashing with bcrypt

### File Security
- File type restrictions
- File size limits
- Secure file storage
- Virus scanning (optional)

## Monitoring & Logging

### Logging Levels
- ERROR: Application errors
- WARN: Warning conditions
- INFO: General information
- DEBUG: Debug information

### Health Checks
```bash
GET /api/health
```

### Metrics
- Response times
- Error rates
- Database query performance
- File upload statistics

## Deployment

### Production Environment
```bash
# Build for production
npm run build

# Start production server
npm start

# Using PM2
pm2 start ecosystem.config.js
```

### Environment Variables (Production)
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
REDIS_URL=redis://your-redis-instance
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## API Rate Limiting
```javascript
// Configure rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Contributing

### Code Standards
- ESLint configuration
- Prettier formatting
- Conventional commits
- JSDoc documentation

### Development Workflow
1. Create feature branch
2. Write tests first (TDD)
3. Implement feature
4. Update documentation
5. Submit pull request

## Support

### Documentation
- API documentation: `/docs/api/`
- Postman collection: `/docs/postman/`
- OpenAPI spec: `/docs/openapi.json`

### Contact
- Email: dev-team@company.com
- Slack: #insurance-crm-dev
- Documentation: https://docs.company.com/crm
