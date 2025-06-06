
const Claim = require('../models/Claim');
const Client = require('../models/Client');
const Policy = require('../models/Policy');
const { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  createdResponse, 
  updatedResponse, 
  deletedResponse 
} = require('../utils/responseHandler');
const { AppError } = require('../utils/errorHandler');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get all claims with filtering, pagination, and search
 */
const getAllClaims = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      claimType,
      priority,
      assignedTo,
      clientId,
      policyId,
      minAmount,
      maxAmount,
      dateFrom,
      dateTo,
      sortField = 'createdAt',
      sortDirection = 'desc'
    } = req.query;

    // Build filter conditions
    const filter = { isDeleted: { $ne: true } };

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedTo = req.user._id;
    } else if (req.user.role === 'manager' && req.user.teamId) {
      // Add team-based filtering logic here
      // filter.assignedTo = { $in: teamAgentIds };
    }

    // Apply search filters
    if (search) {
      filter.$or = [
        { claimNumber: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    if (status && status !== 'All') filter.status = status;
    if (claimType) filter.claimType = claimType;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (clientId) filter.clientId = clientId;
    if (policyId) filter.policyId = policyId;

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.claimAmount = {};
      if (minAmount) filter.claimAmount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.claimAmount.$lte = parseFloat(maxAmount);
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.reportedDate = {};
      if (dateFrom) filter.reportedDate.$gte = new Date(dateFrom);
      if (dateTo) filter.reportedDate.$lte = new Date(dateTo);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions = {};
    sortOptions[sortField] = sortDirection === 'desc' ? -1 : 1;

    // Execute query
    const [claims, totalCount] = await Promise.all([
      Claim.find(filter)
        .populate('clientId', 'firstName lastName email phone')
        .populate('policyId', 'policyNumber policyType')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Claim.countDocuments(filter)
    ]);

    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalItems: totalCount,
      itemsPerPage: limitNum
    };

    return paginatedResponse(res, claims, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get claim by ID
 */
const getClaimById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid claim ID', 400);
    }

    const claim = await Claim.findOne({ 
      _id: id, 
      isDeleted: { $ne: true } 
    })
      .populate('clientId')
      .populate('policyId')
      .populate('assignedTo', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName')
      .populate('timeline.createdBy', 'firstName lastName')
      .populate('notes.createdBy', 'firstName lastName')
      .populate('documents.uploadedBy', 'firstName lastName');

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && claim.assignedTo._id.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }

    return successResponse(res, { data: claim });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new claim
 */
const createClaim = async (req, res, next) => {
  try {
    const claimData = req.body;
    claimData.createdBy = req.user._id;
    claimData.updatedBy = req.user._id;

    // Validate client exists
    const client = await Client.findById(claimData.clientId);
    if (!client) {
      throw new AppError('Client not found', 404);
    }

    // Validate policy exists and is active
    const policy = await Policy.findOne({ 
      _id: claimData.policyId, 
      status: 'Active' 
    });
    if (!policy) {
      throw new AppError('Active policy not found', 404);
    }

    // Validate claim amount doesn't exceed policy coverage
    if (claimData.claimAmount > policy.coverageAmount) {
      throw new AppError('Claim amount exceeds policy coverage limit', 400);
    }

    const claim = new Claim(claimData);
    await claim.save();

    // Add initial timeline event
    await claim.addTimelineEvent(
      'Claim Reported',
      'Initial claim submission',
      'reported',
      req.user._id
    );

    // Populate the response
    await claim.populate([
      { path: 'clientId', select: 'firstName lastName email' },
      { path: 'policyId', select: 'policyNumber policyType' },
      { path: 'assignedTo', select: 'firstName lastName email' }
    ]);

    return createdResponse(res, claim, 'Claim created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update claim
 */
const updateClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedBy = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid claim ID', 400);
    }

    const claim = await Claim.findOne({ 
      _id: id, 
      isDeleted: { $ne: true } 
    });

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && claim.assignedTo.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }

    // Validate approved amount doesn't exceed claim amount
    if (updateData.approvedAmount && updateData.approvedAmount > claim.claimAmount) {
      throw new AppError('Approved amount cannot exceed claim amount', 400);
    }

    // Update the claim
    Object.assign(claim, updateData);
    await claim.save();

    // Populate the response
    await claim.populate([
      { path: 'clientId', select: 'firstName lastName email' },
      { path: 'policyId', select: 'policyNumber policyType' },
      { path: 'assignedTo', select: 'firstName lastName email' }
    ]);

    return updatedResponse(res, claim, 'Claim updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete claim (soft delete)
 */
const deleteClaim = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid claim ID', 400);
    }

    const claim = await Claim.findOne({ 
      _id: id, 
      isDeleted: { $ne: true } 
    });

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    await claim.softDelete(req.user._id);

    return deletedResponse(res, 'Claim deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload claim document
 */
const uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { documentType, name } = req.body;
    const file = req.file;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    const claim = await Claim.findOne({ 
      _id: id, 
      isDeleted: { $ne: true } 
    });

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && claim.assignedTo.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }

    const document = {
      name: name || file.originalname,
      fileName: file.filename,
      fileSize: file.size,
      mimeType: file.mimetype,
      documentType,
      filePath: file.path,
      uploadedBy: req.user._id
    };

    claim.documents.push(document);
    await claim.save();

    // Add timeline event
    await claim.addTimelineEvent(
      'Document Uploaded',
      `${documentType} document uploaded: ${document.name}`,
      'document_uploaded',
      req.user._id
    );

    return createdResponse(res, document, 'Document uploaded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get claim documents
 */
const getClaimDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const claim = await Claim.findOne({ 
      _id: id, 
      isDeleted: { $ne: true } 
    })
      .populate('documents.uploadedBy', 'firstName lastName')
      .select('documents');

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    return successResponse(res, { data: claim.documents });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete claim document
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;

    const claim = await Claim.findOne({ 
      _id: id, 
      isDeleted: { $ne: true } 
    });

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    const documentIndex = claim.documents.findIndex(
      doc => doc._id.toString() === documentId
    );

    if (documentIndex === -1) {
      throw new AppError('Document not found', 404);
    }

    const document = claim.documents[documentIndex];

    // Delete file from filesystem
    try {
      await fs.unlink(document.filePath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
    }

    // Remove document from array
    claim.documents.splice(documentIndex, 1);
    await claim.save();

    return deletedResponse(res, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update claim status
 */
const updateClaimStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason, approvedAmount } = req.body;

    const claim = await Claim.findOne({ 
      _id: id, 
      isDeleted: { $ne: true } 
    });

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    // Store old status for timeline
    const oldStatus = claim.status;
    
    // Update claim
    claim.status = status;
    claim.updatedBy = req.user._id;
    
    if (approvedAmount !== undefined) {
      claim.approvedAmount = approvedAmount;
    }
    
    if (status === 'Settled') {
      claim.actualSettlement = new Date();
    }

    await claim.save();

    // Add timeline event
    await claim.addTimelineEvent(
      `Status Changed`,
      `Status changed from ${oldStatus} to ${status}. ${reason || ''}`,
      status.toLowerCase().replace(' ', '_'),
      req.user._id,
      { oldStatus, newStatus: status, reason }
    );

    return updatedResponse(res, claim, 'Claim status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add note to claim
 */
const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, type, priority } = req.body;

    const claim = await Claim.findOne({ 
      _id: id, 
      isDeleted: { $ne: true } 
    });

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    await claim.addNote(content, type, priority, req.user._id);

    // Add timeline event
    await claim.addTimelineEvent(
      'Note Added',
      `New ${type || 'internal'} note added`,
      'note_added',
      req.user._id
    );

    const newNote = claim.notes[claim.notes.length - 1];
    await claim.populate('notes.createdBy', 'firstName lastName');

    return createdResponse(res, newNote, 'Note added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get claim notes
 */
const getClaimNotes = async (req, res, next) => {
  try {
    const { id } = req.params;

    const claim = await Claim.findOne({ 
      _id: id, 
      isDeleted: { $ne: true } 
    })
      .populate('notes.createdBy', 'firstName lastName')
      .select('notes');

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    return successResponse(res, { data: claim.notes });
  } catch (error) {
    next(error);
  }
};

/**
 * Search claims
 */
const searchClaims = async (req, res, next) => {
  try {
    const { query } = req.params;
    const { limit = 20 } = req.query;

    const searchOptions = {
      limit: parseInt(limit)
    };

    // Add role-based filtering
    if (req.user.role === 'agent') {
      searchOptions.assignedTo = req.user._id;
    }

    const claims = await Claim.searchClaims(query, searchOptions);

    return successResponse(res, { data: claims });
  } catch (error) {
    next(error);
  }
};

/**
 * Get claims statistics
 */
const getClaimsStats = async (req, res, next) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        reportedDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const now = new Date();
      let fromDate;
      
      switch (period) {
        case 'day':
          fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          fromDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      dateFilter = { reportedDate: { $gte: fromDate } };
    }

    const baseFilter = { 
      isDeleted: { $ne: true },
      ...dateFilter
    };

    // Role-based filtering
    if (req.user.role === 'agent') {
      baseFilter.assignedTo = req.user._id;
    }

    const [
      totalClaims,
      statusBreakdown,
      typeBreakdown,
      priorityBreakdown,
      amountStats
    ] = await Promise.all([
      Claim.countDocuments(baseFilter),
      
      Claim.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$claimAmount' } } }
      ]),
      
      Claim.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$claimType', count: { $sum: 1 }, totalAmount: { $sum: '$claimAmount' } } }
      ]),
      
      Claim.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      
      Claim.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            totalClaimAmount: { $sum: '$claimAmount' },
            totalApprovedAmount: { $sum: '$approvedAmount' },
            averageClaimAmount: { $avg: '$claimAmount' },
            maxClaimAmount: { $max: '$claimAmount' },
            minClaimAmount: { $min: '$claimAmount' }
          }
        }
      ])
    ]);

    const stats = {
      totalClaims,
      statusBreakdown,
      typeBreakdown,
      priorityBreakdown,
      amountStats: amountStats[0] || {},
      period,
      dateRange: {
        startDate: dateFilter.reportedDate?.$gte || null,
        endDate: dateFilter.reportedDate?.$lte || null
      }
    };

    return successResponse(res, { data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const baseFilter = { isDeleted: { $ne: true } };
    
    // Role-based filtering
    if (req.user.role === 'agent') {
      baseFilter.assignedTo = req.user._id;
    }

    const [
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      settledClaims
    ] = await Promise.all([
      Claim.countDocuments({ ...baseFilter, status: { $in: ['Reported', 'Under Review', 'Pending'] } }),
      Claim.countDocuments({ ...baseFilter, status: 'Approved' }),
      Claim.countDocuments({ ...baseFilter, status: 'Rejected' }),
      Claim.countDocuments({ ...baseFilter, status: 'Settled' })
    ]);

    const stats = {
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      settledClaims,
      totalClaims: pendingClaims + approvedClaims + rejectedClaims + settledClaims
    };

    return successResponse(res, { data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update claims
 */
const bulkUpdateClaims = async (req, res, next) => {
  try {
    const { claimIds, updateData } = req.body;

    const filter = { 
      _id: { $in: claimIds }, 
      isDeleted: { $ne: true } 
    };

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedTo = req.user._id;
    }

    const result = await Claim.updateMany(
      filter,
      { 
        ...updateData,
        updatedBy: req.user._id,
        updatedAt: new Date()
      }
    );

    return updatedResponse(res, result, `${result.modifiedCount} claims updated successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Export claims data
 */
const exportClaims = async (req, res, next) => {
  try {
    // Implementation would depend on your export requirements
    // This is a placeholder for the export functionality
    const filter = { isDeleted: { $ne: true } };
    
    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedTo = req.user._id;
    }

    const claims = await Claim.find(filter)
      .populate('clientId', 'firstName lastName email')
      .populate('policyId', 'policyNumber policyType')
      .populate('assignedTo', 'firstName lastName')
      .lean();

    return successResponse(res, { 
      data: claims,
      message: 'Claims data exported successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClaims,
  getClaimById,
  createClaim,
  updateClaim,
  deleteClaim,
  uploadDocument,
  getClaimDocuments,
  deleteDocument,
  updateClaimStatus,
  addNote,
  getClaimNotes,
  searchClaims,
  getClaimsStats,
  getDashboardStats,
  bulkUpdateClaims,
  exportClaims
};
