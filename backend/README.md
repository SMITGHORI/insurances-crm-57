
# Insurance CRM Backend - Policies Module

## Overview
This backend API provides comprehensive insurance policy management functionality for the Insurance CRM system. Built with Node.js, Express.js, and MongoDB, it follows international coding standards and best practices.

## Technology Stack
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Testing**: Jest with Supertest
- **File Upload**: Multer
- **Security**: bcryptjs, helmet, cors

## Features

### Core Functionality
- ✅ **CRUD Operations**: Create, Read, Update, Delete policies
- ✅ **Role-Based Access Control**: Super Admin, Manager, Agent roles
- ✅ **Document Management**: Upload, download, delete policy documents
- ✅ **Payment Tracking**: Payment history and premium management
- ✅ **Policy Renewal**: Automated renewal process with history
- ✅ **Search & Filtering**: Advanced search with multiple filters
- ✅ **Pagination**: Efficient data loading with pagination
- ✅ **Notes System**: Add private/public notes to policies
- ✅ **Statistics & Reports**: Comprehensive policy analytics

### Advanced Features
- ✅ **Soft Delete**: Policies are soft-deleted for data integrity
- ✅ **Audit Trail**: Track all changes with timestamps and user info
- ✅ **Data Validation**: Comprehensive input validation with Joi
- ✅ **Error Handling**: Standardized error responses
- ✅ **Security**: JWT authentication, role-based authorization
- ✅ **Performance**: Database indexing and query optimization
- ✅ **Testing**: Comprehensive test suite with Jest

## API Endpoints

### Policies Management
```
GET    /api/policies                    # Get all policies (with filters)
GET    /api/policies/:id                # Get policy by ID
POST   /api/policies                    # Create new policy
PUT    /api/policies/:id                # Update policy
DELETE /api/policies/:id                # Delete policy (soft delete)
```

### Document Management
```
POST   /api/policies/:id/documents      # Upload document
GET    /api/policies/:id/documents      # Get policy documents
DELETE /api/policies/:id/documents/:docId # Delete document
```

### Payment Management
```
POST   /api/policies/:id/payments       # Add payment record
GET    /api/policies/:id/payments       # Get payment history
```

### Policy Operations
```
POST   /api/policies/:id/renew          # Renew policy
POST   /api/policies/:id/notes          # Add note
GET    /api/policies/:id/notes          # Get policy notes
PUT    /api/policies/:id/assign         # Assign to agent
```

### Search & Analytics
```
GET    /api/policies/search/:query      # Search policies
GET    /api/policies/agent/:agentId     # Get policies by agent
GET    /api/policies/stats/summary      # Get statistics
GET    /api/policies/expiring/:days     # Get expiring policies
GET    /api/policies/renewals/due       # Get policies due for renewal
```

### Bulk Operations
```
POST   /api/policies/bulk/assign        # Bulk assign policies
GET    /api/policies/export             # Export policies data
```

## Database Schema

### Policy Model
```javascript
{
  policyNumber: String,        // Unique policy identifier
  clientId: ObjectId,          // Reference to Client
  type: String,                // life, health, auto, home, business, etc.
  subType: String,             // Policy subtype
  status: String,              // active, pending, expired, cancelled, etc.
  company: String,             // Insurance company name
  companyPolicyNumber: String, // Company's internal policy number
  
  premium: {
    amount: Number,            // Premium amount
    frequency: String,         // monthly, quarterly, semi-annual, annual
    nextDueDate: Date         // Next payment due date
  },
  
  coverage: {
    amount: Number,            // Coverage amount
    deductible: Number,        // Deductible amount
    benefits: [String],        // List of benefits
    exclusions: [String]       // List of exclusions
  },
  
  startDate: Date,             // Policy start date
  endDate: Date,               // Policy end date
  assignedAgentId: ObjectId,   // Reference to User (agent)
  
  commission: {
    rate: Number,              // Commission rate percentage
    amount: Number,            // Commission amount
    paid: Boolean,             // Commission payment status
    paidDate: Date            // Commission payment date
  },
  
  // Embedded collections
  documents: [DocumentSchema],
  paymentHistory: [PaymentSchema],
  renewalHistory: [RenewalSchema],
  notes: [NoteSchema],
  
  // Additional fields
  tags: [String],
  priority: String,
  isAutoRenewal: Boolean,
  lastContactDate: Date,
  nextFollowUpDate: Date,
  
  // Audit fields
  createdBy: ObjectId,
  updatedBy: ObjectId,
  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId
}
```

### Embedded Schemas

#### Document Schema
```javascript
{
  name: String,
  type: String,                // policy_document, claim_form, etc.
  url: String,
  size: Number,
  mimeType: String,
  uploadedBy: ObjectId,
  uploadedAt: Date
}
```

#### Payment Schema
```javascript
{
  amount: Number,
  date: Date,
  method: String,              // cash, check, bank_transfer, etc.
  status: String,              // pending, completed, failed, refunded
  transactionId: String,
  notes: String
}
```

#### Renewal Schema
```javascript
{
  renewalDate: Date,
  previousEndDate: Date,
  premium: Number,
  agentId: ObjectId,
  notes: String
}
```

#### Note Schema
```javascript
{
  content: String,
  createdBy: ObjectId,
  createdAt: Date,
  isPrivate: Boolean,
  tags: [String]
}
```

## Authentication & Authorization

### JWT Authentication
All API endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access Control

#### Super Admin
- Full access to all policies and operations
- Can create, read, update, delete any policy
- Access to all statistics and reports
- Can assign policies to agents

#### Manager
- Access to all policies within their region/team
- Can create and update policies
- Can assign policies to agents
- Access to statistics and reports

#### Agent
- Access only to policies assigned to them
- Can update certain fields of assigned policies
- Can add payments, notes, and documents
- Limited access to statistics

## Error Handling
The API uses a standardized error response format with appropriate HTTP status codes:

```javascript
{
  success: false,
  message: "Error message",
  timestamp: "2024-01-01T10:00:00.000Z",
  errors: [
    {
      field: "premium.amount",
      message: "Premium amount must be positive",
      value: -100
    }
  ]
}
```

## Response Format
All API responses follow a consistent format:

```javascript
{
  success: true,
  message: "Operation successful",
  data: { /* response data */ },
  timestamp: "2024-01-01T10:00:00.000Z"
}
```

## Testing
Comprehensive test suite for all endpoints using Jest and Supertest:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Security Best Practices
- ✅ JWT Authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ Input Validation
- ✅ Parameter Sanitization
- ✅ Error Handling without leaking sensitive info
- ✅ Secure Password Storage with bcrypt
- ✅ Content Security Policy (CSP)
- ✅ Rate Limiting
- ✅ CORS Configuration

## Installation & Setup

### Prerequisites
- Node.js v16+
- MongoDB Atlas account (or local MongoDB v4+)
- NPM or Yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/insurance-crm-backend.git

# Install dependencies
cd insurance-crm-backend
npm install

# Set environment variables (create .env file)
cp .env.example .env

# Run the server
npm start

# Run in development mode
npm run dev
```

## Database Setup

### MongoDB Atlas Configuration

1. **Create MongoDB Atlas Account**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier available)
   - Set up database user credentials
   - Configure network access (add your IP or 0.0.0.0/0 for development)

2. **Get Connection String**
   - Navigate to your cluster in Atlas dashboard
   - Click "Connect" → "Connect your application"
   - Copy the connection string

3. **Configure Environment Variables**
   Update your `.env` file with the MongoDB Atlas connection string:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/insurance-crm?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   WS_PORT=5001
   ```

4. **Replace Placeholders**
   - `<USERNAME>`: Your MongoDB Atlas username
   - `<PASSWORD>`: Your MongoDB Atlas password
   - `<CLUSTER>`: Your cluster name
   - Database name: `insurance-crm`

5. **Test Connection**
   ```bash
   npm start
   ```
   You should see: "MongoDB Atlas connected successfully"

### Local MongoDB Setup (Alternative)
If you prefer local development:
```env
MONGODB_URI=mongodb://localhost:27017/insurance_crm
```

### Environment Variables Reference
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
WS_PORT=5001

# Database Configuration
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/insurance-crm?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=uploads
```

## Deployment
Deployment instructions for various environments:

### Docker
```bash
# Build the Docker image
docker build -t insurance-crm-backend .

# Run the container
docker run -p 5000:5000 insurance-crm-backend
```

### Custom Server
```bash
# Install PM2 globally
npm install pm2 -g

# Start the application with PM2
pm2 start ecosystem.config.js
```

## API Documentation

### Swagger UI Integration

This project includes comprehensive API documentation using Swagger UI with OpenAPI 3.0 specification.

#### Features
- **Interactive API Explorer**: Test endpoints directly from the browser
- **JWT Authentication**: Built-in authentication testing with Bearer tokens
- **Comprehensive Schemas**: Detailed request/response models
- **RBAC Documentation**: Role-based access control examples
- **Real-time Validation**: Request/response validation examples

#### Accessing Swagger UI
1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Open Swagger UI**
   Navigate to: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

3. **Authentication Setup**
   - Click the "Authorize" button in Swagger UI
   - Enter your JWT token in the format: `Bearer <your-token>`
   - Get a token by calling `/api/auth/login` endpoint first

#### Example API Documentation
The following endpoints are fully documented with Swagger:

**Leads Management**
- `GET /api/leads` - Get all leads with filtering and pagination
- `POST /api/leads` - Create a new lead (Agents, Managers, Super Admin)
- `PUT /api/leads/{id}/assign` - Assign lead to agent (Managers, Super Admin only)

**RBAC Examples**
The documentation demonstrates Role-Based Access Control:
- **Agents**: Can only access assigned leads
- **Managers**: Can access all leads in their region
- **Super Admins**: Full access to all resources

#### Swagger Configuration
The Swagger configuration is located in `/config/swagger.js` and includes:
- OpenAPI 3.0 specification
- JWT Bearer authentication scheme
- Environment-based server URLs
- Comprehensive error response schemas
- Reusable components and schemas

#### Adding Documentation to New Endpoints
To document new API endpoints, add JSDoc comments above your route handlers:

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Your endpoint description
 *     tags: [YourTag]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 */
router.get('/your-endpoint', authMiddleware, yourController);
```

#### Production Notes
- Swagger UI is automatically disabled in production environment
- Set `NODE_ENV=production` to disable the `/api-docs` endpoint
- API documentation remains accessible via exported OpenAPI spec

### Additional Documentation
- [Postman Collection](./docs/postman/insurance-crm-api.json)
- [API Reference Guide](./docs/api-reference.md)
- [Authentication Guide](./docs/authentication.md)

## Contributors
- Your Name <your.email@example.com>

## License
MIT
