
const Settings = require('../models/Settings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get user settings
 * @route GET /api/settings
 * @access Private
 */
const getSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    let settings = await Settings.findByUserId(userId);
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.createDefaultSettings({
        userId,
        userName: req.user.name,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '',
        jobTitle: req.user.jobTitle || ''
      });
    }
    
    successResponse(res, settings, 'Settings retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Create settings for user
 * @route POST /api/settings
 * @access Private
 */
const createSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Check if settings already exist
    const existingSettings = await Settings.findByUserId(userId);
    if (existingSettings) {
      throw new AppError('Settings already exist for this user', 400);
    }
    
    const settingsData = {
      ...req.body,
      userId,
      userName: req.user.name,
      createdBy: userId,
      updatedBy: userId
    };
    
    const settings = await Settings.create(settingsData);
    
    successResponse(res, settings, 'Settings created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update settings
 * @route PUT /api/settings
 * @access Private
 */
const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    let settings = await Settings.findByUserId(userId);
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }
    
    // Update settings with provided data
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
          settings[key] = { ...settings[key], ...req.body[key] };
        } else {
          settings[key] = req.body[key];
        }
      }
    });
    
    settings.updatedBy = userId;
    settings.lastSyncedAt = new Date();
    
    const updatedSettings = await settings.save();
    
    successResponse(res, updatedSettings, 'Settings updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile settings
 * @route PUT /api/settings/profile
 * @access Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    let settings = await Settings.findByUserId(userId);
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }
    
    const updatedSettings = await settings.updateProfile(req.body);
    
    // Update user model if email or name changed
    if (req.body.email || req.body.name) {
      const updateData = {};
      if (req.body.email) updateData.email = req.body.email;
      if (req.body.name) updateData.name = req.body.name;
      
      await User.findByIdAndUpdate(userId, updateData);
    }
    
    successResponse(res, updatedSettings, 'Profile updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification settings
 * @route PUT /api/settings/notifications
 * @access Private
 */
const updateNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    let settings = await Settings.findByUserId(userId);
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }
    
    const updatedSettings = await settings.updateNotifications(req.body);
    
    successResponse(res, updatedSettings, 'Notification settings updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update security settings
 * @route PUT /api/settings/security
 * @access Private
 */
const updateSecurity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    let settings = await Settings.findByUserId(userId);
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }
    
    const updatedSettings = await settings.updateSecurity(req.body);
    
    successResponse(res, updatedSettings, 'Security settings updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update preferences
 * @route PUT /api/settings/preferences
 * @access Private
 */
const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    let settings = await Settings.findByUserId(userId);
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }
    
    const updatedSettings = await settings.updatePreferences(req.body);
    
    successResponse(res, updatedSettings, 'Preferences updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update privacy settings
 * @route PUT /api/settings/privacy
 * @access Private
 */
const updatePrivacy = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    let settings = await Settings.findByUserId(userId);
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }
    
    const updatedSettings = await settings.updatePreferences(req.body);
    
    successResponse(res, updatedSettings, 'Privacy settings updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * @route PUT /api/settings/change-password
 * @access Private
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user password
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date()
    });
    
    // Update settings with password change timestamp
    let settings = await Settings.findByUserId(userId);
    if (settings) {
      settings.security.passwordLastChanged = new Date();
      settings.updatedBy = userId;
      await settings.save();
    }
    
    successResponse(res, null, 'Password changed successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset settings to defaults
 * @route POST /api/settings/reset
 * @access Private
 */
const resetSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    let settings = await Settings.findByUserId(userId);
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }
    
    const resetSettings = await settings.resetToDefaults();
    
    successResponse(res, resetSettings, 'Settings reset to defaults successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete settings (deactivate)
 * @route DELETE /api/settings
 * @access Private
 */
const deleteSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const settings = await Settings.findByUserId(userId);
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }
    
    settings.isActive = false;
    settings.updatedBy = userId;
    await settings.save();
    
    successResponse(res, null, 'Settings deactivated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get settings statistics (Admin only)
 * @route GET /api/settings/stats
 * @access Private (Super Admin only)
 */
const getSettingsStats = async (req, res, next) => {
  try {
    const stats = await Settings.getSettingsStats();
    
    successResponse(res, stats[0] || {}, 'Settings statistics retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Export user settings
 * @route GET /api/settings/export
 * @access Private
 */
const exportSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const settings = await Settings.findByUserId(userId);
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }
    
    // Remove sensitive data
    const exportData = {
      settingsId: settings.settingsId,
      profile: settings.profile,
      notifications: settings.notifications,
      preferences: settings.preferences,
      privacy: settings.privacy,
      exportedAt: new Date().toISOString()
    };
    
    successResponse(res, exportData, 'Settings exported successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Import user settings
 * @route POST /api/settings/import
 * @access Private
 */
const importSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { settingsData } = req.body;
    
    if (!settingsData) {
      throw new AppError('Settings data is required', 400);
    }
    
    let settings = await Settings.findByUserId(userId);
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }
    
    // Import only safe settings
    const allowedFields = ['notifications', 'preferences', 'privacy'];
    allowedFields.forEach(field => {
      if (settingsData[field]) {
        settings[field] = { ...settings[field], ...settingsData[field] };
      }
    });
    
    settings.updatedBy = userId;
    settings.lastSyncedAt = new Date();
    
    const updatedSettings = await settings.save();
    
    successResponse(res, updatedSettings, 'Settings imported successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  createSettings,
  updateSettings,
  updateProfile,
  updateNotifications,
  updateSecurity,
  updatePreferences,
  updatePrivacy,
  changePassword,
  resetSettings,
  deleteSettings,
  getSettingsStats,
  exportSettings,
  importSettings
};
