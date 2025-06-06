
#!/usr/bin/env node

// Auto-start script for the backend server
// This script will attempt to start the server automatically

const express = require('express');
const cors = require('cors');

// Simple express server that serves as a fallback
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins (development only)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Mock endpoints for development
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Development server is running (no MongoDB)',
    timestamp: new Date().toISOString(),
    mode: 'fallback'
  });
});

app.get('/api/clients', (req, res) => {
  res.json({
    success: true,
    data: [],
    total: 0,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10
    }
  });
});

app.post('/api/clients', (req, res) => {
  res.json({
    success: true,
    message: 'Client created (mock)',
    data: {
      _id: Date.now().toString(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Fallback server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚠️  This is a development fallback server`);
});
