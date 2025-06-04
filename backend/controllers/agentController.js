
const Agent = require('../models/Agent');
const { AppError } = require('../utils/errorHandler');
const { 
  successResponse, 
  paginatedResponse, 
  createdResponse, 
  updatedResponse, 
  deletedResponse 
} = require('../utils/responseHandler');
const mongoose = require('mongoose');

/**
 * Get all agents with filtering, pagination, and search
 */
const getAllAgents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      specialization,
      region,
      teamId,
      sortField = 'createdAt',
      sortDirection = 'desc',
      hireDate,
      minCommission,
      maxCommission
    } = req.query;

    // Build query
    let query = { isDeleted: false };

    // Apply role-based filtering
    if (req.ownershipFilter) {
      query = { ...query, ...req.ownershipFilter };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { agentId: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Specialization filter
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    // Region filter
    if (region) {
      query.region = { $regex: region, $options: 'i' };
    }

    // Team filter
    if (teamId) {
      query.teamId = teamId;
    }

    // Hire date filter
    if (hireDate) {
      query.hireDate = { $gte: new Date(hireDate) };
    }

    // Commission rate filters
    if (minCommission || maxCommission) {
      query.commissionRate = {};
      if (minCommission) query.commissionRate.$gte = Number(minCommission);
      if (maxCommission) query.commissionRate.$lte = Number(maxCommission);
    }

    // Pagination
    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNumber - 1) * pageSize;

    // Sorting
    const sortOptions = {};
    sortOptions[sortField] = sortDirection === 'asc' ? 1 : -1;

    // Execute query with population
    const [agents, totalItems] = await Promise.all([
      Agent.find(query)
        .populate('teamId', 'name region')
        .populate('managerId', 'name email')
        .populate('createdBy', 'name')
        .select('-documents -notes -bankDetails.accountNumber -bankDetails.routingNumber')
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Agent.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / pageSize);

    const pagination = {
      currentPage: pageNumber,
      totalPages,
      totalItems,
      itemsPerPage: pageSize
    };

    return paginatedResponse(res, agents, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get agent by ID
 */
const getAgentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    // Build query with ownership check
    let query = { _id: id, isDeleted: false };
    
    // Apply role-based filtering for agents
    if (req.user.role === 'agent' && req.user._id.toString() !== id) {
      throw new AppError('Access denied. You can only view your own profile.', 403);
    }

    const agent = await Agent.findOne(query)
      .populate('teamId', 'name region manager')
      .populate('managerId', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('notes.createdBy', 'name email')
      .lean();

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    return successResponse(res, { data: agent });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new agent
 */
const createAgent = async (req, res, next) => {
  try {
    const agentData = {
      ...req.body,
      createdBy: req.user._id
    };

    const agent = new Agent(agentData);
    await agent.save();

    // Populate the created agent
    const populatedAgent = await Agent.findById(agent._id)
      .populate('teamId', 'name region')
      .populate('createdBy', 'name email')
      .lean();

    return createdResponse(res, populatedAgent, 'Agent created successfully');
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new AppError(`${field} already exists`, 400);
    }
    next(error);
  }
};

/**
 * Update agent
 */
const updateAgent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && req.user._id.toString() !== id) {
      throw new AppError('Access denied. You can only update your own profile.', 403);
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const agent = await Agent.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('teamId', 'name region')
    .populate('updatedBy', 'name email')
    .lean();

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    return updatedResponse(res, agent, 'Agent updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new AppError(`${field} already exists`, 400);
    }
    next(error);
  }
};

/**
 * Delete agent (soft delete)
 */
const deleteAgent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    const agent = await Agent.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user._id,
        status: 'terminated'
      },
      { new: true }
    );

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    return deletedResponse(res, 'Agent deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload agent document
 */
const uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { documentType, name } = req.body;

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    const document = {
      name: name || req.file.originalname,
      type: documentType,
      url: `/uploads/agents/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id
    };

    const agent = await Agent.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $push: { documents: document } },
      { new: true }
    );

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    const uploadedDocument = agent.documents[agent.documents.length - 1];

    return createdResponse(res, uploadedDocument, 'Document uploaded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get agent documents
 */
const getAgentDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    const agent = await Agent.findOne(
      { _id: id, isDeleted: false },
      { documents: 1 }
    )
    .populate('documents.uploadedBy', 'name email')
    .lean();

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    return successResponse(res, { data: agent.documents });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete agent document
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(documentId)) {
      throw new AppError('Invalid ID provided', 400);
    }

    const agent = await Agent.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $pull: { documents: { _id: documentId } } },
      { new: true }
    );

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    return deletedResponse(res, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get clients assigned to agent
 */
const getAgentClients = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    // Import Client model (assuming it exists)
    const Client = require('../models/Client');

    let query = { assignedAgentId: id, isDeleted: false };
    
    if (status) {
      query.status = status;
    }

    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNumber - 1) * pageSize;

    const [clients, totalItems] = await Promise.all([
      Client.find(query)
        .select('name email phone status totalPolicies totalPremium createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Client.countDocuments(query)
    ]);

    const pagination = {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      itemsPerPage: pageSize
    };

    return paginatedResponse(res, clients, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get policies assigned to agent
 */
const getAgentPolicies = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    // Import Policy model (assuming it exists)
    const Policy = require('../models/Policy');

    let query = { assignedAgentId: id, isDeleted: false };
    
    if (status) {
      query.status = status;
    }

    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNumber - 1) * pageSize;

    const [policies, totalItems] = await Promise.all([
      Policy.find(query)
        .populate('clientId', 'name email')
        .select('policyNumber type status premium coverage startDate endDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Policy.countDocuments(query)
    ]);

    const pagination = {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      itemsPerPage: pageSize
    };

    return paginatedResponse(res, policies, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get agent commission details
 */
const getAgentCommissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, status } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    // Import Policy model for commission calculation
    const Policy = require('../models/Policy');

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let commissionFilter = { assignedAgentId: id, isDeleted: false };
    if (status) {
      commissionFilter['commission.paid'] = status === 'paid';
    }

    const policies = await Policy.find({ ...commissionFilter, ...dateFilter })
      .populate('clientId', 'name')
      .select('policyNumber premium commission createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const totalCommissions = policies.reduce((sum, policy) => 
      sum + (policy.commission?.amount || 0), 0
    );
    
    const paidCommissions = policies
      .filter(policy => policy.commission?.paid)
      .reduce((sum, policy) => sum + (policy.commission?.amount || 0), 0);
    
    const pendingCommissions = totalCommissions - paidCommissions;

    const commissionData = {
      totalCommissions,
      paidCommissions,
      pendingCommissions,
      commissionHistory: policies.map(policy => ({
        _id: policy._id,
        policyId: policy._id,
        policyNumber: policy.policyNumber,
        clientName: policy.clientId?.name,
        amount: policy.commission?.amount || 0,
        rate: policy.commission?.rate || 0,
        status: policy.commission?.paid ? 'paid' : 'pending',
        paidDate: policy.commission?.paidDate,
        createdAt: policy.createdAt
      }))
    };

    return successResponse(res, { data: commissionData });
  } catch (error) {
    next(error);
  }
};

/**
 * Get agent performance data
 */
const getAgentPerformance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period = 'year', year = new Date().getFullYear() } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    const agent = await Agent.findOne(
      { _id: id, isDeleted: false },
      { performance: 1, name: 1 }
    ).lean();

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    // Get detailed performance data from policies and clients
    const Policy = require('../models/Policy');
    const Client = require('../models/Client');

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const [policies, clients] = await Promise.all([
      Policy.find({
        assignedAgentId: id,
        createdAt: { $gte: startOfYear, $lte: endOfYear },
        isDeleted: false
      }).lean(),
      Client.find({
        assignedAgentId: id,
        createdAt: { $gte: startOfYear, $lte: endOfYear },
        isDeleted: false
      }).lean()
    ]);

    // Calculate monthly data
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

      const monthPolicies = policies.filter(p => 
        p.createdAt >= monthStart && p.createdAt <= monthEnd
      );
      const monthClients = clients.filter(c => 
        c.createdAt >= monthStart && c.createdAt <= monthEnd
      );

      monthlyData.push({
        month: `${year}-${String(month + 1).padStart(2, '0')}`,
        newClients: monthClients.length,
        newPolicies: monthPolicies.length,
        premium: monthPolicies.reduce((sum, p) => sum + (p.premium?.amount || 0), 0),
        commission: monthPolicies.reduce((sum, p) => sum + (p.commission?.amount || 0), 0)
      });
    }

    const performanceData = {
      overview: agent.performance,
      monthlyData,
      targets: {
        monthly: agent.performance.monthlyTargets,
        quarterly: agent.performance.quarterlyTargets,
        annual: agent.performance.annualTargets
      },
      achievements: agent.performance.achievements || []
    };

    return successResponse(res, { data: performanceData });
  } catch (error) {
    next(error);
  }
};

/**
 * Update agent performance targets
 */
const updatePerformanceTargets = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { monthly, quarterly, annual } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    const updateData = {};
    if (monthly) updateData['performance.monthlyTargets'] = monthly;
    if (quarterly) updateData['performance.quarterlyTargets'] = quarterly;
    if (annual) updateData['performance.annualTargets'] = annual;

    updateData.updatedBy = req.user._id;

    const agent = await Agent.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    ).lean();

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    return updatedResponse(res, agent.performance, 'Performance targets updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add note to agent
 */
const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, isPrivate = false, tags = [], priority = 'medium' } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    const note = {
      content,
      createdBy: req.user._id,
      isPrivate,
      tags,
      priority
    };

    const agent = await Agent.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $push: { notes: note } },
      { new: true }
    );

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    const addedNote = agent.notes[agent.notes.length - 1];

    return createdResponse(res, addedNote, 'Note added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get agent notes
 */
const getAgentNotes = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid agent ID', 400);
    }

    const agent = await Agent.findOne(
      { _id: id, isDeleted: false },
      { notes: 1 }
    )
    .populate('notes.createdBy', 'name email')
    .lean();

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    // Filter private notes for non-admin users
    let notes = agent.notes;
    if (req.user.role === 'agent' && req.user._id.toString() !== id) {
      notes = notes.filter(note => !note.isPrivate);
    }

    return successResponse(res, { data: notes });
  } catch (error) {
    next(error);
  }
};

/**
 * Search agents
 */
const searchAgents = async (req, res, next) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const searchResults = await Agent.find({
      $and: [
        { isDeleted: false },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } },
            { agentId: { $regex: query, $options: 'i' } },
            { specialization: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name email phone agentId specialization status performance.totalPremium')
    .limit(parseInt(limit))
    .lean();

    return successResponse(res, { data: searchResults });
  } catch (error) {
    next(error);
  }
};

/**
 * Get agent statistics
 */
const getAgentStats = async (req, res, next) => {
  try {
    const [
      totalAgents,
      activeAgents,
      inactiveAgents,
      onboardingAgents,
      avgCommissionRate,
      topPerformers,
      specializationStats,
      regionStats
    ] = await Promise.all([
      Agent.countDocuments({ isDeleted: false }),
      Agent.countDocuments({ status: 'active', isDeleted: false }),
      Agent.countDocuments({ status: 'inactive', isDeleted: false }),
      Agent.countDocuments({ status: 'onboarding', isDeleted: false }),
      Agent.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, avgRate: { $avg: '$commissionRate' } } }
      ]),
      Agent.find({ isDeleted: false })
        .select('name performance.totalPremium performance.conversionRate')
        .sort({ 'performance.totalPremium': -1 })
        .limit(5)
        .lean(),
      Agent.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$specialization', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Agent.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      totalAgents,
      activeAgents,
      inactiveAgents,
      onboardingAgents,
      avgCommissionRate: avgCommissionRate[0]?.avgRate || 0,
      topPerformers,
      bySpecialization: specializationStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byRegion: regionStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    return successResponse(res, { data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Get performance rankings
 */
const getPerformanceRankings = async (req, res, next) => {
  try {
    const { period = 'month', metric = 'totalPremium' } = req.query;

    const agents = await Agent.find({ 
      status: 'active', 
      isDeleted: false 
    })
    .select('name performance specialization region')
    .sort({ [`performance.${metric}`]: -1 })
    .limit(20)
    .lean();

    return successResponse(res, { data: agents });
  } catch (error) {
    next(error);
  }
};

/**
 * Get agents with expiring licenses
 */
const getExpiringLicenses = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const agents = await Agent.find({
      licenseExpiry: { $lte: futureDate },
      status: { $ne: 'terminated' },
      isDeleted: false
    })
    .select('name email phone licenseNumber licenseExpiry')
    .sort({ licenseExpiry: 1 })
    .lean();

    return successResponse(res, { data: agents });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update agents
 */
const bulkUpdateAgents = async (req, res, next) => {
  try {
    const { agentIds, updateData } = req.body;

    if (!Array.isArray(agentIds) || agentIds.length === 0) {
      throw new AppError('Agent IDs array is required', 400);
    }

    const result = await Agent.updateMany(
      { 
        _id: { $in: agentIds },
        isDeleted: false
      },
      { 
        ...updateData,
        updatedBy: req.user._id
      }
    );

    return updatedResponse(res, result, `${result.modifiedCount} agents updated successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Export agents data
 */
const exportAgents = async (req, res, next) => {
  try {
    const { format = 'json', ...filters } = req.query;

    // Build query from filters
    let query = { isDeleted: false };
    
    if (filters.status) query.status = filters.status;
    if (filters.specialization) query.specialization = filters.specialization;
    if (filters.region) query.region = filters.region;

    const agents = await Agent.find(query)
      .populate('teamId', 'name')
      .select('-documents -notes -bankDetails.accountNumber -bankDetails.routingNumber')
      .lean();

    // Format data for export
    const exportData = agents.map(agent => ({
      agentId: agent.agentId,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      status: agent.status,
      specialization: agent.specialization,
      region: agent.region,
      team: agent.teamId?.name,
      licenseNumber: agent.licenseNumber,
      licenseExpiry: agent.licenseExpiry,
      hireDate: agent.hireDate,
      commissionRate: agent.commissionRate,
      clientsCount: agent.performance?.clientsCount || 0,
      policiesCount: agent.performance?.policiesCount || 0,
      totalPremium: agent.performance?.totalPremium || 0,
      createdAt: agent.createdAt
    }));

    return successResponse(res, { 
      data: exportData,
      format,
      exportedAt: new Date(),
      totalRecords: exportData.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  uploadDocument,
  getAgentDocuments,
  deleteDocument,
  getAgentClients,
  getAgentPolicies,
  getAgentCommissions,
  getAgentPerformance,
  updatePerformanceTargets,
  addNote,
  getAgentNotes,
  searchAgents,
  getAgentStats,
  getPerformanceRankings,
  getExpiringLicenses,
  bulkUpdateAgents,
  exportAgents
};
