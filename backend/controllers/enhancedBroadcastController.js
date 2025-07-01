
const { EnhancedBroadcast, BroadcastTemplate, EnhancedBroadcastRecipient } = require('../models/EnhancedBroadcast');
const { Communication } = require('../models/Communication');
const Client = require('../models/Client');
const Policy = require('../models/Policy');
const Settings = require('../models/Settings');
const { AppError } = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');
const mongoose = require('mongoose');

class EnhancedBroadcastController {
  /**
   * Get all broadcasts with advanced filtering
   */
  async getBroadcasts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        status,
        channel,
        automationType,
        approvalStatus,
        dateFrom,
        dateTo,
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
      if (channel) filter.channels = { $in: [channel] };
      if (automationType) filter['automation.trigger.type'] = automationType;
      if (approvalStatus) filter['approval.status'] = approvalStatus;
      
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const sort = {};
      sort[sortField] = sortDirection === 'desc' ? -1 : 1;

      const [broadcasts, totalCount] = await Promise.all([
        EnhancedBroadcast.find(filter)
          .populate('createdBy', 'name email')
          .populate('approval.approvedBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        EnhancedBroadcast.countDocuments(filter)
      ]);

      // Enhance with real-time stats
      const enhancedBroadcasts = await Promise.all(
        broadcasts.map(async (broadcast) => {
          const realtimeStats = await this.calculateRealtimeStats(broadcast._id);
          return {
            ...broadcast,
            stats: { ...broadcast.stats, ...realtimeStats }
          };
        })
      );

      const totalPages = Math.ceil(totalCount / limitNum);

      return successResponse(res, {
        data: enhancedBroadcasts,
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
   * Create enhanced broadcast with automation and A/B testing
   */
  async createBroadcast(req, res, next) {
    try {
      const broadcastData = {
        ...req.body,
        createdBy: req.user._id,
        lastModifiedBy: req.user._id
      };

      // Check if approval is required
      const settings = await Settings.findOne({});
      const requiresApproval = this.checkApprovalRequired(broadcastData, settings);
      
      if (requiresApproval) {
        broadcastData.approval = {
          required: true,
          status: 'pending'
        };
        broadcastData.status = 'pending_approval';
      }

      const broadcast = new EnhancedBroadcast(broadcastData);
      await broadcast.save();

      // If it's an automated broadcast, set up triggers
      if (broadcast.automation.isAutomated) {
        await this.setupAutomationTriggers(broadcast);
      }

      // If scheduled for immediate sending and approved, process it
      if (broadcast.scheduledAt <= new Date() && broadcast.status === 'approved') {
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
   * Process automated triggers
   */
  async processAutomatedTriggers(req, res, next) {
    try {
      const { triggerType } = req.params;
      
      switch (triggerType) {
        case 'birthday':
          await this.processBirthdayGreetings();
          break;
        case 'anniversary':
          await this.processAnniversaryGreetings();
          break;
        case 'policy_expiry':
          await this.processPolicyExpiryReminders();
          break;
        case 'payment_due':
          await this.processPaymentReminders();
          break;
        case 'claim_update':
          await this.processClaimUpdates();
          break;
        default:
          throw new AppError('Invalid trigger type', 400);
      }

      return successResponse(res, { message: 'Automated triggers processed successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process birthday greetings
   */
  async processBirthdayGreetings() {
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Find clients with birthdays today
    const clients = await Client.find({
      $expr: {
        $eq: [
          { $dateToString: { format: "%m-%d", date: "$individualData.dateOfBirth" } },
          todayStr
        ]
      },
      status: 'Active'
    });

    if (clients.length === 0) return;

    // Get birthday greeting template
    const template = await BroadcastTemplate.findOne({
      category: 'birthday',
      isActive: true
    });

    if (!template) return;

    // Create automated broadcast
    const broadcast = new EnhancedBroadcast({
      title: `Birthday Greetings - ${today.toDateString()}`,
      type: 'birthday',
      channels: template.channels,
      content: template.templates.whatsapp?.text || template.templates.email?.text,
      channelConfigs: template.templates,
      targetAudience: {
        specificClients: clients.map(c => c._id)
      },
      automation: {
        isAutomated: true,
        trigger: { type: 'birthday' }
      },
      status: 'approved',
      createdBy: mongoose.Types.ObjectId('000000000000000000000000') // System user
    });

    await broadcast.save();
    await this.processBroadcast(broadcast._id);
  }

  /**
   * Process policy expiry reminders
   */
  async processPolicyExpiryReminders() {
    const reminderDays = [30, 15, 7, 1]; // Days before expiry
    
    for (const days of reminderDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      
      const expiringPolicies = await Policy.find({
        endDate: {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lt: new Date(targetDate.setHours(23, 59, 59, 999))
        },
        status: 'Active'
      }).populate('clientId');

      if (expiringPolicies.length === 0) continue;

      const template = await BroadcastTemplate.findOne({
        category: 'policy_renewal',
        isActive: true
      });

      if (!template) continue;

      const broadcast = new EnhancedBroadcast({
        title: `Policy Expiry Reminder - ${days} days`,
        type: 'policy_renewal',
        channels: template.channels,
        content: template.templates.whatsapp?.text?.replace('{days}', days) || template.templates.email?.text?.replace('{days}', days),
        channelConfigs: template.templates,
        targetAudience: {
          specificClients: expiringPolicies.map(p => p.clientId._id)
        },
        automation: {
          isAutomated: true,
          trigger: { type: 'policy_expiry', conditions: { daysBefore: days } }
        },
        status: 'approved',
        createdBy: mongoose.Types.ObjectId('000000000000000000000000')
      });

      await broadcast.save();
      await this.processBroadcast(broadcast._id);
    }
  }

  /**
   * Get broadcast analytics with ROI and engagement
   */
  async getBroadcastAnalytics(req, res, next) {
    try {
      const { broadcastId } = req.params;

      const broadcast = await EnhancedBroadcast.findById(broadcastId)
        .populate('createdBy', 'name email');

      if (!broadcast) {
        throw new AppError('Broadcast not found', 404);
      }

      // Get detailed recipient analytics
      const recipientAnalytics = await EnhancedBroadcastRecipient.aggregate([
        { $match: { broadcastId: mongoose.Types.ObjectId(broadcastId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalCost: { $sum: '$delivery.cost' },
            totalRevenue: { $sum: '$conversion.revenue' },
            avgEngagement: { $avg: '$engagement.score' }
          }
        }
      ]);

      const channelAnalytics = await EnhancedBroadcastRecipient.aggregate([
        { $match: { broadcastId: mongoose.Types.ObjectId(broadcastId) } },
        {
          $group: {
            _id: '$channel',
            sent: { $sum: { $cond: [{ $ne: ['$status', 'pending'] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            opened: { $sum: { $cond: [{ $eq: ['$status', 'opened'] }, 1, 0] } },
            clicked: { $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] } },
            converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            cost: { $sum: '$delivery.cost' },
            revenue: { $sum: '$conversion.revenue' }
          }
        }
      ]);

      // Calculate ROI
      const totalCost = recipientAnalytics.reduce((sum, item) => sum + (item.totalCost || 0), 0);
      const totalRevenue = recipientAnalytics.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
      const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

      return successResponse(res, {
        data: {
          broadcast,
          analytics: {
            recipientAnalytics,
            channelAnalytics,
            performance: {
              totalCost,
              totalRevenue,
              roi,
              netProfit: totalRevenue - totalCost
            }
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Broadcast approval workflow
   */
  async approveBroadcast(req, res, next) {
    try {
      const { broadcastId } = req.params;
      const { action, reason } = req.body; // action: 'approve' or 'reject'

      const broadcast = await EnhancedBroadcast.findById(broadcastId);
      if (!broadcast) {
        throw new AppError('Broadcast not found', 404);
      }

      if (broadcast.approval.status !== 'pending') {
        throw new AppError('Broadcast is not pending approval', 400);
      }

      if (action === 'approve') {
        broadcast.approval.status = 'approved';
        broadcast.approval.approvedBy = req.user._id;
        broadcast.approval.approvedAt = new Date();
        broadcast.status = 'approved';

        // If scheduled for immediate sending, process it
        if (broadcast.scheduledAt <= new Date()) {
          this.processBroadcast(broadcast._id);
        }
      } else if (action === 'reject') {
        broadcast.approval.status = 'rejected';
        broadcast.approval.rejectionReason = reason;
        broadcast.status = 'cancelled';
      }

      await broadcast.save();

      return successResponse(res, {
        message: `Broadcast ${action}d successfully`,
        data: broadcast
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * A/B test management
   */
  async manageAbTest(req, res, next) {
    try {
      const { broadcastId } = req.params;
      const { action, variantData } = req.body;

      const broadcast = await EnhancedBroadcast.findById(broadcastId);
      if (!broadcast) {
        throw new AppError('Broadcast not found', 404);
      }

      switch (action) {
        case 'create_variant':
          broadcast.abTest.enabled = true;
          broadcast.abTest.variants.push({
            name: variantData.name,
            content: variantData.content,
            subject: variantData.subject,
            percentage: variantData.percentage
          });
          break;
        
        case 'declare_winner':
          broadcast.abTest.winningVariant = variantData.winnerName;
          break;
        
        case 'get_results':
          const results = await this.calculateAbTestResults(broadcastId);
          return successResponse(res, { data: results });
      }

      await broadcast.save();
      return successResponse(res, { message: 'A/B test updated successfully', data: broadcast.abTest });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get broadcast templates
   */
  async getTemplates(req, res, next) {
    try {
      const { category, channel } = req.query;
      
      const filter = { isActive: true };
      if (category) filter.category = category;
      if (channel) filter.channels = { $in: [channel] };

      const templates = await BroadcastTemplate.find(filter)
        .populate('createdBy', 'name email')
        .sort({ category: 1, name: 1 });

      return successResponse(res, { data: templates });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create broadcast template
   */
  async createTemplate(req, res, next) {
    try {
      const templateData = {
        ...req.body,
        createdBy: req.user._id
      };

      const template = new BroadcastTemplate(templateData);
      await template.save();

      return successResponse(res, {
        message: 'Template created successfully',
        data: template
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process broadcast with enhanced features
   */
  async processBroadcast(broadcastId) {
    try {
      const broadcast = await EnhancedBroadcast.findById(broadcastId);
      if (!broadcast || !['approved', 'scheduled'].includes(broadcast.status)) return;

      broadcast.status = 'sending';
      await broadcast.save();

      // Get eligible clients with advanced targeting
      const clients = await this.getTargetedClients(broadcast);

      // Process A/B testing if enabled
      const variants = broadcast.abTest.enabled ? broadcast.abTest.variants : [{ name: 'default', content: broadcast.content, percentage: 100 }];

      for (const client of clients) {
        for (const channel of broadcast.channels) {
          // Skip if client has opted out of offers (but not business communications)
          if (this.shouldSkipClient(client, broadcast, channel)) continue;

          // Select A/B variant
          const variant = this.selectAbVariant(variants);

          // Personalize content
          const personalizedContent = await this.personalizeContent(broadcast, client, variant);

          // Create recipient record
          const recipient = new EnhancedBroadcastRecipient({
            broadcastId: broadcast._id,
            clientId: client._id,
            channel,
            abVariant: variant.name,
            personalizedContent,
            status: 'pending'
          });

          await recipient.save();

          // Create communication record
          const communication = new Communication({
            clientId: client._id,
            type: broadcast.type,
            channel,
            subject: personalizedContent.subject,
            content: personalizedContent.content
          });

          await communication.save();

          // Send message through appropriate channel
          try {
          await this.sendMessage(recipient, personalizedContent, channel);
          recipient.status = 'sent';
          recipient.sentAt = new Date();
        } catch (error) {
          recipient.status = 'failed';
          recipient.delivery.errorMessage = error.message;
        }

        await recipient.save();
      }
    }

    // Update broadcast status and stats
    await this.updateBroadcastStats(broadcast._id);
    broadcast.status = 'sent';
    await broadcast.save();

  } catch (error) {
    console.error('Error processing broadcast:', error);
    const broadcast = await EnhancedBroadcast.findById(broadcastId);
    if (broadcast) {
      broadcast.status = 'failed';
      await broadcast.save();
    }
  }
}

/**
 * Helper methods
 */
async calculateRealtimeStats(broadcastId) {
  const stats = await EnhancedBroadcastRecipient.aggregate([
    { $match: { broadcastId: mongoose.Types.ObjectId(broadcastId) } },
    {
      $group: {
        _id: null,
        totalRecipients: { $sum: 1 },
        sent: { $sum: { $cond: [{ $ne: ['$status', 'pending'] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        opened: { $sum: { $cond: [{ $eq: ['$status', 'opened'] }, 1, 0] } },
        clicked: { $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] } },
        converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
        totalRevenue: { $sum: '$conversion.revenue' },
        totalCost: { $sum: '$delivery.cost' }
      }
    }
  ]);

  return stats[0] || {};
}

checkApprovalRequired(broadcastData, settings) {
  // Check if broadcast type requires approval
  const requiresApproval = ['offer', 'promotion'].includes(broadcastData.type);
  
  // Check if high-value campaign
  const isHighValue = broadcastData.campaign?.budget > 50000;
  
  // Check if targeting large audience
  const isLargeAudience = broadcastData.targetAudience?.allClients;
  
  return requiresApproval || isHighValue || isLargeAudience;
}

async getTargetedClients(broadcast) {
  let filter = { status: 'Active' };
  const { targetAudience } = broadcast;

  if (!targetAudience.allClients) {
    const orConditions = [];

    if (targetAudience.specificClients?.length > 0) {
      orConditions.push({ _id: { $in: targetAudience.specificClients } });
    }

    if (targetAudience.clientTypes?.length > 0) {
      orConditions.push({ clientType: { $in: targetAudience.clientTypes } });
    }

    if (targetAudience.policyTypes?.length > 0) {
      const policyClients = await Policy.find({
        policyType: { $in: targetAudience.policyTypes }
      }).distinct('clientId');
      orConditions.push({ _id: { $in: policyClients } });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }
  }

  return await Client.find(filter).populate('policies');
}

shouldSkipClient(client, broadcast, channel) {
  // Skip if client has opted out of offers (but not business communications)
  const preferences = client.communicationPreferences?.[channel];
  
  if (broadcast.type === 'offer' && preferences?.offers === false) {
    return true;
  }
  
  // Never skip business communications like payment reminders, policy expiry, etc.
  const businessTypes = ['payment_due', 'policy_renewal', 'claim_update'];
  if (businessTypes.includes(broadcast.type)) {
    return false;
  }
  
  return false;
}

selectAbVariant(variants) {
  if (variants.length === 1) return variants[0];
  
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const variant of variants) {
    cumulative += variant.percentage;
    if (random <= cumulative) {
      return variant;
    }
  }
  
  return variants[0]; // fallback
}

async personalizeContent(broadcast, client, variant) {
  let content = variant.content || broadcast.content;
  let subject = variant.subject || broadcast.channelConfigs?.email?.subject || broadcast.title;
  
  // Replace standard placeholders
  const replacements = {
    '{{name}}': client.displayName || 'Valued Customer',
    '{{firstName}}': client.individualData?.firstName || client.corporateData?.contactPersonName || 'Customer',
    '{{email}}': client.email,
    '{{phone}}': client.phone,
    '{{city}}': client.city,
    '{{policyCount}}': client.policies?.length || 0
  };

  // Replace placeholders in content and subject
  Object.keys(replacements).forEach(placeholder => {
    const regex = new RegExp(placeholder, 'g');
    content = content.replace(regex, replacements[placeholder]);
    subject = subject.replace(regex, replacements[placeholder]);
  });

  return { content, subject, variables: replacements };
}

async sendMessage(recipient, content, channel) {
  // Implement actual message sending logic here
  // This would integrate with email services, WhatsApp Business API, SMS providers, etc.
  console.log(`Sending ${channel} message to ${recipient.clientId}:`, content.content);
  
  // Simulate sending delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return { success: true, messageId: `msg_${Date.now()}` };
}

async updateBroadcastStats(broadcastId) {
  const stats = await this.calculateRealtimeStats(broadcastId);
  
  await EnhancedBroadcast.findByIdAndUpdate(broadcastId, {
    $set: {
      'stats.totalRecipients': stats.totalRecipients || 0,
      'stats.sentCount': stats.sent || 0,
      'stats.deliveredCount': stats.delivered || 0,
      'stats.openedCount': stats.opened || 0,
      'stats.clickedCount': stats.clicked || 0,
      'stats.convertedCount': stats.converted || 0,
      'stats.revenueGenerated': stats.totalRevenue || 0,
      'stats.roi': stats.totalCost > 0 ? ((stats.totalRevenue - stats.totalCost) / stats.totalCost) * 100 : 0
    }
  });
}
}

module.exports = new EnhancedBroadcastController();
