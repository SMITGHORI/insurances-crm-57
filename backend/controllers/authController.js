
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * User login
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Request body:', req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    let user;
    let isDbConnected = true;

    try {
      // Try to find user in database with timeout
      const dbPromise = User.findOne({ email }).select('+password').populate('role');
      user = await Promise.race([
        dbPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]);
    } catch (dbError) {
      console.log('Database connection failed, using fallback authentication');
      isDbConnected = false;
      
      // Fallback authentication for development
      if (email === 'admin@gmail.com' && password === 'admin@123') {
        user = {
          _id: 'admin-fallback-id',
          email: 'admin@gmail.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'super_admin',
          branch: 'main',
          isActive: true,
          flatPermissions: [
            // Clients module
            'clients:view', 'clients:create', 'clients:edit', 'clients:delete', 'clients:export', 'clients:edit_sensitive',
            // Leads module
            'leads:view', 'leads:create', 'leads:edit', 'leads:delete', 'leads:export',
            // Quotations module
            'quotations:view', 'quotations:create', 'quotations:edit', 'quotations:delete', 'quotations:export',
            // Policies module
            'policies:view', 'policies:create', 'policies:edit', 'policies:delete', 'policies:approve', 'policies:export', 'policies:edit_sensitive',
            // Claims module
            'claims:view', 'claims:create', 'claims:edit', 'claims:delete', 'claims:approve', 'claims:export', 'claims:edit_status',
            // Invoices module
            'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:delete', 'invoices:export',
            // Agents module
            'agents:view', 'agents:create', 'agents:edit', 'agents:delete', 'agents:export',
            // Activities module
            'activities:view', 'activities:create', 'activities:edit', 'activities:delete', 'activities:export',
            // Offers module
            'offers:view', 'offers:create', 'offers:edit', 'offers:delete', 'offers:export',
            // Reports module
            'reports:view', 'reports:export',
            // Settings module
            'settings:view', 'settings:edit', 'settings:export',
            // Dashboard and general permissions
            'view_dashboard', 'manage_users', 'manage_roles', 'system_admin'
          ]
        };
      } else if (email === 'agent@gmail.com' && password === 'agent123') {
        user = {
          _id: 'agent-fallback-id',
          email: 'agent@gmail.com',
          firstName: 'Test',
          lastName: 'Agent',
          role: 'agent',
          branch: 'branch1',
          isActive: true,
          flatPermissions: ['view_dashboard', 'view_reports', 'manage_policies']
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For database users, perform additional checks
    if (isDbConnected) {
      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
        });
      }

      // Check if account is inactive
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      // Verify password for database users
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        // Increment login attempts
        try {
          await user.incLoginAttempts();
        } catch (e) {
          console.log('Could not increment login attempts:', e.message);
        }
        
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        try {
          await User.findByIdAndUpdate(user._id, {
            $unset: { loginAttempts: 1, lockUntil: 1 }
          });
        } catch (e) {
          console.log('Could not reset login attempts:', e.message);
        }
      }

      // Update last login and activity
      try {
        user.lastLogin = new Date();
        user.lastActivity = new Date();
        await user.save();
      } catch (e) {
        console.log('Could not update user activity:', e.message);
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove sensitive data from response
    const userResponse = isDbConnected ? user.toObject() : user;
    delete userResponse.password;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        permissions: user.flatPermissions || []
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * User logout
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Update user's last activity
    await User.findByIdAndUpdate(userId, {
      lastActivity: new Date(),
      isOnline: false
    });
    
    // In a production environment, you might want to:
    // 1. Blacklist the JWT token
    // 2. Clear any active sessions from a session store
    // 3. Log the logout activity
    
    successResponse(res, { message: 'Logged out successfully' }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Check authentication status
 * @route GET /api/auth/me
 * @access Private
 */
const getAuthenticatedUser = async (req, res, next) => {
  try {
    // req.user is already populated by authMiddleware
    // We need to populate the role field for complete user data
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('role')
      .lean();
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'User authenticated',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh user session
 * @route POST /api/auth/refresh
 * @access Private
 */
const refreshSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Update last activity
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        lastActivity: new Date(),
        isOnline: true 
      },
      { new: true }
    ).select('-password');
    
    successResponse(res, { message: 'Session refreshed', data: user }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getAuthenticatedUser,
  refreshSession
};
