
const Activity = require('../models/Activity');
const Settings = require('../models/Settings');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get all activities - Super Admin Only
 */
const getActivities = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return errorResponse(res, 'Access denied. Super admin only.', 403);
    }

    const {
      page = 1,
      limit = 20,
      type,
      operation,
      entityType,
      userId,
      entityId,
      severity,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
      isArchived = false
    } = req.query;

    // Build query
    const query = { isArchived: isArchived === 'true' };
    
    // Apply filters
    if (type && type !== 'all') query.type = type;
    if (operation && operation !== 'all') query.operation = operation;
    if (entityType && entityType !== 'all') query.entityType = entityType;
    if (userId && userId !== 'all') query.userId = userId;
    if (entityId) query.entityId = entityId;
    if (severity && severity !== 'all') query.severity = severity;
    if (category && category !== 'all') query.category = category;

    // Date filtering
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [activities, totalCount] = await Promise.all([
      Activity.find(query)
        .populate('userId', 'firstName lastName email role')
        .populate('clientId', 'firstName lastName email phone')
        .populate('agentId', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Activity.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit)
    };

    return successResponse(res, {
      activities,
      pagination
    }, 'Activities retrieved successfully');

  } catch (error) {
    console.error('Error fetching activities:', error);
    return errorResponse(res, 'Failed to fetch activities', 500);
  }
};

/**
 * Get activity by ID - Super Admin Only
 */
const getActivityById = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return errorResponse(res, 'Access denied. Super admin only.', 403);
    }

    const { id } = req.params;

    const activity = await Activity.findById(id)
      .populate('userId', 'firstName lastName email role')
      .populate('clientId', 'firstName lastName email phone')
      .populate('agentId', 'firstName lastName email');

    if (!activity) {
      return errorResponse(res, 'Activity not found', 404);
    }

    return successResponse(res, activity, 'Activity retrieved successfully');

  } catch (error) {
    console.error('Error fetching activity:', error);
    return errorResponse(res, 'Failed to fetch activity', 500);
  }
};

/**
 * Get activity statistics - Super Admin Only
 */
const getActivityStats = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return errorResponse(res, 'Access denied. Super admin only.', 403);
    }

    const { timeframe = '24h', groupBy } = req.query;

    const stats = await Activity.getActivityStats(timeframe);
    
    // Get additional stats
    const [totalActivities, archivedCount, recentErrors] = await Promise.all([
      Activity.countDocuments({ isArchived: false }),
      Activity.countDocuments({ isArchived: true }),
      Activity.countDocuments({
        isSuccessful: false,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        isArchived: false
      })
    ]);

    const result = {
      totalActivities,
      archivedCount,
      recentErrors,
      timeframe,
      detailed: stats[0] || { total: 0, byType: [] }
    };

    return successResponse(res, result, 'Activity statistics retrieved successfully');

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return errorResponse(res, 'Failed to fetch activity statistics', 500);
  }
};

/**
 * Archive expired activities - Super Admin Only
 */
const archiveExpiredActivities = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return errorResponse(res, 'Access denied. Super admin only.', 403);
    }

    const archivedCount = await Activity.archiveExpiredActivities();

    return successResponse(res, { 
      archivedCount 
    }, `${archivedCount} activities archived successfully`);

  } catch (error) {
    console.error('Error archiving activities:', error);
    return errorResponse(res, 'Failed to archive activities', 500);
  }
};

/**
 * Get activity settings - Super Admin Only
 */
const getActivitySettings = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return errorResponse(res, 'Access denied. Super admin only.', 403);
    }

    const settings = await Settings.find({ category: 'activity' });

    return successResponse(res, settings, 'Activity settings retrieved successfully');

  } catch (error) {
    console.error('Error fetching activity settings:', error);
    return errorResponse(res, 'Failed to fetch activity settings', 500);
  }
};

/**
 * Update activity settings - Super Admin Only
 */
const updateActivitySettings = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return errorResponse(res, 'Access denied. Super admin only.', 403);
    }

    const { key, value } = req.body;

    const setting = await Settings.setValue(key, value, req.user._id);
    
    if (!setting) {
      return errorResponse(res, 'Setting not found or not editable', 404);
    }

    return successResponse(res, setting, 'Activity setting updated successfully');

  } catch (error) {
    console.error('Error updating activity setting:', error);
    return errorResponse(res, 'Failed to update activity setting', 500);
  }
};

/**
 * Search activities - Super Admin Only
 */
const searchActivities = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return errorResponse(res, 'Access denied. Super admin only.', 403);
    }

    const { query: searchQuery } = req.params;
    const { limit = 50 } = req.query;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return errorResponse(res, 'Search query must be at least 2 characters long', 400);
    }

    const activities = await Activity.find({
      $text: { $search: searchQuery },
      isArchived: false
    })
      .populate('userId', 'firstName lastName email')
      .populate('clientId', 'firstName lastName')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    return successResponse(res, activities, 'Search completed successfully');

  } catch (error) {
    console.error('Error searching activities:', error);
    return errorResponse(res, 'Failed to search activities', 500);
  }
};

/**
 * Get unique filter values - Super Admin Only
 */
const getFilterValues = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return errorResponse(res, 'Access denied. Super admin only.', 403);
    }

    const [types, operations, entityTypes, severities, categories, users] = await Promise.all([
      Activity.distinct('type', { isArchived: false }),
      Activity.distinct('operation', { isArchived: false }),
      Activity.distinct('entityType', { isArchived: false }),
      Activity.distinct('severity', { isArchived: false }),
      Activity.distinct('category', { isArchived: false }),
      Activity.aggregate([
        { $match: { isArchived: false } },
        { $group: { _id: '$userId', userName: { $first: '$userName' } } },
        { $project: { userId: '$_id', userName: 1, _id: 0 } }
      ])
    ]);

    const filterValues = {
      types: types.sort(),
      operations: operations.sort(),
      entityTypes: entityTypes.sort(),
      severities: severities.sort(),
      categories: categories.sort(),
      users: users.sort((a, b) => a.userName.localeCompare(b.userName))
    };

    return successResponse(res, filterValues, 'Filter values retrieved successfully');

  } catch (error) {
    console.error('Error fetching filter values:', error);
    return errorResponse(res, 'Failed to fetch filter values', 500);
  }
};

module.exports = {
  getActivities,
  getActivityById,
  getActivityStats,
  archiveExpiredActivities,
  getActivitySettings,
  updateActivitySettings,
  searchActivities,
  getFilterValues
};
