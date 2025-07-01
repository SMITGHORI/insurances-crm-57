
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

// Swagger imports
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');

const app = express();
const server = http.createServer(app);

// Import middleware
const rateLimiter = require('./middleware/rateLimiter');
const auditLogger = require('./middleware/auditLogger');
const performanceMonitor = require('./middleware/performanceMonitor');
const webSocketManager = require('./middleware/websocket');
const { globalErrorHandler } = require('./utils/errorHandler');

// Import route modules
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const policyRoutes = require('./routes/policies');
const claimRoutes = require('./routes/claims');
const leadRoutes = require('./routes/leads');
const agentRoutes = require('./routes/agents');
const quotationRoutes = require('./routes/quotations');
const dashboardRoutes = require('./routes/dashboard');
const communicationRoutes = require('./routes/communication');
const broadcastRoutes = require('./routes/broadcast');
const enhancedBroadcastRoutes = require('./routes/enhancedBroadcast');
const campaignRoutes = require('./routes/campaigns');
const activitiesRoutes = require('./routes/activities');
const headerRoutes = require('./routes/header');
const settingsRoutes = require('./routes/settings');
const invoiceRoutes = require('./routes/invoices');
const roleRoutes = require('./routes/roleRoutes');

// Initialize WebSocket
webSocketManager.initialize(server);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Performance monitoring (before other middleware)
app.use(performanceMonitor.middleware());

// Rate limiting
app.use(rateLimiter.getGeneralLimiter());

// Audit logging (after auth middleware in routes)
app.use(auditLogger.middleware());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB Atlas connected successfully");
  console.log(`Connected to database: ${mongoose.connection.name}`);
  // Initialize roles on successful connection
  const { initializeRoles } = require('./migrations/seedRoles');
  initializeRoles().catch(err => console.error("Role initialization error:", err));
})
.catch(err => console.error("MongoDB connection error:", err));

// Routes with specific rate limiting
app.use('/api/auth', rateLimiter.getAuthLimiter(), authRoutes);
app.use('/api/clients', rateLimiter.getAPILimiter(), clientRoutes);
app.use('/api/policies', rateLimiter.getAPILimiter(), policyRoutes);
app.use('/api/claims', rateLimiter.getAPILimiter(), claimRoutes);
app.use('/api/leads', rateLimiter.getAPILimiter(), leadRoutes);
app.use('/api/agents', rateLimiter.getAPILimiter(), agentRoutes);
app.use('/api/quotations', rateLimiter.getAPILimiter(), quotationRoutes);
app.use('/api/dashboard', rateLimiter.getAPILimiter(), dashboardRoutes);
app.use('/api/communication', rateLimiter.getAPILimiter(), communicationRoutes);
app.use('/api/broadcast', rateLimiter.getBulkOperationLimiter(), broadcastRoutes);
app.use('/api/enhanced-broadcast', rateLimiter.getBulkOperationLimiter(), enhancedBroadcastRoutes);
app.use('/api/campaigns', rateLimiter.getAPILimiter(), campaignRoutes);
app.use('/api/activities', rateLimiter.getAPILimiter(), activitiesRoutes);
app.use('/api/header', rateLimiter.getAPILimiter(), headerRoutes);
app.use('/api/settings', rateLimiter.getAPILimiter(), settingsRoutes);
app.use('/api/invoices', rateLimiter.getAPILimiter(), invoiceRoutes);
app.use('/api/roles', rateLimiter.getAPILimiter(), roleRoutes);

// Performance metrics endpoint
app.get('/api/metrics', rateLimiter.getAPILimiter(), (req, res) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  const timeframe = req.query.timeframe || '1h';
  const metrics = performanceMonitor.getMetrics(timeframe);
  res.json(metrics);
});

// Swagger API documentation (only in non-production)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Insurance CRM API Documentation'
  }));
  console.log(`Swagger UI available at http://localhost:${process.env.PORT || 5000}/api-docs`);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Global error handling middleware
app.use(globalErrorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server initialized`);
  });
}

module.exports = { app, server };
