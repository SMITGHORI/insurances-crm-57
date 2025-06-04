
const Policy = require('../models/Policy');
const Client = require('../models/Client');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse, paginatedResponse, createdResponse, updatedResponse, deletedResponse } = require('../utils/responseHandler');
const fs = require('fs').promises;
const path = require('path');

/**
 * Get all policies with filtering, pagination, and search
 */
const getAllPolicies = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      clientId,
      agentId,
      sortField = 'createdAt',
      sortDirection = 'desc',
      minPremium,
      maxPremium,
      startDate,
      endDate
    } = req.query;

    // Build filter object
    let filter = { isDeleted: false };

    // Apply role-based filtering
    if (req.ownershipFilter) {
      filter = { ...filter, ...req.ownershipFilter };
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { subType: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Type filter
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Client filter
    if (clientId) {
      filter.clientId = clientId;
    }

    // Agent filter
    if (agentId) {
      filter.assignedAgentId = agentId;
    }

    // Premium range filter
    if (minPremium || maxPremium) {
      filter['premium.amount'] = {};
      if (minPremium) filter['premium.amount'].$gte = parseFloat(minPremium);
      if (maxPremium) filter['premium.amount'].$lte = parseFloat(maxPremium);
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const currentPage = parseInt(page);
    const itemsPerPage = Math.min(parseInt(limit), 100);
    const skip = (currentPage - 1) * itemsPerPage;

    // Sort object
    const sort = {};
    sort[sortField] = sortDirection === 'desc' ? -1 : 1;

    // Execute query with population
    const [policies, totalItems] = await Promise.all([
      Policy.find(filter)
        .populate('clientId', 'name email phone type businessName')
        .populate('assignedAgentId', 'name email phone')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(itemsPerPage)
        .lean(),
      Policy.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage
    };

    return paginatedResponse(res, policies, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get policy by ID
 */
const getPolicyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let filter = { _id: id, isDeleted: false };

    // Apply ownership filter for agents
    if (req.ownershipFilter) {
      filter = { ...filter, ...req.ownershipFilter };
    }

    const policy = await Policy.findOne(filter)
      .populate('clientId', 'name email phone type businessName address')
      .populate('assignedAgentId', 'name email phone role')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('documents.uploadedBy', 'name email')
      .populate('notes.createdBy', 'name email')
      .populate('renewalHistory.agentId', 'name email');

    if (!policy) {
      throw new AppError('Policy not found', 404);
    }

    return successResponse(res, { data: policy });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new policy
 */
const createPolicy = async (req, res, next) => {
  try {
    // Verify client exists
    const client = await Client.findById(req.body.clientId);
    if (!client) {
      throw new AppError('Client not found', 404);
    }

    // Verify agent exists
    const agent = await User.findById(req.body.assignedAgentId);
    if (!agent || agent.role !== 'agent') {
      throw new AppError('Assigned agent not found', 404);
    }

    // Generate policy number if not provided
    if (!req.body.policyNumber) {
      const year = new Date().getFullYear();
      const count = await Policy.countDocuments({ 
        policyNumber: { $regex: `^POL-${year}-` } 
      });
      req.body.policyNumber = `POL-${year}-${String(count + 1).padStart(3, '0')}`;
    }

    // Check for duplicate policy number
    const existingPolicy = await Policy.findOne({ 
      policyNumber: req.body.policyNumber 
    });
    if (existingPolicy) {
      throw new AppError('Policy number already exists', 400);
    }

    // Set creator
    req.body.createdBy = req.user._id;

    // Create policy
    const policy = new Policy(req.body);
    await policy.save();

    // Populate the created policy
    const populatedPolicy = await Policy.findById(policy._id)
      .populate('clientId', 'name email phone')
      .populate('assignedAgentId', 'name email');

    return createdResponse(res, populatedPolicy, 'Policy created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update policy
 */
const updatePolicy = async (req, res, next) => {
  try {
    const { id } = req.params;

    let filter = { _id: id, isDeleted: false };

    // Apply ownership filter for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      filter[req.ownerField] = req.user._id;
    }

    const policy = await Policy.findOne(filter);
    if (!policy) {
      throw new AppError('Policy not found or access denied', 404);
    }

    // Verify client exists if clientId is being updated
    if (req.body.clientId && req.body.clientId !== policy.clientId.toString()) {
      const client = await Client.findById(req.body.clientId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }
    }

    // Verify agent exists if assignedAgentId is being updated
    if (req.body.assignedAgentId && req.body.assignedAgentId !== policy.assignedAgentId.toString()) {
      const agent = await User.findById(req.body.assignedAgentId);
      if (!agent || agent.role !== 'agent') {
        throw new AppError('Assigned agent not found', 404);
      }
    }

    // Set updater
    req.body.updatedBy = req.user._id;

    // Update policy
    Object.assign(policy, req.body);
    await policy.save();

    // Populate the updated policy
    const populatedPolicy = await Policy.findById(policy._id)
      .populate('clientId', 'name email phone')
      .populate('assignedAgentId', 'name email');

    return updatedResponse(res, populatedPolicy, 'Policy updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete policy (soft delete)
 */
const deletePolicy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findOne({ _id: id, isDeleted: false });
    if (!policy) {
      throw new AppError('Policy not found', 404);
    }

    // Perform soft delete
    await policy.softDelete(req.user._id);

    return deletedResponse(res, 'Policy deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload policy document
 */
const uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { documentType, name } = req.body;

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    let filter = { _id: id, isDeleted: false };

    // Apply ownership filter for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      filter[req.ownerField] = req.user._id;
    }

    const policy = await Policy.findOne(filter);
    if (!policy) {
      throw new AppError('Policy not found or access denied', 404);
    }

    // Create document object
    const document = {
      name: name || req.file.originalname,
      type: documentType,
      url: `/uploads/policies/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id
    };

    // Add document to policy
    policy.documents.push(document);
    await policy.save();

    // Get the added document
    const addedDocument = policy.documents[policy.documents.length - 1];

    return createdResponse(res, addedDocument, 'Document uploaded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get policy documents
 */
const getPolicyDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;

    let filter = { _id: id, isDeleted: false };

    // Apply ownership filter for agents
    if (req.ownershipFilter) {
      filter = { ...filter, ...req.ownershipFilter };
    }

    const policy = await Policy.findOne(filter)
      .select('documents')
      .populate('documents.uploadedBy', 'name email');

    if (!policy) {
      throw new AppError('Policy not found or access denied', 404);
    }

    return successResponse(res, { data: policy.documents });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete policy document
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;

    let filter = { _id: id, isDeleted: false };

    // Apply ownership filter for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      filter[req.ownerField] = req.user._id;
    }

    const policy = await Policy.findOne(filter);
    if (!policy) {
      throw new AppError('Policy not found or access denied', 404);
    }

    const document = policy.documents.id(documentId);
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(__dirname, '..', 'uploads', 'policies', path.basename(document.url));
      await fs.unlink(filePath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
    }

    // Remove document from policy
    policy.documents.pull(documentId);
    await policy.save();

    return deletedResponse(res, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add payment record
 */
const addPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    let filter = { _id: id, isDeleted: false };

    // Apply ownership filter for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      filter[req.ownerField] = req.user._id;
    }

    const policy = await Policy.findOne(filter);
    if (!policy) {
      throw new AppError('Policy not found or access denied', 404);
    }

    // Add payment to policy
    const payment = await policy.addPayment(req.body);
    const addedPayment = policy.paymentHistory[policy.paymentHistory.length - 1];

    return createdResponse(res, addedPayment, 'Payment record added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get policy payment history
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    let filter = { _id: id, isDeleted: false };

    // Apply ownership filter for agents
    if (req.ownershipFilter) {
      filter = { ...filter, ...req.ownershipFilter };
    }

    const policy = await Policy.findOne(filter).select('paymentHistory');
    if (!policy) {
      throw new AppError('Policy not found or access denied', 404);
    }

    return successResponse(res, { data: policy.paymentHistory });
  } catch (error) {
    next(error);
  }
};

/**
 * Renew policy
 */
const renewPolicy = async (req, res, next) => {
  try {
    const { id } = req.params;

    let filter = { _id: id, isDeleted: false };

    // Apply ownership filter for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      filter[req.ownerField] = req.user._id;
    }

    const policy = await Policy.findOne(filter);
    if (!policy) {
      throw new AppError('Policy not found or access denied', 404);
    }

    // Set default agent to current user if not provided
    if (!req.body.agentId) {
      req.body.agentId = req.user._id;
    }

    // Renew the policy
    await policy.renew(req.body);

    // Populate and return updated policy
    const updatedPolicy = await Policy.findById(policy._id)
      .populate('clientId', 'name email phone')
      .populate('assignedAgentId', 'name email');

    return updatedResponse(res, updatedPolicy, 'Policy renewed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add note to policy
 */
const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    let filter = { _id: id, isDeleted: false };

    // Apply ownership filter for agents
    if (req.checkOwnership && req.user.role === 'agent') {
      filter[req.ownerField] = req.user._id;
    }

    const policy = await Policy.findOne(filter);
    if (!policy) {
      throw new AppError('Policy not found or access denied', 404);
    }

    // Set note creator
    req.body.createdBy = req.user._id;

    // Add note to policy
    await policy.addNote(req.body);
    const addedNote = policy.notes[policy.notes.length - 1];

    // Populate the note creator
    await policy.populate('notes.createdBy', 'name email');

    return createdResponse(res, addedNote, 'Note added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get policy notes
 */
const getPolicyNotes = async (req, res, next) => {
  try {
    const { id } = req.params;

    let filter = { _id: id, isDeleted: false };

    // Apply ownership filter for agents
    if (req.ownershipFilter) {
      filter = { ...filter, ...req.ownershipFilter };
    }

    const policy = await Policy.findOne(filter)
      .select('notes')
      .populate('notes.createdBy', 'name email');

    if (!policy) {
      throw new AppError('Policy not found or access denied', 404);
    }

    return successResponse(res, { data: policy.notes });
  } catch (error) {
    next(error);
  }
};

/**
 * Search policies
 */
const searchPolicies = async (req, res, next) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400);
    }

    let filter = {
      isDeleted: false,
      $or: [
        { policyNumber: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { subType: { $regex: query, $options: 'i' } }
      ]
    };

    // Apply role-based filtering
    if (req.ownershipFilter) {
      filter = { ...filter, ...req.ownershipFilter };
    }

    const policies = await Policy.find(filter)
      .populate('clientId', 'name email')
      .select('policyNumber type status company premium.amount clientId')
      .limit(Math.min(parseInt(limit), 50))
      .lean();

    return successResponse(res, { data: policies });
  } catch (error) {
    next(error);
  }
};

/**
 * Get policies by agent
 */
const getPoliciesByAgent = async (req, res, next) => {
  try {
    const { agentId } = req.params;

    // Check if user can access this agent's data
    if (req.user.role === 'agent' && req.user._id.toString() !== agentId) {
      throw new AppError('Access denied', 403);
    }

    const policies = await Policy.findByAgent(agentId);

    return successResponse(res, { data: policies });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign policy to agent
 */
const assignPolicyToAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    // Verify agent exists
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      throw new AppError('Agent not found', 404);
    }

    const policy = await Policy.findOne({ _id: id, isDeleted: false });
    if (!policy) {
      throw new AppError('Policy not found', 404);
    }

    policy.assignedAgentId = agentId;
    policy.updatedBy = req.user._id;
    await policy.save();

    const updatedPolicy = await Policy.findById(policy._id)
      .populate('assignedAgentId', 'name email');

    return updatedResponse(res, updatedPolicy, 'Policy assigned successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get policy statistics
 */
const getPolicyStats = async (req, res, next) => {
  try {
    // Get basic statistics
    const [basicStats] = await Policy.getStatistics();

    // Get statistics by type
    const typeStats = await Policy.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premium.amount' }
        }
      }
    ]);

    // Get statistics by status
    const statusStats = await Policy.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent policies count
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPolicies = await Policy.countDocuments({
      isDeleted: false,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get renewals this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const renewalsThisMonth = await Policy.countDocuments({
      isDeleted: false,
      'renewalHistory.renewalDate': { $gte: startOfMonth }
    });

    const stats = {
      ...basicStats,
      byType: typeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byStatus: statusStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentPolicies,
      renewalsThisMonth
    };

    return successResponse(res, { data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Get policies expiring within specified days
 */
const getExpiringPolicies = async (req, res, next) => {
  try {
    const { days = 30 } = req.params;

    let filter = { isDeleted: false };

    // Apply role-based filtering
    if (req.ownershipFilter) {
      filter = { ...filter, ...req.ownershipFilter };
    }

    const policies = await Policy.findExpiringSoon(parseInt(days))
      .populate('clientId', 'name email phone')
      .populate('assignedAgentId', 'name email');

    return successResponse(res, { data: policies });
  } catch (error) {
    next(error);
  }
};

/**
 * Get policies due for renewal
 */
const getPoliciesDueForRenewal = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    let filter = {
      isDeleted: false,
      endDate: { $lte: futureDate, $gt: new Date() },
      status: 'active'
    };

    // Apply role-based filtering
    if (req.ownershipFilter) {
      filter = { ...filter, ...req.ownershipFilter };
    }

    const policies = await Policy.find(filter)
      .populate('clientId', 'name email phone')
      .populate('assignedAgentId', 'name email')
      .sort({ endDate: 1 });

    return successResponse(res, { data: policies });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk assign policies to agents
 */
const bulkAssignPolicies = async (req, res, next) => {
  try {
    const { policyIds, agentId } = req.body;

    // Verify agent exists
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      throw new AppError('Agent not found', 404);
    }

    // Update policies
    const result = await Policy.updateMany(
      { _id: { $in: policyIds }, isDeleted: false },
      { 
        assignedAgentId: agentId,
        updatedBy: req.user._id,
        updatedAt: new Date()
      }
    );

    return successResponse(res, { 
      data: { 
        updatedCount: result.modifiedCount,
        assignedAgent: agent.name
      }
    }, `${result.modifiedCount} policies assigned successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Export policies data
 */
const exportPolicies = async (req, res, next) => {
  try {
    const { format = 'json', ...filters } = req.query;

    let filter = { isDeleted: false };

    // Apply filters
    if (filters.status) filter.status = filters.status;
    if (filters.type) filter.type = filters.type;
    if (filters.agentId) filter.assignedAgentId = filters.agentId;

    const policies = await Policy.find(filter)
      .populate('clientId', 'name email phone')
      .populate('assignedAgentId', 'name email')
      .select('-documents -paymentHistory -renewalHistory -notes')
      .lean();

    // Format data based on requested format
    if (format === 'csv') {
      // Implementation for CSV export would go here
      throw new AppError('CSV export not implemented yet', 501);
    }

    return successResponse(res, { data: policies });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  uploadDocument,
  getPolicyDocuments,
  deleteDocument,
  addPayment,
  getPaymentHistory,
  renewPolicy,
  addNote,
  getPolicyNotes,
  searchPolicies,
  getPoliciesByAgent,
  assignPolicyToAgent,
  getPolicyStats,
  getExpiringPolicies,
  getPoliciesDueForRenewal,
  bulkAssignPolicies,
  exportPolicies
};
