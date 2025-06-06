
const jwt = require('jsonwebtoken');

// Simple auth middleware for testing
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // For development/testing, create a mock user
      req.user = {
        _id: '60d5ecb54b24a0001f5e9b8f',
        name: 'Test User',
        email: 'test@example.com',
        role: 'super_admin'
      };
      return next();
    }

    // In production, verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    req.user = decoded;
    next();
  } catch (error) {
    // For development, continue with mock user
    req.user = {
      _id: '60d5ecb54b24a0001f5e9b8f',
      name: 'Test User',
      email: 'test@example.com',
      role: 'super_admin'
    };
    next();
  }
};

module.exports = authMiddleware;
