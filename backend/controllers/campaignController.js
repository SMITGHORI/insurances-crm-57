
const Settings = require('../models/Settings');
const Lead = require('../models/Lead');
const { AppError } = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');

/**
 * Get all email campaigns
 */
const getEmailCampaigns = async (req, res, next) => {
  try {
    const settings = await Settings.findOne({}).populate('emailCampaigns.createdBy', 'name email');
    const campaigns = settings?.emailCampaigns || [];

    successResponse(res, campaigns, 'Email campaigns retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create email campaign
 */
const createEmailCampaign = async (req, res, next) => {
  try {
    const campaignData = {
      ...req.body,
      createdBy: req.user._id
    };

    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings({
        emailCampaigns: [campaignData],
        updatedBy: req.user._id
      });
    } else {
      settings.emailCampaigns.push(campaignData);
      settings.updatedBy = req.user._id;
    }

    await settings.save();

    const populatedSettings = await Settings.findById(settings._id)
      .populate('emailCampaigns.createdBy', 'name email');

    const newCampaign = populatedSettings.emailCampaigns[populatedSettings.emailCampaigns.length - 1];

    successResponse(res, newCampaign, 'Email campaign created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update email campaign
 */
const updateEmailCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const settings = await Settings.findOne({});
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }

    const campaignIndex = settings.emailCampaigns.findIndex(
      campaign => campaign._id.toString() === id
    );

    if (campaignIndex === -1) {
      throw new AppError('Campaign not found', 404);
    }

    // Update campaign
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        settings.emailCampaigns[campaignIndex][key] = req.body[key];
      }
    });

    settings.updatedBy = req.user._id;
    await settings.save();

    const updatedCampaign = settings.emailCampaigns[campaignIndex];

    successResponse(res, updatedCampaign, 'Email campaign updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete email campaign
 */
const deleteEmailCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const settings = await Settings.findOne({});
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }

    const campaignIndex = settings.emailCampaigns.findIndex(
      campaign => campaign._id.toString() === id
    );

    if (campaignIndex === -1) {
      throw new AppError('Campaign not found', 404);
    }

    settings.emailCampaigns.splice(campaignIndex, 1);
    settings.updatedBy = req.user._id;
    await settings.save();

    successResponse(res, null, 'Email campaign deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Send email campaign to leads
 */
const sendEmailCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetLeads } = req.body; // Array of lead IDs

    const settings = await Settings.findOne({});
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }

    const campaign = settings.emailCampaigns.find(
      campaign => campaign._id.toString() === id
    );

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    // Get target leads
    let leads;
    if (targetLeads && targetLeads.length > 0) {
      leads = await Lead.find({ _id: { $in: targetLeads } });
    } else {
      // Filter by segment
      const filter = {};
      switch (campaign.targetSegment) {
        case 'New':
          filter.status = 'New';
          break;
        case 'In Progress':
          filter.status = 'In Progress';
          break;
        case 'Qualified':
          filter.status = 'Qualified';
          break;
        case 'High Priority':
          filter.priority = 'High';
          break;
        case 'Stale':
          const staleDate = new Date();
          staleDate.setDate(staleDate.getDate() - 7);
          filter.lastInteraction = { $lte: staleDate };
          break;
        default:
          // All leads
          break;
      }

      leads = await Lead.find(filter);
    }

    // Simulate sending emails (implement actual email service here)
    const emailResults = leads.map(lead => ({
      leadId: lead._id,
      email: lead.email,
      status: 'sent',
      sentAt: new Date()
    }));

    // Log campaign execution
    console.log(`Email campaign "${campaign.name}" sent to ${leads.length} leads`);

    successResponse(res, {
      campaignId: id,
      totalSent: leads.length,
      results: emailResults
    }, 'Email campaign sent successfully');

  } catch (error) {
    next(error);
  }
};

// WhatsApp Template methods (similar structure)
const getWhatsAppTemplates = async (req, res, next) => {
  try {
    const settings = await Settings.findOne({}).populate('whatsApp.templates.createdBy', 'name email');
    const templates = settings?.whatsApp?.templates || [];

    successResponse(res, templates, 'WhatsApp templates retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createWhatsAppTemplate = async (req, res, next) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.user._id
    };

    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings({
        whatsApp: { templates: [templateData] },
        updatedBy: req.user._id
      });
    } else {
      if (!settings.whatsApp) settings.whatsApp = {};
      if (!settings.whatsApp.templates) settings.whatsApp.templates = [];
      settings.whatsApp.templates.push(templateData);
      settings.updatedBy = req.user._id;
    }

    await settings.save();

    const newTemplate = settings.whatsApp.templates[settings.whatsApp.templates.length - 1];

    successResponse(res, newTemplate, 'WhatsApp template created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateWhatsAppTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const settings = await Settings.findOne({});
    if (!settings || !settings.whatsApp || !settings.whatsApp.templates) {
      throw new AppError('Template not found', 404);
    }

    const templateIndex = settings.whatsApp.templates.findIndex(
      template => template._id.toString() === id
    );

    if (templateIndex === -1) {
      throw new AppError('Template not found', 404);
    }

    // Update template
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        settings.whatsApp.templates[templateIndex][key] = req.body[key];
      }
    });

    settings.updatedBy = req.user._id;
    await settings.save();

    const updatedTemplate = settings.whatsApp.templates[templateIndex];

    successResponse(res, updatedTemplate, 'WhatsApp template updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteWhatsAppTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const settings = await Settings.findOne({});
    if (!settings || !settings.whatsApp || !settings.whatsApp.templates) {
      throw new AppError('Template not found', 404);
    }

    const templateIndex = settings.whatsApp.templates.findIndex(
      template => template._id.toString() === id
    );

    if (templateIndex === -1) {
      throw new AppError('Template not found', 404);
    }

    settings.whatsApp.templates.splice(templateIndex, 1);
    settings.updatedBy = req.user._id;
    await settings.save();

    successResponse(res, null, 'WhatsApp template deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Lead Qualification methods
const getLeadQualificationCriteria = async (req, res, next) => {
  try {
    const settings = await Settings.findOne({}).populate('leadQualification.createdBy', 'name email');
    const criteria = settings?.leadQualification || [];

    successResponse(res, criteria, 'Lead qualification criteria retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createLeadQualificationCriteria = async (req, res, next) => {
  try {
    const criteriaData = {
      ...req.body,
      createdBy: req.user._id
    };

    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings({
        leadQualification: [criteriaData],
        updatedBy: req.user._id
      });
    } else {
      settings.leadQualification.push(criteriaData);
      settings.updatedBy = req.user._id;
    }

    await settings.save();

    const newCriteria = settings.leadQualification[settings.leadQualification.length - 1];

    successResponse(res, newCriteria, 'Lead qualification criteria created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateLeadQualificationCriteria = async (req, res, next) => {
  try {
    const { id } = req.params;

    const settings = await Settings.findOne({});
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }

    const criteriaIndex = settings.leadQualification.findIndex(
      criteria => criteria._id.toString() === id
    );

    if (criteriaIndex === -1) {
      throw new AppError('Criteria not found', 404);
    }

    // Update criteria
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        settings.leadQualification[criteriaIndex][key] = req.body[key];
      }
    });

    settings.updatedBy = req.user._id;
    await settings.save();

    const updatedCriteria = settings.leadQualification[criteriaIndex];

    successResponse(res, updatedCriteria, 'Lead qualification criteria updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteLeadQualificationCriteria = async (req, res, next) => {
  try {
    const { id } = req.params;

    const settings = await Settings.findOne({});
    if (!settings) {
      throw new AppError('Settings not found', 404);
    }

    const criteriaIndex = settings.leadQualification.findIndex(
      criteria => criteria._id.toString() === id
    );

    if (criteriaIndex === -1) {
      throw new AppError('Criteria not found', 404);
    }

    settings.leadQualification.splice(criteriaIndex, 1);
    settings.updatedBy = req.user._id;
    await settings.save();

    successResponse(res, null, 'Lead qualification criteria deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getCampaignStats = async (req, res, next) => {
  try {
    const settings = await Settings.findOne({});
    
    const stats = {
      emailCampaigns: {
        total: settings?.emailCampaigns?.length || 0,
        active: settings?.emailCampaigns?.filter(c => c.isActive)?.length || 0
      },
      whatsAppTemplates: {
        total: settings?.whatsApp?.templates?.length || 0,
        active: settings?.whatsApp?.templates?.filter(t => t.isActive)?.length || 0
      },
      qualificationCriteria: {
        total: settings?.leadQualification?.length || 0,
        active: settings?.leadQualification?.filter(c => c.isActive)?.length || 0
      }
    };

    successResponse(res, stats, 'Campaign statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmailCampaigns,
  createEmailCampaign,
  updateEmailCampaign,
  deleteEmailCampaign,
  sendEmailCampaign,
  getWhatsAppTemplates,
  createWhatsAppTemplate,
  updateWhatsAppTemplate,
  deleteWhatsAppTemplate,
  getLeadQualificationCriteria,
  createLeadQualificationCriteria,
  updateLeadQualificationCriteria,
  deleteLeadQualificationCriteria,
  getCampaignStats
};
