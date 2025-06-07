
const Activity = require('../models/Activity');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get all activities with filtering and pagination
 */
const getActivities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      entityType,
      agentId,
      clientId,
      userId,
      entityId,
      priority,
      status = 'active',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFilter,
      startDate,
      endDate,
      isRecent,
      tags
    } = req.query;

    // Build query
    const query = {};
    
    // Basic filters
    if (type && type !== 'all') query.type = type;
    if (entityType && entityType !== 'all') query.entityType = entityType;
    if (agentId && agentId !== 'all') query.agentId = agentId;
    if (clientId && clientId !== 'all') query.clientId = clientId;
    if (userId && userId !== 'all') query.userId = userId;
    if (entityId) query.entityId = entityId;
    if (priority && priority !== 'all') query.priority = priority;
    if (status && status !== 'all') query.status = status;
    
    // Default visibility filter
    query.isVisible = true;

    // Date filtering
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      let dateFrom;
      
      switch (dateFilter) {
        case 'today':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          query.createdAt = {
            $gte: dateFrom,
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          };
          break;
        case 'last7days':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last90days':
          dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }
      
      if (dateFrom && dateFilter !== 'yesterday') {
        query.createdAt = { $gte: dateFrom };
      }
    }

    // Custom date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Recent filter (last 24 hours)
    if (isRecent === 'true') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: oneDayAgo };
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Role-based access control
    const userRole = req.user.role;
    if (userRole === 'agent') {
      // Agents can only see their own activities and activities of their clients
      query.$or = [
        { agentId: req.user._id },
        { userId: req.user._id }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [activities, totalCount] = await Promise.all([
      Activity.find(query)
        .populate('agentId', 'firstName lastName email')
        .populate('userId', 'firstName lastName email')
        .populate('clientId', 'firstName lastName email phone')
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
 * Get activity by ID
 */
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id)
      .populate('agentId', 'firstName lastName email')
      .populate('userId', 'firstName lastName email')
      .populate('clientId', 'firstName lastName email phone');

    if (!activity) {
      return errorResponse(res, 'Activity not found', 404);
    }

    // Role-based access control
    const userRole = req.user.role;
    if (userRole === 'agent') {
      if (activity.agentId.toString() !== req.user._id.toString() && 
          activity.userId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 'Access denied', 403);
      }
    }

    return successResponse(res, activity, 'Activity retrieved successfully');

  } catch (error) {
    console.error('Error fetching activity:', error);
    return errorResponse(res, 'Failed to fetch activity', 500);
  }
};

/**
 * Create new activity
 */
const createActivity = async (req, res) => {
  try {
    const activityData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    // Auto-populate user info if not provided
    if (!activityData.userId) {
      activityData.userId = req.user._id;
      activityData.userName = `${req.user.firstName} ${req.user.lastName}`;
    }

    // Add IP address and user agent to metadata
    if (!activityData.metadata) {
      activityData.metadata = {};
    }
    activityData.metadata.ipAddress = req.ip;
    activityData.metadata.userAgent = req.get('User-Agent');

    const activity = new Activity(activityData);
    await activity.save();

    const populatedActivity = await Activity.findById(activity._id)
      .populate('agentId', 'firstName lastName email')
      .populate('userId', 'firstName lastName email')
      .populate('clientId', 'firstName lastName email phone');

    return successResponse(res, populatedActivity, 'Activity created successfully', 201);

  } catch (error) {
    console.error('Error creating activity:', error);
    if (error.name === 'ValidationError') {
      return errorResponse(res, 'Validation error', 400, error.errors);
    }
    return errorResponse(res, 'Failed to create activity', 500);
  }
};

/**
 * Update activity
 */
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const activity = await Activity.findById(id);
    if (!activity) {
      return errorResponse(res, 'Activity not found', 404);
    }

    // Role-based access control
    const userRole = req.user.role;
    if (userRole === 'agent') {
      if (activity.agentId.toString() !== req.user._id.toString() && 
          activity.userId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 'Access denied', 403);
      }
    }

    // Prevent changing critical fields
    delete updateData.activityId;
    delete updateData.entityType;
    delete updateData.entityId;
    delete updateData.createdBy;
    delete updateData.createdAt;

    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('agentId', 'firstName lastName email')
     .populate('userId', 'firstName lastName email')
     .populate('clientId', 'firstName lastName email phone');

    return successResponse(res, updatedActivity, 'Activity updated successfully');

  } catch (error) {
    console.error('Error updating activity:', error);
    if (error.name === 'ValidationError') {
      return errorResponse(res, 'Validation error', 400, error.errors);
    }
    return errorResponse(res, 'Failed to update activity', 500);
  }
};

/**
 * Delete activity (soft delete by hiding)
 */
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      return errorResponse(res, 'Activity not found', 404);
    }

    // Role-based access control - only managers and super admins can delete
    const userRole = req.user.role;
    if (!['manager', 'super_admin'].includes(userRole)) {
      return errorResponse(res, 'Access denied', 403);
    }

    // Soft delete by hiding the activity
    activity.isVisible = false;
    activity.status = 'hidden';
    activity.updatedBy = req.user._id;
    await activity.save();

    return successResponse(res, null, 'Activity deleted successfully');

  } catch (error) {
    console.error('Error deleting activity:', error);
    return errorResponse(res, 'Failed to delete activity', 500);
  }
};

/**
 * Get activity statistics
 */
const getActivityStats = async (req, res) => {
  try {
    const { agentId, startDate, endDate, period = 'last30days', groupBy } = req.query;

    // Build match query
    const matchQuery = {
      status: 'active',
      isVisible: true
    };

    // Role-based access control
    const userRole = req.user.role;
    if (userRole === 'agent') {
      matchQuery.$or = [
        { agentId: req.user._id },
        { userId: req.user._id }
      ];
    } else if (agentId) {
      matchQuery.agentId = mongoose.Types.ObjectId(agentId);
    }

    // Date filtering
    if (period !== 'custom') {
      const now = new Date();
      let dateFrom;
      
      switch (period) {
        case 'today':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          matchQuery.createdAt = {
            $gte: dateFrom,
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          };
          break;
        case 'last7days':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last90days':
          dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }
      
      if (dateFrom && period !== 'yesterday') {
        matchQuery.createdAt = { $gte: dateFrom };
      }
    } else if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Basic stats aggregation
    const basicStats = await Activity.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byType: {
            $push: {
              type: '$type',
              priority: '$priority'
            }
          }
        }
      },
      {
        $unwind: '$byType'
      },
      {
        $group: {
          _id: '$byType.type',
          count: { $sum: 1 },
          highPriority: {
            $sum: {
              $cond: [
                { $in: ['$byType.priority', ['high', 'critical']] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Recent activities (last 24 hours)
    const recentActivities = await Activity.countDocuments({
      ...matchQuery,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Group by specific field if requested
    let groupedStats = null;
    if (groupBy) {
      groupedStats = await Activity.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: `$${groupBy}`,
            count: { $sum: 1 },
            types: { $addToSet: '$type' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
    }

    const stats = {
      total: basicStats.reduce((sum, item) => sum + item.count, 0),
      recent: recentActivities,
      byType: basicStats.map(item => ({
        type: item._id,
        count: item.count,
        highPriority: item.highPriority
      })),
      period,
      groupedBy: groupBy ? {
        field: groupBy,
        data: groupedStats
      } : null
    };

    return successResponse(res, stats, 'Activity statistics retrieved successfully');

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return errorResponse(res, 'Failed to fetch activity statistics', 500);
  }
};

/**
 * Search activities
 */
const searchActivities = async (req, res) => {
  try {
    const { query: searchQuery } = req.params;
    const { limit = 10, type, agentId } = req.query;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return errorResponse(res, 'Search query must be at least 2 characters long', 400);
    }

    // Build search query
    const query = {
      $text: { $search: searchQuery },
      status: 'active',
      isVisible: true
    };

    // Additional filters
    if (type && type !== 'all') query.type = type;
    if (agentId && agentId !== 'all') query.agentId = agentId;

    // Role-based access control
    const userRole = req.user.role;
    if (userRole === 'agent') {
      query.$or = [
        { agentId: req.user._id },
        { userId: req.user._id }
      ];
    }

    const activities = await Activity.find(query)
      .populate('agentId', 'firstName lastName')
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
 * Bulk actions on activities
 */
const bulkActions = async (req, res) => {
  try {
    const { activityIds, action, value } = req.body;

    if (!activityIds || activityIds.length === 0) {
      return errorResponse(res, 'No activity IDs provided', 400);
    }

    // Role-based access control
    const userRole = req.user.role;
    let accessQuery = { _id: { $in: activityIds } };
    
    if (userRole === 'agent') {
      accessQuery.$or = [
        { agentId: req.user._id },
        { userId: req.user._id }
      ];
    }

    const activities = await Activity.find(accessQuery);
    
    if (activities.length !== activityIds.length) {
      return errorResponse(res, 'Some activities not found or access denied', 403);
    }

    let updateQuery = { updatedBy: req.user._id };

    switch (action) {
      case 'archive':
        updateQuery.status = 'archived';
        break;
      case 'hide':
        updateQuery.isVisible = false;
        break;
      case 'show':
        updateQuery.isVisible = true;
        break;
      case 'delete':
        if (!['manager', 'super_admin'].includes(userRole)) {
          return errorResponse(res, 'Access denied for delete operation', 403);
        }
        updateQuery.status = 'hidden';
        updateQuery.isVisible = false;
        break;
      case 'addTag':
        await Activity.updateMany(
          { _id: { $in: activityIds } },
          { 
            $addToSet: { tags: value },
            $set: { updatedBy: req.user._id }
          }
        );
        break;
      case 'removeTag':
        await Activity.updateMany(
          { _id: { $in: activityIds } },
          { 
            $pull: { tags: value },
            $set: { updatedBy: req.user._id }
          }
        );
        break;
      case 'changePriority':
        updateQuery.priority = value;
        break;
      default:
        return errorResponse(res, 'Invalid bulk action', 400);
    }

    if (!['addTag', 'removeTag'].includes(action)) {
      await Activity.updateMany(
        { _id: { $in: activityIds } },
        updateQuery
      );
    }

    return successResponse(res, { 
      affected: activityIds.length,
      action,
      value 
    }, `Bulk ${action} completed successfully`);

  } catch (error) {
    console.error('Error performing bulk action:', error);
    return errorResponse(res, 'Failed to perform bulk action', 500);
  }
};

module.exports = {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityStats,
  searchActivities,
  bulkActions
};
