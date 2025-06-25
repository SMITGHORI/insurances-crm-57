
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

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
const invoiceRoutes = require('./routes/invoices'); // Add invoice routes

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/enhanced-broadcast', enhancedBroadcastRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/header', headerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/invoices', invoiceRoutes); // Add invoice routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
