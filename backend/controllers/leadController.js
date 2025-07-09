
const Lead = require('../models/Lead');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { AppError } = require('../utils/errorHandler');

/**
 * Get all leads with filtering, pagination, and search
 */
exports.getLeads = async (req, res, next) => {
  try {
    console.log('Fetching leads with query params:', req.query);
    
    const {
      page = 1,
      limit = 10,
      status = 'all',
      source = 'all',
      priority = 'all',
      assignedTo = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;

    // Build filter query
    let filter = {};

    // Apply role-based filtering
    if (req.user.role === 'agent') {
      filter['assignedTo.agentId'] = req.user._id;
    }

    // Status filter
    if (status !== 'all') {
      filter.status = status;
    }

    // Source filter
    if (source !== 'all') {
      filter.source = source;
    }

    // Priority filter
    if (priority !== 'all') {
      filter.priority = priority;
    }

    // Assigned agent filter
    if (assignedTo !== 'all') {
      filter['assignedTo.name'] = new RegExp(assignedTo, 'i');
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { leadId: new RegExp(search, 'i') },
        { additionalInfo: new RegExp(search, 'i') }
      ];
    }

    console.log('Applied filter:', JSON.stringify(filter, null, 2));

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute queries
    const [leads, totalCount] = await Promise.all([
      Lead.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('assignedTo.agentId', 'name email')
        .lean(),
      Lead.countDocuments(filter)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    const pagination = {
      currentPage: pageNum,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limitNum,
      hasNext,
      hasPrev
    };

    console.log(`Found ${leads.length} leads out of ${totalCount} total`);

    successResponse(res, 'Leads retrieved successfully', {
      leads,
      pagination,
      totalCount
    });

  } catch (error) {
    console.error('Error in getLeads:', error);
    next(new AppError('Failed to retrieve leads', 500, error.message));
  }
};

/**
 * Get single lead by ID
 */
exports.getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Fetching lead by ID:', id);

    const lead = await Lead.findById(id)
      .populate('assignedTo.agentId', 'name email phone')
      .lean();

    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && 
        lead.assignedTo.agentId && 
        lead.assignedTo.agentId._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied', 403));
    }

    console.log('Lead found:', lead.leadId);
    successResponse(res, 'Lead retrieved successfully', lead);

  } catch (error) {
    console.error('Error in getLeadById:', error);
    next(new AppError('Failed to retrieve lead', 500, error.message));
  }
};

/**
 * Create new lead
 */
exports.createLead = async (req, res, next) => {
  try {
    console.log('Creating new lead with data:', req.body);

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    let leadData = { ...req.body };

    // Auto-assign to current user if agent
    if (req.user.role === 'agent') {
      leadData.assignedTo = {
        agentId: req.user._id,
        name: req.user.name
      };
    }

    // Create lead
    const lead = new Lead(leadData);
    await lead.save();

    console.log('Lead created successfully:', lead.leadId);
    successResponse(res, 'Lead created successfully', lead, 201);

  } catch (error) {
    console.error('Error in createLead:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(new AppError(`${field} already exists`, 400));
    }
    
    next(new AppError('Failed to create lead', 500, error.message));
  }
};

/**
 * Update existing lead
 */
exports.updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Updating lead:', id, 'with data:', req.body);

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    // Find lead first to check ownership
    const existingLead = await Lead.findById(id);
    if (!existingLead) {
      return next(new AppError('Lead not found', 404));
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && 
        existingLead.assignedTo.agentId && 
        existingLead.assignedTo.agentId.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Update lead
    const lead = await Lead.findByIdAndUpdate(
      id,
      { ...req.body, lastInteraction: new Date() },
      { new: true, runValidators: true }
    ).populate('assignedTo.agentId', 'name email');

    console.log('Lead updated successfully:', lead.leadId);
    successResponse(res, 'Lead updated successfully', lead);

  } catch (error) {
    console.error('Error in updateLead:', error);
    next(new AppError('Failed to update lead', 500, error.message));
  }
};

/**
 * Delete lead
 */
exports.deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Deleting lead:', id);

    const lead = await Lead.findById(id);
    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    await Lead.findByIdAndDelete(id);

    console.log('Lead deleted successfully:', lead.leadId);
    successResponse(res, 'Lead deleted successfully');

  } catch (error) {
    console.error('Error in deleteLead:', error);
    next(new AppError('Failed to delete lead', 500, error.message));
  }
};

/**
 * Add follow-up to lead
 */
exports.addFollowUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Adding follow-up to lead:', id);

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && 
        lead.assignedTo.agentId && 
        lead.assignedTo.agentId.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Add follow-up
    const followUpData = {
      ...req.body,
      createdBy: req.user.name
    };

    lead.followUps.push(followUpData);
    lead.lastInteraction = new Date();
    
    await lead.save();

    console.log('Follow-up added successfully');
    successResponse(res, 'Follow-up added successfully', lead);

  } catch (error) {
    console.error('Error in addFollowUp:', error);
    next(new AppError('Failed to add follow-up', 500, error.message));
  }
};

/**
 * Add note to lead
 */
exports.addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Adding note to lead:', id);

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && 
        lead.assignedTo.agentId && 
        lead.assignedTo.agentId.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Add note
    const noteData = {
      ...req.body,
      createdBy: req.user.name
    };

    lead.notes.push(noteData);
    await lead.save();

    console.log('Note added successfully');
    successResponse(res, 'Note added successfully', lead);

  } catch (error) {
    console.error('Error in addNote:', error);
    next(new AppError('Failed to add note', 500, error.message));
  }
};

/**
 * Assign lead to agent
 */
exports.assignLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId, agentName } = req.body;
    console.log('Assigning lead:', id, 'to agent:', agentId);

    const lead = await Lead.findById(id);
    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    // Update assignment
    lead.assignedTo = { agentId, name: agentName };
    await lead.save();

    console.log('Lead assigned successfully');
    successResponse(res, 'Lead assigned successfully', lead);

  } catch (error) {
    console.error('Error in assignLead:', error);
    next(new AppError('Failed to assign lead', 500, error.message));
  }
};

/**
 * Convert lead to client
 */
exports.convertToClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Converting lead to client:', id);

    const lead = await Lead.findById(id);
    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    if (lead.status === 'Converted') {
      return next(new AppError('Lead is already converted', 400));
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && 
        lead.assignedTo.agentId && 
        lead.assignedTo.agentId.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Generate client ID
    const clientId = `CL${Date.now().toString().slice(-6)}`;

    // Update lead status
    lead.status = 'Converted';
    lead.convertedToClientId = clientId;
    lead.lastInteraction = new Date();
    
    await lead.save();

    console.log('Lead converted successfully to client:', clientId);
    successResponse(res, 'Lead converted successfully', {
      leadId: lead._id,
      clientId,
      message: 'Lead converted to client successfully'
    });

  } catch (error) {
    console.error('Error in convertToClient:', error);
    next(new AppError('Failed to convert lead', 500, error.message));
  }
};

/**
 * Get leads statistics
 */
exports.getLeadsStats = async (req, res, next) => {
  try {
    console.log('Fetching leads statistics');

    let filter = {};
    
    // Apply role-based filtering
    if (req.user.role === 'agent') {
      filter['assignedTo.agentId'] = req.user._id;
    }

    // Get basic counts
    const [
      totalLeads,
      newLeads,
      inProgress,
      qualified,
      converted,
      lost,
      notInterested
    ] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.countDocuments({ ...filter, status: 'New' }),
      Lead.countDocuments({ ...filter, status: 'In Progress' }),
      Lead.countDocuments({ ...filter, status: 'Qualified' }),
      Lead.countDocuments({ ...filter, status: 'Converted' }),
      Lead.countDocuments({ ...filter, status: 'Lost' }),
      Lead.countDocuments({ ...filter, status: 'Not Interested' })
    ]);

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : '0.0';

    // Get source distribution
    const topSources = await Lead.aggregate([
      { $match: filter },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get priority distribution
    const priorityDistribution = await Lead.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const stats = {
      totalLeads,
      newLeads,
      inProgress,
      qualified,
      converted,
      lost,
      notInterested,
      conversionRate,
      topSources,
      priorityDistribution
    };

    console.log('Stats calculated:', stats);
    successResponse(res, 'Lead statistics retrieved successfully', stats);

  } catch (error) {
    console.error('Error in getLeadsStats:', error);
    next(new AppError('Failed to retrieve statistics', 500, error.message));
  }
};

/**
 * Search leads
 */
exports.searchLeads = async (req, res, next) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    console.log('Searching leads with query:', query);

    if (!query || query.length < 2) {
      return next(new AppError('Search query must be at least 2 characters', 400));
    }

    let filter = {
      $or: [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
        { phone: new RegExp(query, 'i') },
        { leadId: new RegExp(query, 'i') },
        { additionalInfo: new RegExp(query, 'i') }
      ]
    };

    // Apply role-based filtering
    if (req.user.role === 'agent') {
      filter['assignedTo.agentId'] = req.user._id;
    }

    const leads = await Lead.find(filter)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('assignedTo.agentId', 'name email')
      .lean();

    console.log(`Found ${leads.length} leads matching search`);
    successResponse(res, 'Search results retrieved successfully', leads);

  } catch (error) {
    console.error('Error in searchLeads:', error);
    next(new AppError('Failed to search leads', 500, error.message));
  }
};

/**
 * Get stale leads
 */
exports.getStaleLeads = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    console.log('Fetching stale leads older than', days, 'days');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    let filter = {
      $or: [
        { lastInteraction: { $lt: cutoffDate } },
        { lastInteraction: { $exists: false } }
      ],
      status: { $in: ['New', 'In Progress', 'Qualified'] }
    };

    // Apply role-based filtering
    if (req.user.role === 'agent') {
      filter['assignedTo.agentId'] = req.user._id;
    }

    const staleLeads = await Lead.find(filter)
      .sort({ lastInteraction: 1 })
      .populate('assignedTo.agentId', 'name email')
      .lean();

    console.log(`Found ${staleLeads.length} stale leads`);
    successResponse(res, 'Stale leads retrieved successfully', staleLeads);

  } catch (error) {
    console.error('Error in getStaleLeads:', error);
    next(new AppError('Failed to retrieve stale leads', 500, error.message));
  }
};

/**
 * Get lead funnel report
 */
exports.getLeadFunnelReport = async (req, res, next) => {
  try {
    console.log('Generating lead funnel report');

    let filter = {};
    
    // Apply role-based filtering
    if (req.user.role === 'agent') {
      filter['assignedTo.agentId'] = req.user._id;
    }

    const funnelData = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgBudget: { $avg: '$budget' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Calculate funnel metrics
    const totalLeads = funnelData.reduce((sum, stage) => sum + stage.count, 0);
    const funnelReport = funnelData.map(stage => ({
      ...stage,
      percentage: totalLeads > 0 ? ((stage.count / totalLeads) * 100).toFixed(1) : '0.0'
    }));

    console.log('Funnel report generated');
    successResponse(res, 'Lead funnel report generated successfully', {
      funnelData: funnelReport,
      totalLeads
    });

  } catch (error) {
    console.error('Error in getLeadFunnelReport:', error);
    next(new AppError('Failed to generate funnel report', 500, error.message));
  }
};
