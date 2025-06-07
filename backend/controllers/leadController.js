
const Lead = require('../models/Lead');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { generateId } = require('../utils/generateId');

/**
 * Get all leads with filtering, pagination, and search
 */
const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      source,
      priority,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;

    // Build filter object
    const filter = {};

    // Apply role-based filtering
    if (req.ownershipFilter) {
      Object.assign(filter, req.ownershipFilter);
    }

    // Apply status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Apply source filter
    if (source && source !== 'all') {
      filter.source = source;
    }

    // Apply priority filter
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // Apply assigned agent filter
    if (assignedTo && assignedTo !== 'all') {
      filter['assignedTo.name'] = assignedTo;
    }

    // Apply date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = Lead.find(filter);

    // Apply text search if provided
    if (search) {
      query = Lead.find({
        ...filter,
        $text: { $search: search }
      }, { score: { $meta: 'textScore' } });
      sort.score = { $meta: 'textScore' };
    }

    // Execute query with pagination and sorting
    const [leads, totalCount] = await Promise.all([
      query
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo.agentId', 'name email')
        .lean(),
      Lead.countDocuments(search ? { ...filter, $text: { $search: search } } : filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: totalCount,
      itemsPerPage: parseInt(limit),
      hasNext,
      hasPrev
    };

    successResponse(res, {
      leads,
      pagination,
      totalCount
    }, 'Leads retrieved successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Get lead by ID
 */
const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check ownership for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      if (lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    successResponse(res, lead, 'Lead retrieved successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Create new lead
 */
const createLead = async (req, res, next) => {
  try {
    // Ensure assignedTo.agentId is set if not provided
    if (!req.body.assignedTo?.agentId && req.user.role === 'agent') {
      req.body.assignedTo = {
        agentId: req.user._id,
        name: req.user.name || req.user.email
      };
    }

    const lead = new Lead(req.body);
    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, populatedLead, 'Lead created successfully', 201);

  } catch (error) {
    if (error.code === 11000) {
      next(new AppError('Lead with this email or phone already exists', 409));
    } else {
      next(error);
    }
  }
};

/**
 * Update lead
 */
const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check ownership for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      if (lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    // Update lead fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        lead[key] = req.body[key];
      }
    });

    lead.lastInteraction = new Date();
    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, updatedLead, 'Lead updated successfully');

  } catch (error) {
    if (error.code === 11000) {
      next(new AppError('Lead with this email or phone already exists', 409));
    } else {
      next(error);
    }
  }
};

/**
 * Delete lead
 */
const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check ownership for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      if (lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    await Lead.findByIdAndDelete(id);

    successResponse(res, null, 'Lead deleted successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Add follow-up to lead
 */
const addFollowUp = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check ownership for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      if (lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    const followUpData = {
      ...req.body,
      createdBy: req.user.name || req.user.email
    };

    await lead.addFollowUp(followUpData);

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, updatedLead, 'Follow-up added successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Add note to lead
 */
const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check ownership for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      if (lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    const noteData = {
      ...req.body,
      createdBy: req.user.name || req.user.email
    };

    await lead.addNote(noteData);

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, updatedLead, 'Note added successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Assign lead to agent
 */
const assignLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId, agentName } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    await lead.assignToAgent(agentId, agentName);

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, updatedLead, 'Lead assigned successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Convert lead to client
 */
const convertToClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    if (lead.status === 'Converted') {
      throw new AppError('Lead is already converted', 400);
    }

    // Check ownership for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      if (lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    // Update lead status
    lead.status = 'Converted';
    lead.lastInteraction = new Date();
    await lead.save();

    // Here you would typically create a client record
    // For now, we'll just return success with a mock client ID
    const mockClientId = generateId('CL');

    successResponse(res, {
      leadId: lead._id,
      clientId: mockClientId,
      message: 'Lead converted to client successfully'
    }, 'Lead converted successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Get leads statistics
 */
const getLeadsStats = async (req, res, next) => {
  try {
    const { period = '30d', agentId } = req.query;

    // Build base filter
    const filter = {};

    // Apply role-based filtering
    if (req.ownershipFilter) {
      Object.assign(filter, req.ownershipFilter);
    }

    // Apply agent filter if specified
    if (agentId) {
      filter['assignedTo.agentId'] = agentId;
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    filter.createdAt = { $gte: startDate };

    // Aggregate statistics
    const [
      totalLeads,
      statusStats,
      sourceStats,
      priorityStats,
      conversionStats
    ] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: filter },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: filter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: { ...filter, status: 'Converted' } },
        { $count: 'converted' }
      ])
    ]);

    // Format statistics
    const stats = {
      totalLeads,
      newLeads: statusStats.find(s => s._id === 'New')?.count || 0,
      inProgress: statusStats.find(s => s._id === 'In Progress')?.count || 0,
      qualified: statusStats.find(s => s._id === 'Qualified')?.count || 0,
      converted: statusStats.find(s => s._id === 'Converted')?.count || 0,
      lost: statusStats.find(s => s._id === 'Lost')?.count || 0,
      conversionRate: totalLeads > 0 ? ((conversionStats[0]?.converted || 0) / totalLeads * 100).toFixed(1) : '0.0',
      topSources: sourceStats.sort((a, b) => b.count - a.count).slice(0, 5),
      priorityDistribution: priorityStats,
      period
    };

    successResponse(res, stats, 'Lead statistics retrieved successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Search leads
 */
const searchLeads = async (req, res, next) => {
  try {
    const { query, limit = 10 } = req.params;

    if (!query || query.length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400);
    }

    // Build filter object
    const filter = {
      $text: { $search: query }
    };

    // Apply role-based filtering
    if (req.ownershipFilter) {
      Object.assign(filter, req.ownershipFilter);
    }

    const leads = await Lead.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, leads, 'Search results retrieved successfully');

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addFollowUp,
  addNote,
  assignLead,
  convertToClient,
  getLeadsStats,
  searchLeads
};
