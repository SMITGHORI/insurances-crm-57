
const Interaction = require('../models/Interaction');
const FollowUp = require('../models/FollowUp');
const Client = require('../models/Client');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { uploadFile, deleteFile } = require('../utils/fileHandler');
const mongoose = require('mongoose');

class InteractionController {
  /**
   * Get all interactions with filtering and pagination
   */
  async getAllInteractions(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        clientId,
        type,
        outcome,
        priority,
        startDate,
        endDate,
        search,
        sortField = 'interactionDate',
        sortDirection = 'desc'
      } = req.query;

      // Build filter object
      const filter = {};
      
      // Role-based filtering
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      if (clientId) filter.clientId = clientId;
      if (type) filter.type = type;
      if (outcome) filter.outcome = outcome;
      if (priority) filter.priority = priority;

      // Date range filter
      if (startDate || endDate) {
        filter.interactionDate = {};
        if (startDate) filter.interactionDate.$gte = new Date(startDate);
        if (endDate) filter.interactionDate.$lte = new Date(endDate);
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

      // Execute query
      const [interactions, totalCount] = await Promise.all([
        Interaction.find(filter)
          .populate('clientId', 'displayName email phone clientType')
          .populate('policyId', 'policyNumber type status')
          .populate('agentId', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Interaction.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limitNum);

      return successResponse(res, {
        data: interactions,
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
   * Get interaction by ID
   */
  async getInteractionById(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid interaction ID', 400);
      }

      const filter = { _id: id };
      
      // Role-based access control
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      const interaction = await Interaction.findOne(filter)
        .populate('clientId', 'displayName email phone clientType')
        .populate('policyId', 'policyNumber type status')
        .populate('agentId', 'name email')
        .lean();

      if (!interaction) {
        throw new AppError('Interaction not found or access denied', 404);
      }

      return successResponse(res, { data: interaction });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new interaction
   */
  async createInteraction(req, res, next) {
    try {
      const interactionData = {
        ...req.body,
        agentId: req.user._id
      };

      // Validate client exists
      const client = await Client.findById(interactionData.clientId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }

      const interaction = new Interaction(interactionData);
      await interaction.save();

      // If follow-up is required, create follow-up record
      if (interaction.followUpRequired && interaction.followUpDate) {
        const followUpData = {
          clientId: interaction.clientId,
          policyId: interaction.policyId,
          agentId: interaction.agentId,
          interactionId: interaction._id,
          title: `Follow-up: ${interaction.subject}`,
          description: interaction.followUpNotes || interaction.description,
          type: interaction.type,
          priority: interaction.priority,
          scheduledDate: interaction.followUpDate,
          scheduledTime: '10:00' // Default time, can be customized
        };

        const followUp = new FollowUp(followUpData);
        await followUp.save();
      }

      await interaction.populate([
        { path: 'clientId', select: 'displayName email phone' },
        { path: 'agentId', select: 'name email' }
      ]);

      return successResponse(res, {
        message: 'Interaction created successfully',
        data: interaction
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update interaction
   */
  async updateInteraction(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid interaction ID', 400);
      }

      const filter = { _id: id };
      
      // Role-based access control
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      const interaction = await Interaction.findOne(filter);
      
      if (!interaction) {
        throw new AppError('Interaction not found or access denied', 404);
      }

      // Update fields
      Object.keys(req.body).forEach(key => {
        if (key !== '_id' && key !== 'interactionId' && key !== 'agentId') {
          interaction[key] = req.body[key];
        }
      });

      await interaction.save();

      return successResponse(res, {
        message: 'Interaction updated successfully',
        data: interaction
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete interaction
   */
  async deleteInteraction(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid interaction ID', 400);
      }

      const interaction = await Interaction.findById(id);
      
      if (!interaction) {
        throw new AppError('Interaction not found', 404);
      }

      // Delete associated attachments
      for (const attachment of interaction.attachments) {
        await deleteFile(attachment.fileUrl);
      }

      await Interaction.findByIdAndDelete(id);

      return successResponse(res, {
        message: 'Interaction deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get interactions by client
   */
  async getInteractionsByClient(req, res, next) {
    try {
      const { clientId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(clientId)) {
        throw new AppError('Invalid client ID', 400);
      }

      const filter = { clientId };
      
      // Role-based access control
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      const interactions = await Interaction.find(filter)
        .populate('agentId', 'name email')
        .populate('policyId', 'policyNumber type')
        .sort({ interactionDate: -1 })
        .lean();

      return successResponse(res, {
        data: interactions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload interaction attachment
   */
  async uploadAttachment(req, res, next) {
    try {
      const { id } = req.params;

      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid interaction ID', 400);
      }

      const filter = { _id: id };
      
      // Role-based access control
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      const interaction = await Interaction.findOne(filter);
      
      if (!interaction) {
        throw new AppError('Interaction not found or access denied', 404);
      }

      // Upload file
      const fileUrl = await uploadFile(req.file, 'interactions');

      // Add attachment to interaction
      const attachmentData = {
        fileName: req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      };

      interaction.attachments.push(attachmentData);
      await interaction.save();

      return successResponse(res, {
        message: 'Attachment uploaded successfully',
        data: attachmentData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get interaction statistics
   */
  async getInteractionStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      const filter = {};
      
      // Role-based filtering
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      // Date range filter
      if (startDate || endDate) {
        filter.interactionDate = {};
        if (startDate) filter.interactionDate.$gte = new Date(startDate);
        if (endDate) filter.interactionDate.$lte = new Date(endDate);
      }

      const stats = await Interaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalInteractions: { $sum: 1 },
            byType: {
              $push: {
                type: '$type',
                outcome: '$outcome'
              }
            },
            averageDuration: { $avg: '$duration' },
            followUpsRequired: {
              $sum: { $cond: ['$followUpRequired', 1, 0] }
            }
          }
        },
        {
          $project: {
            totalInteractions: 1,
            averageDuration: { $round: ['$averageDuration', 2] },
            followUpsRequired: 1,
            typeBreakdown: {
              $reduce: {
                input: '$byType',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [[{
                        k: '$$this.type',
                        v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.type', input: '$$value' } }, 0] }, 1] }
                      }]]
                    }
                  ]
                }
              }
            }
          }
        }
      ]);

      return successResponse(res, {
        data: stats[0] || {
          totalInteractions: 0,
          averageDuration: 0,
          followUpsRequired: 0,
          typeBreakdown: {}
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InteractionController();
