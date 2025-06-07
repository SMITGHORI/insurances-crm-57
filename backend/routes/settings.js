
const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { validationMiddleware } = require('../middleware/validation');

// Import validation schemas
const {
  createSettingsSchema,
  updateSettingsSchema,
  changePasswordSchema,
  updateProfileSchema,
  updateNotificationsSchema,
  updateSecuritySchema,
  updatePreferencesSchema,
  updatePrivacySchema
} = require('../validations/settingsValidation');

// Import controllers
const {
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
} = require('../controllers/settingsController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/settings
 * @desc    Get user settings
 * @access  Private (All authenticated users)
 */
router.get('/',
  getSettings
);

/**
 * @route   POST /api/settings
 * @desc    Create settings for user
 * @access  Private (All authenticated users)
 * @body    Settings data according to createSettingsSchema
 */
router.post('/',
  validationMiddleware(createSettingsSchema),
  createSettings
);

/**
 * @route   PUT /api/settings
 * @desc    Update user settings
 * @access  Private (All authenticated users)
 * @body    Settings update data according to updateSettingsSchema
 */
router.put('/',
  validationMiddleware(updateSettingsSchema),
  updateSettings
);

/**
 * @route   PUT /api/settings/profile
 * @desc    Update profile settings
 * @access  Private (All authenticated users)
 * @body    Profile data according to updateProfileSchema
 */
router.put('/profile',
  validationMiddleware(updateProfileSchema),
  updateProfile
);

/**
 * @route   PUT /api/settings/notifications
 * @desc    Update notification settings
 * @access  Private (All authenticated users)
 * @body    Notification settings according to updateNotificationsSchema
 */
router.put('/notifications',
  validationMiddleware(updateNotificationsSchema),
  updateNotifications
);

/**
 * @route   PUT /api/settings/security
 * @desc    Update security settings
 * @access  Private (All authenticated users)
 * @body    Security settings according to updateSecuritySchema
 */
router.put('/security',
  validationMiddleware(updateSecuritySchema),
  updateSecurity
);

/**
 * @route   PUT /api/settings/preferences
 * @desc    Update user preferences
 * @access  Private (All authenticated users)
 * @body    Preferences according to updatePreferencesSchema
 */
router.put('/preferences',
  validationMiddleware(updatePreferencesSchema),
  updatePreferences
);

/**
 * @route   PUT /api/settings/privacy
 * @desc    Update privacy settings
 * @access  Private (All authenticated users)
 * @body    Privacy settings according to updatePrivacySchema
 */
router.put('/privacy',
  validationMiddleware(updatePrivacySchema),
  updatePrivacy
);

/**
 * @route   PUT /api/settings/change-password
 * @desc    Change user password
 * @access  Private (All authenticated users)
 * @body    Password data according to changePasswordSchema
 */
router.put('/change-password',
  validationMiddleware(changePasswordSchema),
  changePassword
);

/**
 * @route   POST /api/settings/reset
 * @desc    Reset settings to defaults
 * @access  Private (All authenticated users)
 */
router.post('/reset',
  resetSettings
);

/**
 * @route   DELETE /api/settings
 * @desc    Delete/deactivate settings
 * @access  Private (All authenticated users)
 */
router.delete('/',
  deleteSettings
);

/**
 * @route   GET /api/settings/stats
 * @desc    Get settings statistics
 * @access  Private (Super Admin only)
 */
router.get('/stats',
  roleMiddleware(['super_admin']),
  getSettingsStats
);

/**
 * @route   GET /api/settings/export
 * @desc    Export user settings
 * @access  Private (All authenticated users)
 */
router.get('/export',
  exportSettings
);

/**
 * @route   POST /api/settings/import
 * @desc    Import user settings
 * @access  Private (All authenticated users)
 * @body    { settingsData: object }
 */
router.post('/import',
  importSettings
);

module.exports = router;
