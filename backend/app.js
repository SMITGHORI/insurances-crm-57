
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

// Import route handlers
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const policyRoutes = require('./routes/policies');
const claimRoutes = require('./routes/claims');
const leadRoutes = require('./routes/leads');
const quotationRoutes = require('./routes/quotations');
const invoiceRoutes = require('./routes/invoices');
const agentRoutes = require('./routes/agents');
const activityRoutes = require('./routes/activities');
const communicationRoutes = require('./routes/communication');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use(morgan('combined'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', authenticate, clientRoutes);
app.use('/api/policies', authenticate, policyRoutes);
app.use('/api/claims', authenticate, claimRoutes);
app.use('/api/leads', authenticate, leadRoutes);
app.use('/api/quotations', authenticate, quotationRoutes);
app.use('/api/invoices', authenticate, invoiceRoutes);
app.use('/api/agents', authenticate, agentRoutes);
app.use('/api/activities', authenticate, activityRoutes);
app.use('/api/communication', authenticate, communicationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
