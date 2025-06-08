
const { Communication, LoyaltyPoints, Offer, AutomationRule, Template } = require('../models/Communication');
const Client = require('../models/Client');
const Policy = require('../models/Policy');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const mongoose = require('mongoose');

class CommunicationController {
  /**
   * Get all communications for an agent
   */
  async getCommunications(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        status,
        channel,
        clientId,
        sortField = 'createdAt',
        sortDirection = 'desc'
      } = req.query;

      const filter = {};
      
      // Role-based filtering
      if (req.user.role === 'agent') {
        filter.agentId = req.user._id;
      }

      if (type) filter.type = type;
      if (status) filter.status = status;
      if (channel) filter.channel = channel;
      if (clientId) filter.clientId = clientId;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const sort = {};
      sort[sortField] = sortDirection === 'desc' ? -1 : 1;

      const [communications, totalCount] = await Promise.all([
        Communication.find(filter)
          .populate('clientId', 'displayName email phone clientType')
          .populate('policyId', 'policyNumber type')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Communication.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      return successResponse(res, {
        data: communications,
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
   * Send manual communication
   */
  async sendCommunication(req, res, next) {
    try {
      const {
        clientId,
        policyId,
        type,
        channel,
        subject,
        content,
        scheduledFor
      } = req.body;

      // Validate client exists and agent has access
      const filter = { _id: clientId };
      if (req.user.role === 'agent') {
        filter.assignedAgentId = req.user._id;
      }

      const client = await Client.findOne(filter);
      if (!client) {
        throw new AppError('Client not found or access denied', 404);
      }

      // Create communication record
      const communication = new Communication({
        clientId,
        policyId,
        type,
        channel,
        subject,
        content,
        agentId: req.user._id,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
        status: scheduledFor ? 'pending' : 'sent'
      });

      await communication.save();

      // Here you would integrate with actual email/WhatsApp/SMS services
      // For now, we'll mark as sent
      if (!scheduledFor) {
        communication.sentAt = new Date();
        communication.status = 'sent';
        await communication.save();
      }

      return successResponse(res, {
        message: 'Communication scheduled successfully',
        data: communication
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get client loyalty points
   */
  async getLoyaltyPoints(req, res, next) {
    try {
      const { clientId } = req.params;

      // Validate access
      const filter = { _id: clientId };
      if (req.user.role === 'agent') {
        filter.assignedAgentId = req.user._id;
      }

      const client = await Client.findOne(filter);
      if (!client) {
        throw new AppError('Client not found or access denied', 404);
      }

      let loyaltyPoints = await LoyaltyPoints.findOne({ clientId });
      if (!loyaltyPoints) {
        loyaltyPoints = new LoyaltyPoints({ clientId });
        await loyaltyPoints.save();
      }

      return successResponse(res, { data: loyaltyPoints });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update client loyalty points
   */
  async updateLoyaltyPoints(req, res, next) {
    try {
      const { clientId } = req.params;
      const { points, reason, transactionType, policyId } = req.body;

      // Validate access
      const filter = { _id: clientId };
      if (req.user.role === 'agent') {
        filter.assignedAgentId = req.user._id;
      }

      const client = await Client.findOne(filter);
      if (!client) {
        throw new AppError('Client not found or access denied', 404);
      }

      let loyaltyPoints = await LoyaltyPoints.findOne({ clientId });
      if (!loyaltyPoints) {
        loyaltyPoints = new LoyaltyPoints({ clientId });
      }

      // Add transaction to history
      const transaction = {
        transactionType,
        points,
        reason,
        policyId,
        agentId: req.user._id,
        date: new Date()
      };

      if (transactionType === 'earned') {
        transaction.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      }

      loyaltyPoints.pointsHistory.push(transaction);

      // Update totals
      if (transactionType === 'earned') {
        loyaltyPoints.totalPoints += points;
        loyaltyPoints.availablePoints += points;
      } else if (transactionType === 'redeemed') {
        loyaltyPoints.availablePoints = Math.max(0, loyaltyPoints.availablePoints - points);
      }

      await loyaltyPoints.save();

      // Update tier
      await LoyaltyPoints.updateTier(clientId);

      // Send notification about points update
      const communication = new Communication({
        clientId,
        policyId,
        type: 'points',
        channel: 'email',
        subject: 'Loyalty Points Update',
        content: `Your loyalty points have been updated. ${transactionType === 'earned' ? 'Earned' : 'Redeemed'}: ${points} points. Reason: ${reason}`,
        agentId: req.user._id,
        status: 'sent',
        sentAt: new Date()
      });

      await communication.save();

      return successResponse(res, {
        message: 'Loyalty points updated successfully',
        data: loyaltyPoints
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active offers
   */
  async getOffers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        applicableProduct,
        isActive = true
      } = req.query;

      const filter = { isActive };
      if (type) filter.type = type;
      if (applicableProduct) filter.applicableProducts = applicableProduct;

      // Only show current and future offers
      filter.validUntil = { $gte: new Date() };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const [offers, totalCount] = await Promise.all([
        Offer.find(filter)
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Offer.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      return successResponse(res, {
        data: offers,
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
   * Create new offer
   */
  async createOffer(req, res, next) {
    try {
      const offerData = {
        ...req.body,
        createdBy: req.user._id
      };

      const offer = new Offer(offerData);
      await offer.save();

      // Trigger offer notifications based on target audience
      this.triggerOfferNotifications(offer._id);

      return successResponse(res, {
        message: 'Offer created successfully',
        data: offer
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get automation rules
   */
  async getAutomationRules(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        isActive,
        sortField = 'createdAt',
        sortDirection = 'desc'
      } = req.query;

      const filter = {};
      if (type) filter.type = type;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const sort = {};
      sort[sortField] = sortDirection === 'desc' ? -1 : 1;

      const [rules, totalCount] = await Promise.all([
        AutomationRule.find(filter)
          .populate('createdBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        AutomationRule.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      return successResponse(res, {
        data: rules,
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
   * Create automation rule
   */
  async createAutomationRule(req, res, next) {
    try {
      const ruleData = {
        ...req.body,
        createdBy: req.user._id
      };

      const rule = new AutomationRule(ruleData);
      await rule.save();

      return successResponse(res, {
        message: 'Automation rule created successfully',
        data: rule
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get communication statistics
   */
  async getStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      const dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      // Role-based filtering
      if (req.user.role === 'agent') {
        dateFilter.agentId = req.user._id;
      }

      const stats = await Communication.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalCommunications: { $sum: 1 },
            byStatus: {
              $push: {
                status: '$status',
                count: 1
              }
            },
            byType: {
              $push: {
                type: '$type',
                count: 1
              }
            },
            byChannel: {
              $push: {
                channel: '$channel',
                count: 1
              }
            }
          }
        }
      ]);

      const loyaltyStats = await LoyaltyPoints.aggregate([
        {
          $group: {
            _id: '$tierLevel',
            count: { $sum: 1 },
            totalPoints: { $sum: '$totalPoints' }
          }
        }
      ]);

      return successResponse(res, {
        data: {
          communications: stats[0] || {},
          loyalty: loyaltyStats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trigger offer notifications (background job)
   */
  async triggerOfferNotifications(offerId) {
    try {
      const offer = await Offer.findById(offerId);
      if (!offer || !offer.isActive) return;

      let clientFilter = {};
      
      // Build client filter based on target audience
      if (!offer.targetAudience.allClients) {
        const orConditions = [];
        
        if (offer.targetAudience.specificClients.length > 0) {
          orConditions.push({ _id: { $in: offer.targetAudience.specificClients } });
        }
        
        if (offer.targetAudience.birthdayClients) {
          const today = new Date();
          const todayMonth = today.getMonth() + 1;
          const todayDate = today.getDate();
          
          orConditions.push({
            'individualData.dob': {
              $exists: true,
              $expr: {
                $and: [
                  { $eq: [{ $month: '$individualData.dob' }, todayMonth] },
                  { $eq: [{ $dayOfMonth: '$individualData.dob' }, todayDate] }
                ]
              }
            }
          });
        }
        
        if (orConditions.length > 0) {
          clientFilter.$or = orConditions;
        } else {
          return; // No valid audience
        }
      }

      const clients = await Client.find(clientFilter);
      
      // Create communication records for each eligible client
      const communications = clients.map(client => ({
        clientId: client._id,
        type: 'offer',
        channel: 'email', // Can be made configurable
        subject: `Special Offer: ${offer.title}`,
        content: offer.description,
        agentId: client.assignedAgentId,
        status: 'pending',
        scheduledFor: new Date()
      }));

      if (communications.length > 0) {
        await Communication.insertMany(communications);
      }
    } catch (error) {
      console.error('Error triggering offer notifications:', error);
    }
  }

  /**
   * Process birthday greetings (cron job function)
   */
  async processBirthdayGreetings() {
    try {
      const today = new Date();
      const todayMonth = today.getMonth() + 1;
      const todayDate = today.getDate();

      const clients = await Client.find({
        'individualData.dob': {
          $exists: true,
          $expr: {
            $and: [
              { $eq: [{ $month: '$individualData.dob' }, todayMonth] },
              { $eq: [{ $dayOfMonth: '$individualData.dob' }, todayDate] }
            ]
          }
        },
        'communicationPreferences.email.birthday': true
      });

      const communications = clients.map(client => ({
        clientId: client._id,
        type: 'birthday',
        channel: 'email',
        subject: `Happy Birthday, ${client.individualData.firstName}!`,
        content: `Dear ${client.individualData.firstName}, Wishing you a very happy birthday! Thank you for being a valued client.`,
        agentId: client.assignedAgentId,
        status: 'pending',
        scheduledFor: new Date()
      }));

      if (communications.length > 0) {
        await Communication.insertMany(communications);
      }

      return communications.length;
    } catch (error) {
      console.error('Error processing birthday greetings:', error);
      return 0;
    }
  }
}

module.exports = new CommunicationController();
