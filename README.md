# Insurance CRM - Full Stack Application

A comprehensive Customer Relationship Management system built specifically for insurance agencies, featuring policy management, claims processing, lead tracking, and commission calculations.

## 🚀 Features

- **Client Management**: Complete customer profiles with policy history
- **Policy Administration**: Multi-product policy management with renewals
- **Claims Processing**: End-to-end claims workflow with document management
- **Lead Tracking**: Sales pipeline with conversion analytics
- **Commission Management**: Automated commission calculations and reporting
- **Agent Portal**: Dedicated interface for insurance agents
- **Analytics Dashboard**: Real-time business intelligence and reporting
- **Document Management**: Secure document storage and retrieval
- **Role-Based Access Control**: Granular permissions system

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Router** for navigation
- **React Query** for data fetching
- **Zustand** for state management

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Joi** for validation
- **Multer** for file uploads

### Development Tools
- **Storybook** for component development
- **Vitest** for testing
- **ESLint** & **Prettier** for code quality
- **Husky** for git hooks

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 5.0+
- npm or yarn

### Clone Repository
```bash
git clone https://github.com/your-org/insurance-crm.git
cd insurance-crm
```

### Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Environment Setup
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME="Amba Insurance CRM"

# Backend (.env)
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/insurance-crm
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### Database Setup
```bash
# Start MongoDB service
sudo systemctl start mongod

# Run database migrations
cd backend
npm run migrate

# Seed initial data
npm run seed
```

## 🚀 Development

### Start Development Servers
```bash
# Terminal 1: Backend server
cd backend
npm run dev

# Terminal 2: Frontend server  
npm run dev

# Terminal 3: Storybook (optional)
npm run storybook
```

### Available Scripts
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run storybook    # Start Storybook

# Backend
npm run dev          # Start with nodemon
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run test         # Run tests
npm run migrate      # Run database migrations
npm run seed         # Seed database
```

## Role-Based Access Control (RBAC)

### Overview

Our RBAC system provides comprehensive permission management across all CRM modules with a three-tier architecture:

- **Frontend**: React components with `<Protected>` wrappers and `usePermissions()` hooks
- **Backend**: Express.js APIs with role validation middleware
- **Database**: MongoDB with Role and User collections for dynamic permission management

### Role Schema Structure

#### Role Model (`backend/models/Role.ts`)

```typescript
interface IRole {
  name: 'agent' | 'manager' | 'admin' | 'super_admin';      // Unique role identifier
  displayName: string;                                       // Human-readable name
  permissions: IPermission[];                                // Module-action matrix
  isDefault: boolean;                                        // System default role
  createdAt: Date;                                          // Auto-managed timestamp
  updatedAt: Date;                                          // Auto-managed timestamp
  permissionCount: number;                                  // Virtual field
}

interface IPermission {
  module: 'clients' | 'leads' | 'quotations' | 'policies' | 'claims' | 
          'invoices' | 'agents' | 'reports' | 'settings' | 'activities' | 'offers';
  actions: ('view' | 'create' | 'edit' | 'delete' | 'export' | 
           'approve' | 'edit_sensitive' | 'edit_status')[];
}
```

#### User Schema Updates (`backend/models/User.ts`)

```typescript
interface IUser {
  // ... existing fields
  role: ObjectId;                    // Reference to Role collection
  branch: 'main' | 'north' | 'south' | 'east' | 'west';  // Branch assignment
  flatPermissions: string[];         // Virtual: ['clients:view', 'policies:create', ...]
}
```

**Key Features:**
- Pre-find hook automatically populates `role` with permissions
- `flatPermissions` virtual provides optimized permission checking
- Branch-based access control for multi-location operations

### API Endpoints

#### Role Management (`/api/roles`)

```http
GET    /api/roles                    # List all roles (+ ?include_permissions=true)
GET    /api/roles/:id                # Get specific role details  
GET    /api/roles/:id/permissions    # Get role's permission matrix
PUT    /api/roles/:id/permissions    # Update role's permissions
```

**Authentication & Authorization:**
- All endpoints require valid JWT token (`Authorization: Bearer <token>`)
- All endpoints restricted to `super_admin` role only
- Cannot modify `super_admin` role permissions (system protection)

**Example Usage:**

```javascript
// Get all roles with permissions
const response = await fetch('/api/roles?include_permissions=true', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Update agent permissions
await fetch('/api/roles/agent-role-id/permissions', {
  method: 'PUT',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    permissions: [
      { module: 'clients', actions: ['view', 'create', 'edit'] },
      { module: 'policies', actions: ['view', 'create'] }
    ]
  })
});
```

### Frontend Integration

#### Permission Checking

```jsx
import { usePermissions } from '@/hooks/usePermissions';
import Protected from '@/components/Protected';

// Hook usage
const { hasPermission, userRole, flatPermissions } = usePermissions();

// Component protection
<Protected module="clients" action="delete">
  <DeleteButton />
</Protected>

// Field-level protection  
<ProtectedField module="clients" action="edit_sensitive">
  <Input name="panNumber" />
</ProtectedField>

// Route protection
<ProtectedRoute module="agents" action="view">
  <AgentsPage />
</ProtectedRoute>
```

#### PermissionEditor Component

The `PermissionEditor` component (`/src/components/settings/PermissionEditor.tsx`) provides a visual matrix interface for super admins to:

- Select any role from a dropdown
- View current permissions in a module × action grid
- Toggle individual permissions via checkboxes
- Save changes with real-time validation
- View permission summaries and counts

**Integration in Settings:**
```jsx
// Settings.jsx - Permissions tab
{activeTab === "permissions" && (
  <Protected module="settings" action="view_permissions">
    <div className="space-y-6">
      <PermissionOverview />
      {user?.role === 'super_admin' && <PermissionEditor />}
    </div>
  </Protected>
)}
```

### Role Hierarchy & Default Permissions

1. **Agent**: Basic CRUD on assigned records
   - Clients: view, create, edit (assigned only)
   - Policies: view, create (own quotations)
   - Claims: view, create (assigned clients)

2. **Manager**: Team management + full module access
   - All Agent permissions
   - Full CRUD on team records
   - Approval workflows
   - Export capabilities

3. **Admin**: System operations + user management
   - All Manager permissions
   - User account management
   - System configuration
   - Cross-branch access

4. **Super Admin**: Complete system control
   - All Admin permissions
   - Role permission management
   - System critical operations
   - RBAC configuration

### Setup & Migration

1. **Initialize Default Roles:**
   ```bash
   npm run seed:roles  # Creates default role documents
   ```

2. **Migrate Existing Users:**
   ```bash
   npm run migrate:user-roles  # Updates User.role references
   ```

3. **Test Permission Matrix:**
   ```bash
   npm test -- --grep "RBAC"  # Runs RBAC-specific tests
   ```

### Development Notes

- Role permissions are cached in JWT tokens for performance
- Permission changes trigger real-time updates via WebSocket events
- Branch-based access control supports multi-location deployments
- All sensitive operations require explicit permission checks
- Frontend components gracefully degrade when permissions are insufficient

For detailed API documentation, see [`docs/api/roles.yaml`](docs/api/roles.yaml).

## 📁 Project Structure

```
insurance-crm/
├── src/                          # Frontend source code
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Base UI components (shadcn/ui)
│   │   ├── forms/               # Form components
│   │   ├── charts/              # Chart components
│   │   └── __stories__/         # Storybook stories
│   ├── pages/                   # Page components
│   ├── hooks/                   # Custom React hooks
│   ├── contexts/                # React contexts
│   ├── lib/                     # Utility functions
│   ├── types/                   # TypeScript type definitions
│   └── assets/                  # Static assets
├── backend/                     # Backend source code
│   ├── controllers/             # Route controllers
│   ├── models/                  # Database models
│   ├── routes/                  # API routes
│   ├── middleware/              # Express middleware
│   ├── utils/                   # Utility functions
│   └── config/                  # Configuration files
├── docs/                        # Documentation
│   ├── api/                     # API documentation
│   └── deployment/              # Deployment guides
└── tests/                       # Test files
```

## 🧪 Testing

### Frontend Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- AccessDenied.test.tsx
```

### Backend Testing
```bash
cd backend

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

### E2E Testing
```bash
# Run Playwright tests
npm run test:e2e

# Run tests in headed mode
npm run test:e2e:headed
```

## 📚 API Documentation

### Authentication
All API endpoints require authentication via JWT tokens:

```javascript
// Login to get token
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();

// Use token in subsequent requests
const apiResponse = await fetch('/api/clients', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Core Endpoints

#### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

#### Policies
- `GET /api/policies` - List policies
- `POST /api/policies` - Create policy
- `GET /api/policies/:id` - Get policy details
- `PUT /api/policies/:id` - Update policy
- `DELETE /api/policies/:id` - Delete policy

#### Claims
- `GET /api/claims` - List claims
- `POST /api/claims` - Create claim
- `GET /api/claims/:id` - Get claim details
- `PUT /api/claims/:id` - Update claim
- `DELETE /api/claims/:id` - Delete claim

For complete API documentation, see the OpenAPI specs in `/docs/api/`.

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### Environment Variables (Production)
```bash
# Frontend
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME="Your Insurance CRM"

# Backend
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-mongo-host:27017/insurance-crm
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@insurancecrm.com
- Documentation: [docs.insurancecrm.com](https://docs.insurancecrm.com)

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the component library
- [Lucide](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling
- All contributors who helped build this project
