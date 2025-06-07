
const User = require('../models/User');
const Settings = require('../models/Settings');
const { AppError } = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');

/**
 * Get header profile data
 * @route GET /api/header/profile
 * @access Private
 */
const getProfileData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .select('name email role avatar lastActivity isOnline')
      .lean();
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Get user settings for additional profile info
    const settings = await Settings.findByUserId(userId);
    
    const profileData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: settings?.profile?.avatar || user.avatar,
      lastActivity: user.lastActivity,
      isOnline: user.isOnline,
      jobTitle: settings?.profile?.jobTitle || '',
      bio: settings?.profile?.bio || ''
    };
    
    successResponse(res, profileData, 'Profile data retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get notifications for header dropdown
 * @route GET /api/header/notifications
 * @access Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit = 5 } = req.query;
    
    // Mock notifications - in real implementation, you'd have a Notification model
    const notifications = [
      {
        id: '1',
        title: 'Policy Renewal Reminder',
        message: 'Policy #POL-2024-001234 expires in 3 days',
        type: 'warning',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        relatedEntity: { type: 'policy', id: 'POL-2024-001234' }
      },
      {
        id: '2',
        title: 'New Lead Assigned',
        message: 'You have been assigned a new lead: John Doe',
        type: 'info',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        relatedEntity: { type: 'lead', id: 'LED-2024-001456' }
      },
      {
        id: '3',
        title: 'Claim Approved',
        message: 'Claim #CLM-2024-007890 has been approved',
        type: 'success',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        relatedEntity: { type: 'claim', id: 'CLM-2024-007890' }
      }
    ];
    
    const limitedNotifications = notifications.slice(0, parseInt(limit));
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    successResponse(res, {
      notifications: limitedNotifications,
      unreadCount,
      totalCount: notifications.length
    }, 'Notifications retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages for header dropdown
 * @route GET /api/header/messages
 * @access Private
 */
const getMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit = 5 } = req.query;
    
    // Mock messages - in real implementation, you'd have a Message model
    const messages = [
      {
        id: '1',
        sender: {
          id: 'user123',
          name: 'John Client',
          avatar: null
        },
        subject: 'Policy Renewal Query',
        preview: 'Hi, I wanted to ask about my policy renewal process...',
        isRead: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        type: 'client_inquiry'
      },
      {
        id: '2',
        sender: {
          id: 'agent456',
          name: 'Sarah Agent',
          avatar: null
        },
        subject: 'New Lead Assignment',
        preview: 'I have assigned a new lead to you. Please review...',
        isRead: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        type: 'internal'
      },
      {
        id: '3',
        sender: {
          id: 'manager789',
          name: 'Mike Manager',
          avatar: null
        },
        subject: 'Monthly Report Review',
        preview: 'Please prepare the monthly report for review...',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        type: 'management'
      }
    ];
    
    const limitedMessages = messages.slice(0, parseInt(limit));
    const unreadCount = messages.filter(m => !m.isRead).length;
    
    successResponse(res, {
      messages: limitedMessages,
      unreadCount,
      totalCount: messages.length
    }, 'Messages retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * @route PUT /api/header/notifications/:id/read
 * @access Private
 */
const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // In real implementation, update notification in database
    successResponse(res, null, 'Notification marked as read', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark message as read
 * @route PUT /api/header/messages/:id/read
 * @access Private
 */
const markMessageAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // In real implementation, update message in database
    successResponse(res, null, 'Message marked as read', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfileData,
  getNotifications,
  getMessages,
  markNotificationAsRead,
  markMessageAsRead
};
