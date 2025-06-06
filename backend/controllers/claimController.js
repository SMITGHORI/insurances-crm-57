
const Claim = require('../models/Claim');
const { generateClaimNumber } = require('../utils/generateId');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

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

    // Build filter object
    const filter = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (status) {
      filter.status = status;
    }

    if (claimType) {
      filter.claimType = claimType;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (clientId) {
      filter.clientId = clientId;
    }

    if (policyId) {
      filter.policyId = policyId;
    }

    if (minAmount || maxAmount) {
      filter.claimAmount = {};
      if (minAmount) filter.claimAmount.$gte = Number(minAmount);
      if (maxAmount) filter.claimAmount.$lte = Number(maxAmount);
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === 'manager') {
      // Managers can see claims assigned to their team
      // This would require additional logic based on team structure
    }

    // Build sort object
    const sort = {};
    sort[sortField] = sortDirection === 'desc' ? -1 : 1;

    // Execute query with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [claims, totalCount] = await Promise.all([
      Claim.find(filter)
        .populate('clientId', 'firstName lastName email')
        .populate('policyId', 'policyNumber policyType')
        .populate('assignedTo', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Claim.countDocuments(filter)
    ]);

    return paginatedResponse(res, {
      data: claims,
      totalItems: totalCount,
      currentPage: pageNum,
      itemsPerPage: limitNum,
      message: 'Claims retrieved successfully'
    });
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

    const claim = await Claim.findById(id)
      .populate('clientId')
      .populate('policyId')
      .populate('assignedTo', 'firstName lastName email')
      .populate('investigatorId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    // Role-based access control
    if (req.user.role === 'agent' && claim.assignedTo._id.toString() !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    return successResponse(res, claim, 'Claim retrieved successfully');
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
    
    // Generate unique claim number
    const claimNumber = await generateClaimNumber(Claim);
    
    const newClaim = new Claim({
      ...claimData,
      claimNumber,
      createdBy: req.user.id,
      lastModifiedBy: req.user.id
    });

    const savedClaim = await newClaim.save();
    
    // Populate referenced fields
    await savedClaim.populate([
      { path: 'clientId', select: 'firstName lastName email' },
      { path: 'policyId', select: 'policyNumber policyType' },
      { path: 'assignedTo', select: 'firstName lastName email' }
    ]);

    return successResponse(res, savedClaim, 'Claim created successfully', 201);
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

    const claim = await Claim.findById(id);

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    // Role-based access control
    if (req.user.role === 'agent' && claim.assignedTo.toString() !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Update claim
    Object.assign(claim, updateData);
    claim.lastModifiedBy = req.user.id;

    const updatedClaim = await claim.save();
    
    await updatedClaim.populate([
      { path: 'clientId', select: 'firstName lastName email' },
      { path: 'policyId', select: 'policyNumber policyType' },
      { path: 'assignedTo', select: 'firstName lastName email' }
    ]);

    return successResponse(res, updatedClaim, 'Claim updated successfully');
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

    const claim = await Claim.findById(id);

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    claim.isActive = false;
    claim.lastModifiedBy = req.user.id;
    await claim.save();

    return successResponse(res, null, 'Claim deleted successfully');
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
    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    const claim = await Claim.findById(id);

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    // Role-based access control
    if (req.user.role === 'agent' && claim.assignedTo.toString() !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    const documentData = {
      filename: file.filename,
      originalName: file.originalname,
      documentType,
      fileSize: file.size,
      mimeType: file.mimetype
    };

    await claim.addDocument(documentData, req.user.id);

    return successResponse(res, claim, 'Document uploaded successfully');
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

    const claim = await Claim.findById(id).select('documents');

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    return successResponse(res, claim.documents, 'Documents retrieved successfully');
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

    const claim = await Claim.findById(id);

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    // Role-based access control
    if (req.user.role === 'agent' && claim.assignedTo.toString() !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    claim.documents.id(documentId).remove();
    await claim.save();

    return successResponse(res, null, 'Document deleted successfully');
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

    const claim = await Claim.findById(id);

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    // Role-based access control
    if (req.user.role === 'agent' && claim.assignedTo.toString() !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    if (status === 'Approved' && approvedAmount) {
      await claim.approveClaim(approvedAmount, req.user.id, reason);
    } else if (status === 'Rejected') {
      await claim.rejectClaim(req.user.id, reason);
    } else {
      await claim.updateStatus(status, req.user.id, reason);
    }

    return successResponse(res, claim, 'Claim status updated successfully');
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

    const claim = await Claim.findById(id);

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    // Role-based access control
    if (req.user.role === 'agent' && claim.assignedTo.toString() !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    await claim.addNote(content, type, req.user.id, priority);

    return successResponse(res, claim, 'Note added successfully');
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

    const claim = await Claim.findById(id)
      .select('notes')
      .populate('notes.createdBy', 'firstName lastName');

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    return successResponse(res, claim.notes, 'Notes retrieved successfully');
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
    const { limit = 10 } = req.query;

    const filter = {
      $text: { $search: query },
      isActive: true
    };

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedTo = req.user.id;
    }

    const claims = await Claim.find(filter)
      .populate('clientId', 'firstName lastName')
      .populate('policyId', 'policyNumber')
      .limit(parseInt(limit))
      .sort({ score: { $meta: 'textScore' } });

    return successResponse(res, claims, 'Search completed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get claims statistics
 */
const getClaimsStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { isActive: true };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedTo = req.user.id;
    }

    const stats = await Claim.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalClaims: { $sum: 1 },
          totalClaimAmount: { $sum: '$claimAmount' },
          totalApprovedAmount: { $sum: '$approvedAmount' },
          pendingClaims: {
            $sum: {
              $cond: [{ $in: ['$status', ['Under Review', 'Pending Documentation']] }, 1, 0]
            }
          },
          approvedClaims: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0]
            }
          },
          rejectedClaims: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0]
            }
          },
          settledClaims: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Settled'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalClaims: 0,
      totalClaimAmount: 0,
      totalApprovedAmount: 0,
      pendingClaims: 0,
      approvedClaims: 0,
      rejectedClaims: 0,
      settledClaims: 0
    };

    return successResponse(res, result, 'Statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const filter = { isActive: true };

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedTo = req.user.id;
    }

    const [totalClaims, recentClaims, urgentClaims] = await Promise.all([
      Claim.countDocuments(filter),
      Claim.find(filter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('clientId', 'firstName lastName')
        .populate('policyId', 'policyNumber'),
      Claim.find({ ...filter, priority: 'Critical' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('clientId', 'firstName lastName')
    ]);

    return successResponse(res, {
      totalClaims,
      recentClaims,
      urgentClaims
    }, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get claims aging report
 */
const getClaimsAgingReport = async (req, res, next) => {
  try {
    const filter = { 
      isActive: true,
      status: { $in: ['Under Review', 'Pending Documentation', 'Under Investigation'] }
    };

    const agingData = await Claim.aggregate([
      { $match: filter },
      {
        $addFields: {
          ageInDays: {
            $divide: [
              { $subtract: [new Date(), '$reportedDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$ageInDays',
          boundaries: [0, 7, 14, 30, 60, 90, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            totalAmount: { $sum: '$claimAmount' },
            claims: { $push: '$$ROOT' }
          }
        }
      }
    ]);

    return successResponse(res, agingData, 'Aging report retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get settlement analysis report
 */
const getSettlementReport = async (req, res, next) => {
  try {
    const filter = { 
      isActive: true,
      status: 'Settled'
    };

    const settlementData = await Claim.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$claimType',
          totalClaims: { $sum: 1 },
          totalClaimAmount: { $sum: '$claimAmount' },
          totalSettledAmount: { $sum: '$settledAmount' },
          avgProcessingTime: { $avg: '$processingTime' },
          settlementRatio: {
            $avg: {
              $divide: ['$settledAmount', '$claimAmount']
            }
          }
        }
      }
    ]);

    return successResponse(res, settlementData, 'Settlement report retrieved successfully');
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

    const result = await Claim.updateMany(
      { _id: { $in: claimIds }, isActive: true },
      { ...updateData, lastModifiedBy: req.user.id }
    );

    return successResponse(res, result, 'Claims updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk assign claims
 */
const bulkAssignClaims = async (req, res, next) => {
  try {
    const { claimIds, assignedTo } = req.body;

    const result = await Claim.updateMany(
      { _id: { $in: claimIds }, isActive: true },
      { assignedTo, lastModifiedBy: req.user.id }
    );

    return successResponse(res, result, 'Claims assigned successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Export claims
 */
const exportClaims = async (req, res, next) => {
  try {
    // This would implement CSV/Excel export functionality
    // For now, returning JSON data
    const claims = await Claim.find({ isActive: true })
      .populate('clientId', 'firstName lastName')
      .populate('policyId', 'policyNumber')
      .lean();

    return successResponse(res, claims, 'Claims exported successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Download template
 */
const downloadTemplate = async (req, res, next) => {
  try {
    // This would return a CSV template for bulk import
    const template = {
      headers: ['claimNumber', 'clientId', 'policyId', 'claimType', 'claimAmount', 'incidentDate', 'description'],
      sample: ['CLM-2024-001', 'client_id', 'policy_id', 'Health', '50000', '2024-01-15', 'Sample description']
    };

    return successResponse(res, template, 'Template downloaded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Import claims
 */
const importClaims = async (req, res, next) => {
  try {
    // This would implement CSV/Excel import functionality
    const file = req.file;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    // Process file and create claims
    // This is a simplified implementation
    const result = {
      imported: 0,
      errors: []
    };

    return successResponse(res, result, 'Claims imported successfully');
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
  getClaimsAgingReport,
  getSettlementReport,
  bulkUpdateClaims,
  bulkAssignClaims,
  exportClaims,
  downloadTemplate,
  importClaims
};
