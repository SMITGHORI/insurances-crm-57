
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
require('dotenv').config();

const { errorHandler, notFound } = require('./utils/errorHandler');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const policyRoutes = require('./routes/policies');
const claimRoutes = require('./routes/claims');
const leadRoutes = require('./routes/leads');
const quotationRoutes = require('./routes/quotations');
const agentRoutes = require('./routes/agents');
const activityRoutes = require('./routes/activities');
const communicationRoutes = require('./routes/communication');
const dashboardRoutes = require('./routes/dashboard');
const headerRoutes = require('./routes/header');
const settingsRoutes = require('./routes/settings');
const interactionRoutes = require('./routes/interactions');
const followUpRoutes = require('./routes/followUps');

const app = express();

// Connect to MongoDB
connectDB();

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(mongoSanitize());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/header', headerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/follow-ups', followUpRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running properly',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
