
const FollowUp = require('../models/FollowUp');
const Interaction = require('../models/Interaction');
const Client = require('../models/Client');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const mongoose = require('mongoose');

class FollowUpController {
  /**
   * Get all follow-ups with filtering and pagination
   */
  async getAllFollowUps(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        clientId,
        status = 'scheduled',
        priority,
        type,
        startDate,
        endDate,
        search,
        sortField = 'scheduledDate',
        sortDirection = 'asc'
      } = req.query;

      // Build filter object
      const filter = {};
      
      // Role-based filtering
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      if (clientId) filter.clientId = clientId;
      if (status !== 'all') filter.status = status;
      if (priority) filter.priority = priority;
      if (type) filter.type = type;

      // Date range filter
      if (startDate || endDate) {
        filter.scheduledDate = {};
        if (startDate) filter.scheduledDate.$gte = new Date(startDate);
        if (endDate) filter.scheduledDate.$lte = new Date(endDate);
      }

      // Search functionality
      if (search) {
        filter.$text = { $search: search };
      }

      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Sorting
      const sort = {};
      sort[sortField] = sortDirection === 'desc' ? -1 : 1;
      
      // Secondary sort by time for same-day follow-ups
      if (sortField === 'scheduledDate') {
        sort.scheduledTime = 1;
      }

      // Execute query
      const [followUps, totalCount] = await Promise.all([
        FollowUp.find(filter)
          .populate('clientId', 'displayName email phone clientType')
          .populate('policyId', 'policyNumber type status')
          .populate('agentId', 'name email')
          .populate('interactionId', 'subject type')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        FollowUp.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limitNum);

      return successResponse(res, {
        data: followUps,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get follow-up by ID
   */
  async getFollowUpById(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid follow-up ID', 400);
      }

      const filter = { _id: id };
      
      // Role-based access control
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      const followUp = await FollowUp.findOne(filter)
        .populate('clientId', 'displayName email phone clientType')
        .populate('policyId', 'policyNumber type status')
        .populate('agentId', 'name email')
        .populate('interactionId', 'subject type outcome')
        .lean();

      if (!followUp) {
        throw new AppError('Follow-up not found or access denied', 404);
      }

      return successResponse(res, { data: followUp });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new follow-up
   */
  async createFollowUp(req, res, next) {
    try {
      const followUpData = {
        ...req.body,
        agentId: req.user._id
      };

      // Validate client exists
      const client = await Client.findById(followUpData.clientId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }

      // Validate scheduled datetime is in the future
      const scheduledDateTime = new Date(`${followUpData.scheduledDate}T${followUpData.scheduledTime}`);
      if (scheduledDateTime <= new Date()) {
        throw new AppError('Scheduled date and time must be in the future', 400);
      }

      const followUp = new FollowUp(followUpData);
      await followUp.save();

      await followUp.populate([
        { path: 'clientId', select: 'displayName email phone' },
        { path: 'agentId', select: 'name email' }
      ]);

      return successResponse(res, {
        message: 'Follow-up scheduled successfully',
        data: followUp
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update follow-up
   */
  async updateFollowUp(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid follow-up ID', 400);
      }

      const filter = { _id: id };
      
      // Role-based access control
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      const followUp = await FollowUp.findOne(filter);
      
      if (!followUp) {
        throw new AppError('Follow-up not found or access denied', 404);
      }

      // Update fields
      Object.keys(req.body).forEach(key => {
        if (key !== '_id' && key !== 'followUpId' && key !== 'agentId') {
          followUp[key] = req.body[key];
        }
      });

      // If status is being updated to completed, set completion date
      if (req.body.status === 'completed' && followUp.status !== 'completed') {
        followUp.completedDate = new Date();
      }

      await followUp.save();

      return successResponse(res, {
        message: 'Follow-up updated successfully',
        data: followUp
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete follow-up
   */
  async completeFollowUp(req, res, next) {
    try {
      const { id } = req.params;
      const { outcome, completionNotes, nextFollowUpDate } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid follow-up ID', 400);
      }

      const filter = { _id: id };
      
      // Role-based access control
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      const followUp = await FollowUp.findOne(filter);
      
      if (!followUp) {
        throw new AppError('Follow-up not found or access denied', 404);
      }

      if (followUp.status === 'completed') {
        throw new AppError('Follow-up is already completed', 400);
      }

      // Update follow-up status
      followUp.status = 'completed';
      followUp.completedDate = new Date();
      followUp.outcome = outcome;
      followUp.completionNotes = completionNotes;
      followUp.nextFollowUpDate = nextFollowUpDate;

      await followUp.save();

      // Create interaction record for this follow-up
      const interactionData = {
        clientId: followUp.clientId,
        policyId: followUp.policyId,
        agentId: followUp.agentId,
        type: followUp.type,
        subject: `Follow-up: ${followUp.title}`,
        description: completionNotes || followUp.description,
        outcome: outcome === 'successful' ? 'positive' : 
                outcome === 'not_interested' ? 'negative' : 'neutral',
        priority: followUp.priority,
        interactionDate: new Date(),
        notes: `Completed follow-up: ${followUp.followUpId}`,
        followUpRequired: outcome === 'follow_up_needed',
        followUpDate: nextFollowUpDate,
        status: nextFollowUpDate ? 'follow_up_scheduled' : 'completed'
      };

      const interaction = new Interaction(interactionData);
      await interaction.save();

      // If another follow-up is needed, create it
      if (outcome === 'follow_up_needed' && nextFollowUpDate) {
        const nextFollowUpData = {
          clientId: followUp.clientId,
          policyId: followUp.policyId,
          agentId: followUp.agentId,
          interactionId: interaction._id,
          title: `Follow-up: ${followUp.title}`,
          description: followUp.description,
          type: followUp.type,
          priority: followUp.priority,
          scheduledDate: nextFollowUpDate,
          scheduledTime: followUp.scheduledTime
        };

        const nextFollowUp = new FollowUp(nextFollowUpData);
        await nextFollowUp.save();
      }

      return successResponse(res, {
        message: 'Follow-up completed successfully',
        data: followUp
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get follow-ups due today
   */
  async getTodaysFollowUps(req, res, next) {
    try {
      const agentId = req.user.role === 'agent' ? req.user._id : null;
      
      const followUps = await FollowUp.findDueToday(agentId);

      return successResponse(res, {
        data: followUps
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get overdue follow-ups
   */
  async getOverdueFollowUps(req, res, next) {
    try {
      const agentId = req.user.role === 'agent' ? req.user._id : null;
      
      const followUps = await FollowUp.findOverdue(agentId);

      return successResponse(res, {
        data: followUps
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get follow-up statistics
   */
  async getFollowUpStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      const filter = {};
      
      // Role-based filtering
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      // Date range filter
      if (startDate || endDate) {
        filter.scheduledDate = {};
        if (startDate) filter.scheduledDate.$gte = new Date(startDate);
        if (endDate) filter.scheduledDate.$lte = new Date(endDate);
      }

      const [stats, todayCount, overdueCount] = await Promise.all([
        FollowUp.aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              totalFollowUps: { $sum: 1 },
              completedFollowUps: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              },
              scheduledFollowUps: {
                $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
              },
              cancelledFollowUps: {
                $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
              },
              averageDuration: { $avg: '$duration' },
              byType: {
                $push: '$type'
              },
              byOutcome: {
                $push: '$outcome'
              }
            }
          }
        ]),
        FollowUp.findDueToday(req.user.role === 'agent' ? req.user._id : null).countDocuments(),
        FollowUp.findOverdue(req.user.role === 'agent' ? req.user._id : null).countDocuments()
      ]);

      const result = stats[0] || {
        totalFollowUps: 0,
        completedFollowUps: 0,
        scheduledFollowUps: 0,
        cancelledFollowUps: 0,
        averageDuration: 0,
        byType: [],
        byOutcome: []
      };

      result.todayCount = todayCount;
      result.overdueCount = overdueCount;
      result.completionRate = result.totalFollowUps > 0 
        ? Math.round((result.completedFollowUps / result.totalFollowUps) * 100) 
        : 0;

      return successResponse(res, {
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FollowUpController();
