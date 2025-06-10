
const { Broadcast, BroadcastRecipient } = require('../models/Broadcast');
const { Communication, LoyaltyPoints } = require('../models/Communication');
const Client = require('../models/Client');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const mongoose = require('mongoose');

class BroadcastController {
  /**
   * Get all broadcasts
   */
  async getBroadcasts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        status,
        sortField = 'createdAt',
        sortDirection = 'desc'
      } = req.query;

      const filter = {};
      
      // Role-based filtering
      if (req.user.role === 'agent') {
        filter.createdBy = req.user._id;
      }

      if (type) filter.type = type;
      if (status) filter.status = status;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const sort = {};
      sort[sortField] = sortDirection === 'desc' ? -1 : 1;

      const [broadcasts, totalCount] = await Promise.all([
        Broadcast.find(filter)
          .populate('createdBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Broadcast.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      return successResponse(res, {
        data: broadcasts,
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
   * Create new broadcast
   */
  async createBroadcast(req, res, next) {
    try {
      const broadcastData = {
        ...req.body,
        createdBy: req.user._id
      };

      const broadcast = new Broadcast(broadcastData);
      await broadcast.save();

      // If scheduled for immediate sending, process it
      if (broadcast.scheduledAt <= new Date()) {
        this.processBroadcast(broadcast._id);
      }

      return successResponse(res, {
        message: 'Broadcast created successfully',
        data: broadcast
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get eligible clients for broadcast
   */
  async getEligibleClients(req, res, next) {
    try {
      const { targetAudience, channels } = req.body;

      let clientFilter = {};

      // Role-based filtering
      if (req.user.role === 'agent') {
        clientFilter.assignedAgentId = req.user._id;
      }

      // Apply target audience filters
      if (!targetAudience.allClients) {
        const orConditions = [];

        if (targetAudience.specificClients?.length > 0) {
          orConditions.push({ _id: { $in: targetAudience.specificClients } });
        }

        if (targetAudience.clientTypes?.length > 0) {
          orConditions.push({ clientType: { $in: targetAudience.clientTypes } });
        }

        if (targetAudience.locations?.length > 0) {
          const locationConditions = targetAudience.locations.map(loc => {
            const cond = {};
            if (loc.city) cond.city = new RegExp(loc.city, 'i');
            if (loc.state) cond.state = new RegExp(loc.state, 'i');
            return cond;
          });
          orConditions.push({ $or: locationConditions });
        }

        if (orConditions.length > 0) {
          clientFilter.$or = orConditions;
        } else {
          // No valid targeting criteria
          return successResponse(res, { data: [] });
        }
      }

      // Get clients with their communication preferences
      const clients = await Client.aggregate([
        { $match: clientFilter },
        {
          $lookup: {
            from: 'loyaltypoints',
            localField: '_id',
            foreignField: 'clientId',
            as: 'loyalty'
          }
        },
        {
          $addFields: {
            tierLevel: { $ifNull: [{ $arrayElemAt: ['$loyalty.tierLevel', 0] }, 'bronze'] }
          }
        },
        {
          $match: targetAudience.tierLevels?.length > 0 ? 
            { tierLevel: { $in: targetAudience.tierLevels } } : {}
        },
        {
          $project: {
            _id: 1,
            displayName: 1,
            email: 1,
            phone: 1,
            clientType: 1,
            city: 1,
            state: 1,
            tierLevel: 1,
            communicationPreferences: 1,
            status: 1
          }
        }
      ]);

      // Filter based on communication preferences and channels
      const eligibleClients = clients.filter(client => {
        if (client.status !== 'Active') return false;

        return channels.some(channel => {
          const preferences = client.communicationPreferences?.[channel];
          return preferences?.offers !== false; // Default to opted-in if not specified
        });
      });

      return successResponse(res, {
        data: eligibleClients,
        total: eligibleClients.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update client communication preferences
   */
  async updateClientPreferences(req, res, next) {
    try {
      const { clientId } = req.params;
      const { channel, type, optIn } = req.body;

      // Validate access
      const filter = { _id: clientId };
      if (req.user.role === 'agent') {
        filter.assignedAgentId = req.user._id;
      }

      const client = await Client.findOne(filter);
      if (!client) {
        throw new AppError('Client not found or access denied', 404);
      }

      // Initialize communication preferences if not exists
      if (!client.communicationPreferences) {
        client.communicationPreferences = {};
      }
      if (!client.communicationPreferences[channel]) {
        client.communicationPreferences[channel] = {};
      }

      // Update preferences
      if (type === 'all') {
        client.communicationPreferences[channel] = {
          offers: optIn,
          newsletters: optIn,
          reminders: optIn,
          birthday: optIn,
          anniversary: optIn
        };
      } else {
        client.communicationPreferences[channel][type] = optIn;
      }

      client.markModified('communicationPreferences');
      await client.save();

      return successResponse(res, {
        message: 'Communication preferences updated successfully',
        data: client.communicationPreferences
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get broadcast statistics
   */
  async getBroadcastStats(req, res, next) {
    try {
      const { broadcastId } = req.params;

      const broadcast = await Broadcast.findById(broadcastId)
        .populate('createdBy', 'name email');

      if (!broadcast) {
        throw new AppError('Broadcast not found', 404);
      }

      // Get detailed recipient stats
      const recipientStats = await BroadcastRecipient.aggregate([
        { $match: { broadcastId: mongoose.Types.ObjectId(broadcastId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            channels: { $push: '$channel' }
          }
        }
      ]);

      const channelStats = await BroadcastRecipient.aggregate([
        { $match: { broadcastId: mongoose.Types.ObjectId(broadcastId) } },
        {
          $group: {
            _id: '$channel',
            total: { $sum: 1 },
            sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
          }
        }
      ]);

      return successResponse(res, {
        data: {
          broadcast,
          recipientStats,
          channelStats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process broadcast (background job)
   */
  async processBroadcast(broadcastId) {
    try {
      const broadcast = await Broadcast.findById(broadcastId);
      if (!broadcast || broadcast.status !== 'scheduled') return;

      broadcast.status = 'sending';
      await broadcast.save();

      // Get eligible clients
      const clients = await this.getEligibleClientsForBroadcast(broadcast);

      // Create recipient records and communications
      const recipients = [];
      const communications = [];

      for (const client of clients) {
        for (const channel of broadcast.channels) {
          // Check if client has opted in for this channel
          const preferences = client.communicationPreferences?.[channel];
          if (preferences?.offers === false) continue;

          const recipient = {
            broadcastId: broadcast._id,
            clientId: client._id,
            channel,
            status: 'pending'
          };

          const communication = {
            clientId: client._id,
            type: broadcast.type,
            channel,
            subject: broadcast.subject,
            content: this.personalizeBroadcastContent(broadcast.content, client),
            agentId: broadcast.createdBy,
            status: 'pending',
            scheduledFor: new Date()
          };

          recipients.push(recipient);
          communications.push(communication);
        }
      }

      // Batch insert
      if (recipients.length > 0) {
        await BroadcastRecipient.insertMany(recipients);
        await Communication.insertMany(communications);

        broadcast.stats.totalRecipients = recipients.length;
        broadcast.status = 'sent';
        await broadcast.save();
      }
    } catch (error) {
      console.error('Error processing broadcast:', error);
      
      const broadcast = await Broadcast.findById(broadcastId);
      if (broadcast) {
        broadcast.status = 'failed';
        await broadcast.save();
      }
    }
  }

  /**
   * Get eligible clients for broadcast processing
   */
  async getEligibleClientsForBroadcast(broadcast) {
    let clientFilter = { status: 'Active' };

    if (!broadcast.targetAudience.allClients) {
      const orConditions = [];

      if (broadcast.targetAudience.specificClients?.length > 0) {
        orConditions.push({ _id: { $in: broadcast.targetAudience.specificClients } });
      }

      if (broadcast.targetAudience.clientTypes?.length > 0) {
        orConditions.push({ clientType: { $in: broadcast.targetAudience.clientTypes } });
      }

      if (orConditions.length > 0) {
        clientFilter.$or = orConditions;
      }
    }

    return await Client.find(clientFilter);
  }

  /**
   * Personalize broadcast content
   */
  personalizeBroadcastContent(content, client) {
    let personalizedContent = content;

    // Replace placeholders
    const replacements = {
      '{{name}}': client.displayName || 'Valued Customer',
      '{{firstName}}': client.individualData?.firstName || client.corporateData?.contactPersonName || 'Customer',
      '{{email}}': client.email,
      '{{phone}}': client.phone
    };

    Object.keys(replacements).forEach(placeholder => {
      personalizedContent = personalizedContent.replace(
        new RegExp(placeholder, 'g'), 
        replacements[placeholder]
      );
    });

    return personalizedContent;
  }
}

module.exports = new BroadcastController();
