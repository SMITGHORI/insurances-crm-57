const Lead = require('../models/Lead');
const Client = require('../models/Client');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { generateId } = require('../utils/generateId');

// Lead scoring configuration
const LEAD_SCORING_CONFIG = {
  budget: {
    high: { min: 1000000, score: 30 },
    medium: { min: 500000, score: 20 },
    low: { min: 100000, score: 10 },
    minimal: { score: 5 }
  },
  engagement: {
    followUpCount: 5,
    noteCount: 3,
    recentActivity: 7 // days
  },
  timeline: {
    urgent: { days: 7, score: 25 },
    soon: { days: 30, score: 15 },
    later: { days: 90, score: 5 }
  }
};

// Territory assignment rules
const TERRITORY_RULES = {
  'Mumbai': ['Mumbai', 'Navi Mumbai', 'Thane'],
  'Delhi': ['Delhi', 'New Delhi', 'Gurgaon', 'Noida'],
  'Bangalore': ['Bangalore', 'Bengaluru'],
  'Chennai': ['Chennai'],
  'Pune': ['Pune'],
  'Hyderabad': ['Hyderabad']
};

/**
 * Calculate lead score based on multiple factors
 */
const calculateLeadScore = (lead) => {
  let score = 0;
  
  // Budget scoring
  if (lead.budget) {
    if (lead.budget >= LEAD_SCORING_CONFIG.budget.high.min) {
      score += LEAD_SCORING_CONFIG.budget.high.score;
    } else if (lead.budget >= LEAD_SCORING_CONFIG.budget.medium.min) {
      score += LEAD_SCORING_CONFIG.budget.medium.score;
    } else if (lead.budget >= LEAD_SCORING_CONFIG.budget.low.min) {
      score += LEAD_SCORING_CONFIG.budget.low.score;
    } else {
      score += LEAD_SCORING_CONFIG.budget.minimal.score;
    }
  }
  
  // Engagement scoring
  const followUpCount = lead.followUps ? lead.followUps.length : 0;
  const noteCount = lead.notes ? lead.notes.length : 0;
  
  score += Math.min(followUpCount * 2, 10); // Max 10 points for follow-ups
  score += Math.min(noteCount * 1, 5); // Max 5 points for notes
  
  // Recent activity bonus
  if (lead.lastInteraction) {
    const daysSinceLastActivity = Math.floor((new Date() - new Date(lead.lastInteraction)) / (1000 * 60 * 60 * 24));
    if (daysSinceLastActivity <= LEAD_SCORING_CONFIG.engagement.recentActivity) {
      score += 10;
    }
  }
  
  // Priority scoring
  if (lead.priority === 'High') score += 15;
  else if (lead.priority === 'Medium') score += 10;
  else score += 5;
  
  // Status scoring
  if (lead.status === 'Qualified') score += 20;
  else if (lead.status === 'In Progress') score += 15;
  else if (lead.status === 'New') score += 10;
  
  return Math.min(score, 100); // Cap at 100
};

/**
 * Detect duplicate leads
 */
const detectDuplicateLeads = async (leadData) => {
  const duplicates = await Lead.find({
    $or: [
      { email: leadData.email },
      { phone: leadData.phone }
    ]
  });
  
  return duplicates;
};

/**
 * Auto-assign lead based on territory
 */
const autoAssignByTerritory = async (address) => {
  if (!address) return null;
  
  const addressLower = address.toLowerCase();
  let assignedTerritory = null;
  
  // Find territory based on address
  for (const [territory, cities] of Object.entries(TERRITORY_RULES)) {
    if (cities.some(city => addressLower.includes(city.toLowerCase()))) {
      assignedTerritory = territory;
      break;
    }
  }
  
  if (assignedTerritory) {
    // Find available agent in territory
    const agent = await User.findOne({
      role: 'agent',
      status: 'active',
      territory: assignedTerritory
    }).sort({ leadCount: 1 }); // Assign to agent with least leads
    
    return agent;
  }
  
  return null;
};

/**
 * Log lead activity
 */
const logLeadActivity = async (leadId, action, description, userId) => {
  try {
    await Activity.create({
      type: 'lead',
      action,
      description,
      entityId: leadId,
      entityType: 'Lead',
      userId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log lead activity:', error);
  }
};

/**
 * Update agent workload statistics
 */
const updateAgentWorkload = async (agentId, increment = true) => {
  try {
    const updateValue = increment ? 1 : -1;
    await User.findByIdAndUpdate(agentId, {
      $inc: { leadCount: updateValue }
    });
  } catch (error) {
    console.error('Failed to update agent workload:', error);
  }
};

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
      dateTo,
      territory,
      minScore,
      maxScore
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

    // Apply territory filter
    if (territory && territory !== 'all') {
      filter.territory = territory;
    }

    // Apply score range filter
    if (minScore || maxScore) {
      filter.score = {};
      if (minScore) filter.score.$gte = parseInt(minScore);
      if (maxScore) filter.score.$lte = parseInt(maxScore);
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

    // Calculate lead scores for each lead
    const leadsWithScores = leads.map(lead => ({
      ...lead,
      score: calculateLeadScore(lead)
    }));

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

    res.status(200).json({
      success: true,
      data: {
        leads: leadsWithScores,
        pagination,
        totalCount
      },
      message: 'Leads retrieved successfully',
      timestamp: new Date().toISOString()
    });

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
    const userRole = req.user.role?.name || req.user.role;
    if (req.checkOwnership && userRole === 'agent') {
      if (lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    // Calculate lead score
    const leadWithScore = {
      ...lead,
      score: calculateLeadScore(lead)
    };

    res.status(200).json({
      success: true,
      data: leadWithScore,
      message: 'Lead retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Create new lead
 */
const createLead = async (req, res, next) => {
  try {
    // Check for duplicates
    const duplicates = await detectDuplicateLeads(req.body);
    if (duplicates.length > 0) {
      // Merge with existing lead
      const existingLead = duplicates[0];
      
      // Update existing lead with new information
      Object.keys(req.body).forEach(key => {
        if (req.body[key] && key !== 'email' && key !== 'phone') {
          existingLead[key] = req.body[key];
        }
      });
      
      await existingLead.save();
      
      // Log merge activity
      await logLeadActivity(existingLead._id, 'merged', 'Lead merged with duplicate', req.user._id);
      
      return res.status(200).json({
        success: true,
        data: existingLead,
        message: 'Lead merged with existing duplicate',
        timestamp: new Date().toISOString()
      });
    }

    // Auto-assign based on territory
    if (req.body.address && !req.body.assignedTo?.agentId) {
      const agent = await autoAssignByTerritory(req.body.address);
      if (agent) {
        req.body.assignedTo = {
          agentId: agent._id,
          name: agent.name || agent.email
        };
      }
    }

    // Ensure assignedTo.agentId is set if not provided
    const userRole = req.user.role?.name || req.user.role;
    if (!req.body.assignedTo?.agentId && userRole === 'agent') {
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

    // Update agent workload
    if (lead.assignedTo?.agentId) {
      await updateAgentWorkload(lead.assignedTo.agentId, true);
    }

    // Log activity
    await logLeadActivity(lead._id, 'created', 'Lead created', req.user._id);

    // Calculate score
    const leadWithScore = {
      ...populatedLead,
      score: calculateLeadScore(populatedLead)
    };

    res.status(201).json({
      success: true,
      data: leadWithScore,
      message: 'Lead created successfully',
      timestamp: new Date().toISOString()
    });

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
    const userRole = req.user.role?.name || req.user.role;
    if (req.checkOwnership && userRole === 'agent') {
      if (lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    const oldAssignedAgent = lead.assignedTo?.agentId;

    // Update lead fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        lead[key] = req.body[key];
      }
    });

    lead.lastInteraction = new Date();
    await lead.save();

    // Update agent workload if assignment changed
    if (oldAssignedAgent && req.body.assignedTo?.agentId && 
        oldAssignedAgent.toString() !== req.body.assignedTo.agentId.toString()) {
      await updateAgentWorkload(oldAssignedAgent, false);
      await updateAgentWorkload(req.body.assignedTo.agentId, true);
    }

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    // Log activity
    await logLeadActivity(lead._id, 'updated', 'Lead updated', req.user._id);

    // Calculate score
    const leadWithScore = {
      ...updatedLead,
      score: calculateLeadScore(updatedLead)
    };

    res.status(200).json({
      success: true,
      data: leadWithScore,
      message: 'Lead updated successfully',
      timestamp: new Date().toISOString()
    });

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
    const userRole = req.user.role?.name || req.user.role;
    if (req.checkOwnership && userRole === 'agent') {
      if (lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    // Update agent workload
    if (lead.assignedTo?.agentId) {
      await updateAgentWorkload(lead.assignedTo.agentId, false);
    }

    await Lead.findByIdAndDelete(id);

    // Log activity
    await logLeadActivity(id, 'deleted', 'Lead deleted', req.user._id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Lead deleted successfully',
      timestamp: new Date().toISOString()
    });

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
    const userRole = req.user.role?.name || req.user.role;
    if (req.checkOwnership && userRole === 'agent') {
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

    // Log activity
    await logLeadActivity(lead._id, 'follow_up_added', `Follow-up added: ${followUpData.type}`, req.user._id);

    // Calculate score
    const leadWithScore = {
      ...updatedLead,
      score: calculateLeadScore(updatedLead)
    };

    res.status(200).json({
      success: true,
      data: leadWithScore,
      message: 'Follow-up added successfully',
      timestamp: new Date().toISOString()
    });

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
    const userRole = req.user.role?.name || req.user.role;
    if (req.checkOwnership && userRole === 'agent') {
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

    // Log activity
    await logLeadActivity(lead._id, 'note_added', 'Note added to lead', req.user._id);

    // Calculate score
    const leadWithScore = {
      ...updatedLead,
      score: calculateLeadScore(updatedLead)
    };

    res.status(200).json({
      success: true,
      data: leadWithScore,
      message: 'Note added successfully',
      timestamp: new Date().toISOString()
    });

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

    const oldAgentId = lead.assignedTo?.agentId;

    await lead.assignToAgent(agentId, agentName);

    // Update agent workloads
    if (oldAgentId && oldAgentId.toString() !== agentId.toString()) {
      await updateAgentWorkload(oldAgentId, false);
    }
    await updateAgentWorkload(agentId, true);

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    // Log activity
    await logLeadActivity(lead._id, 'assigned', `Lead assigned to ${agentName}`, req.user._id);

    // Calculate score
    const leadWithScore = {
      ...updatedLead,
      score: calculateLeadScore(updatedLead)
    };

    res.status(200).json({
      success: true,
      data: leadWithScore,
      message: 'Lead assigned successfully',
      timestamp: new Date().toISOString()
    });

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
    const userRole = req.user.role?.name || req.user.role;
    if (req.checkOwnership && userRole === 'agent') {
      if (lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    // Create client record from lead data
    const clientData = {
      displayName: lead.name,
      firstName: lead.name.split(' ')[0],
      lastName: lead.name.split(' ').slice(1).join(' ') || '',
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      city: lead.address ? lead.address.split(',').slice(-2, -1)[0]?.trim() : '',
      state: lead.address ? lead.address.split(',').slice(-1)[0]?.trim() : '',
      clientType: 'Individual',
      status: 'Active',
      assignedAgentId: lead.assignedTo?.agentId,
      leadId: lead._id,
      tags: lead.tags || [],
      additionalInfo: lead.additionalInfo || ''
    };

    const client = new Client(clientData);
    await client.save();

    // Transfer lead notes and follow-ups to client
    if (lead.notes && lead.notes.length > 0) {
      client.notes = lead.notes.map(note => ({
        content: `[Transferred from Lead ${lead.leadId}] ${note.content}`,
        createdBy: note.createdBy,
        createdAt: note.createdAt
      }));
    }

    // Transfer follow-ups as client interactions
    if (lead.followUps && lead.followUps.length > 0) {
      client.interactions = lead.followUps.map(followUp => ({
        type: followUp.type,
        date: followUp.date,
        time: followUp.time,
        description: followUp.outcome,
        nextAction: followUp.nextAction,
        createdBy: followUp.createdBy,
        createdAt: followUp.createdAt
      }));
    }

    await client.save();

    // Update lead status
    lead.status = 'Converted';
    lead.convertedToClientId = client._id;
    lead.lastInteraction = new Date();
    await lead.save();

    // Log activities
    await logLeadActivity(lead._id, 'converted', `Lead converted to client ${client.clientId}`, req.user._id);

    // Send WhatsApp welcome message (placeholder for now)
    // This will be implemented with WhatsApp API integration
    console.log(`Send welcome WhatsApp message to ${client.phone}`);

    // Update agent performance metrics
    if (lead.assignedTo?.agentId) {
      await User.findByIdAndUpdate(lead.assignedTo.agentId, {
        $inc: { 
          conversionCount: 1,
          leadCount: -1 
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        leadId: lead._id,
        clientId: client._id,
        clientNumber: client.clientId,
        message: 'Lead converted to client successfully'
      },
      message: 'Lead converted successfully',
      timestamp: new Date().toISOString()
    });

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
      conversionStats,
      avgScore
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
      ]),
      Lead.aggregate([
        { $match: filter },
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
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
      averageScore: avgScore[0]?.avgScore ? avgScore[0].avgScore.toFixed(1) : '0.0',
      topSources: sourceStats.sort((a, b) => b.count - a.count).slice(0, 5),
      priorityDistribution: priorityStats,
      period
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Lead statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Search leads
 */
const searchLeads = async (req, res, next) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

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

    // Calculate lead scores
    const leadsWithScores = leads.map(lead => ({
      ...lead,
      score: calculateLeadScore(lead)
    }));

    res.status(200).json({
      success: true,
      data: leadsWithScores,
      message: 'Search results retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get stale leads (no activity for specified days)
 */
const getStaleLeads = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - parseInt(days));

    const filter = {
      status: { $in: ['New', 'In Progress'] },
      $or: [
        { lastInteraction: { $lte: staleDate } },
        { lastInteraction: { $exists: false } }
      ]
    };

    // Apply role-based filtering
    if (req.ownershipFilter) {
      Object.assign(filter, req.ownershipFilter);
    }

    const staleLeads = await Lead.find(filter)
      .populate('assignedTo.agentId', 'name email')
      .sort({ lastInteraction: 1 })
      .lean();

    const leadsWithScores = staleLeads.map(lead => ({
      ...lead,
      score: calculateLeadScore(lead),
      daysSinceLastActivity: lead.lastInteraction ? 
        Math.floor((new Date() - new Date(lead.lastInteraction)) / (1000 * 60 * 60 * 24)) : 
        Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24))
    }));

    res.status(200).json({
      success: true,
      data: leadsWithScores,
      message: 'Stale leads retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get lead funnel report
 */
const getLeadFunnelReport = async (req, res, next) => {
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

    // Calculate date range
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

    // Get funnel data
    const [totalLeads, statusBreakdown, sourceBreakdown, conversionRate] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Lead.aggregate([
        { $match: filter },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Lead.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            converted: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const funnelReport = {
      totalLeads,
      statusBreakdown,
      sourceBreakdown,
      conversionRate: conversionRate[0] ? 
        ((conversionRate[0].converted / conversionRate[0].total) * 100).toFixed(2) : '0.00',
      period
    };

    res.status(200).json({
      success: true,
      data: funnelReport,
      message: 'Lead funnel report generated successfully',
      timestamp: new Date().toISOString()
    });

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
  searchLeads,
  getStaleLeads,
  getLeadFunnelReport
};
