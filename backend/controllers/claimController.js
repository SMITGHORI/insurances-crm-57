const { responseHandler } = require('../utils/responseHandler');
const { AppError } = require('../utils/errorHandler');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const Client = require('../models/Client');
const mongoose = require('mongoose');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');
const { generateClaimReport } = require('../utils/reportGenerator');
const { exportToExcel } = require('../utils/excelExporter');
const { sendEmail } = require('../utils/emailService');
const { INSURANCE_TYPES } = require('../config/insuranceTypes');

/**
 * Get all claims with filtering, pagination, and search
 */
const getAllClaims = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, sortField, sortDirection, filters } = req.query;
    const { user } = req;

    // Build query
    let query = { isDeleted: { $ne: true } };

    // Role-based access control
    if (user.role === 'agent') {
      query.assignedTo = user._id;
    }

    // Apply filters
    if (filters) {
      const parsedFilters = JSON.parse(filters);
      Object.keys(parsedFilters).forEach(key => {
        if (parsedFilters[key]) {
          query[key] = parsedFilters[key];
        }
      });
    }

    // Apply search
    if (search) {
      query.$or = [
        { claimNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'contactDetails.primaryContact': { $regex: search, $options: 'i' } }
      ];
    }

    // Apply sorting
    let sort = {};
    if (sortField && sortDirection) {
      sort[sortField] = sortDirection === 'asc' ? 1 : -1;
    } else {
      sort = { createdAt: -1 };
    }

    // Pagination options
    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit);

    // Execute query
    const [claims, total] = await Promise.all([
      Claim.find(query)
        .populate('clientId', 'firstName lastName email')
        .populate('policyId', 'policyNumber policyType')
        .populate('assignedTo', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Claim.countDocuments(query)
    ]);

    responseHandler.success(res, claims, 'Claims retrieved successfully', {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum
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
      .populate('clientId', 'firstName lastName email')
      .populate('policyId', 'policyNumber policyType')
      .populate('assignedTo', 'firstName lastName email');

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    responseHandler.success(res, claim, 'Claim retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create new claim
 */
const createClaim = async (req, res, next) => {
  try {
    const { user } = req;
    const claim = new Claim({
      ...req.body,
      createdBy: user._id,
      assignedTo: user._id // Assign to creator by default
    });

    await claim.save();
    responseHandler.success(res, claim, 'Claim created successfully', 201);
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
    const { user } = req;

    const claim = await Claim.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: user._id },
      { new: true, runValidators: true }
    );

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    responseHandler.success(res, claim, 'Claim updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete claim
 */
const deleteClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const claim = await Claim.findById(id);
    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    await claim.softDelete(user._id);
    responseHandler.success(res, null, 'Claim deleted successfully');
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
    const { user, file } = req;
    const { documentType } = req.body;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    // Validate file size and type
    if (file.size > 10 * 1024 * 1024) {
      throw new AppError('File size exceeds 10MB', 400);
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError('Invalid file type', 400);
    }

    // Upload to S3
    const s3Result = await uploadToS3(file);

    // Create document object
    const document = {
      name: file.originalname,
      fileName: file.filename,
      fileSize: file.size,
      mimeType: file.mimetype,
      documentType,
      filePath: s3Result.Location,
      uploadedBy: user._id
    };

    // Add document to claim
    const claim = await Claim.findById(id);
    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    claim.documents.push(document);
    await claim.save();

    responseHandler.success(res, document, 'Document uploaded successfully');
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

    responseHandler.success(res, claim.documents, 'Documents retrieved successfully');
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

    const document = claim.documents.id(documentId);
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Delete from S3
    await deleteFromS3(document.fileName);

    // Remove document from claim
    document.remove();
    await claim.save();

    responseHandler.success(res, null, 'Document deleted successfully');
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
    const { status } = req.body;
    const { user } = req;

    const claim = await Claim.findByIdAndUpdate(
      id,
      { status, updatedBy: user._id },
      { new: true, runValidators: true }
    );

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    responseHandler.success(res, claim, 'Claim status updated successfully');
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
    const { user } = req;

    const claim = await Claim.findById(id);
    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    claim.addNote(content, type, priority, user._id);
    responseHandler.success(res, claim.notes, 'Note added successfully');
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
    const claim = await Claim.findById(id).select('notes');

    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    responseHandler.success(res, claim.notes, 'Notes retrieved successfully');
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
    const { user } = req;

    let options = {};
    if (user.role === 'agent') {
      options.assignedTo = user._id;
    }

    const claims = await Claim.searchClaims(query, options);
    responseHandler.success(res, claims, 'Claims retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get claims statistics summary
 */
const getClaimsStats = async (req, res, next) => {
  try {
    const totalClaims = await Claim.countDocuments({ isDeleted: { $ne: true } });
    const reportedClaims = await Claim.countDocuments({ status: 'Reported', isDeleted: { $ne: true } });
    const underReviewClaims = await Claim.countDocuments({ status: 'Under Review', isDeleted: { $ne: true } });
    const pendingClaims = await Claim.countDocuments({ status: 'Pending', isDeleted: { $ne: true } });
    const approvedClaims = await Claim.countDocuments({ status: 'Approved', isDeleted: { $ne: true } });
    const rejectedClaims = await Claim.countDocuments({ status: 'Rejected', isDeleted: { $ne: true } });
    const settledClaims = await Claim.countDocuments({ status: 'Settled', isDeleted: { $ne: true } });
    const totalClaimAmount = await Claim.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$claimAmount' } } }
    ]);
    const totalApprovedAmount = await Claim.aggregate([
      { $match: { status: 'Settled', isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$approvedAmount' } } }
    ]);

    const stats = {
      totalClaims,
      reportedClaims,
      underReviewClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      settledClaims,
      totalClaimAmount: totalClaimAmount.length > 0 ? totalClaimAmount[0].total : 0,
      totalApprovedAmount: totalApprovedAmount.length > 0 ? totalApprovedAmount[0].total : 0
    };

    responseHandler.success(res, stats, 'Claims statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics for claims
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const { user } = req;

    // Build base query
    let query = { isDeleted: { $ne: true } };

    // Role-based access control
    if (user.role === 'agent') {
      query.assignedTo = user._id;
    }

    const totalClaims = await Claim.countDocuments(query);
    const reportedClaims = await Claim.countDocuments({ ...query, status: 'Reported' });
    const underReviewClaims = await Claim.countDocuments({ ...query, status: 'Under Review' });
    const pendingClaims = await Claim.countDocuments({ ...query, status: 'Pending' });
    const approvedClaims = await Claim.countDocuments({ ...query, status: 'Approved' });
    const rejectedClaims = await Claim.countDocuments({ ...query, status: 'Rejected' });
    const settledClaims = await Claim.countDocuments({ ...query, status: 'Settled' });

    const stats = {
      totalClaims,
      reportedClaims,
      underReviewClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      settledClaims
    };

    responseHandler.success(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get claims aging report
 */
const getClaimsAgingReport = async (req, res, next) => {
  try {
    const claims = await Claim.findActive()
      .populate('clientId', 'firstName lastName email')
      .populate('policyId', 'policyNumber policyType')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ reportedDate: 1 });

    const report = generateClaimReport(claims);
    responseHandler.success(res, report, 'Claims aging report generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get settlement analysis report
 */
const getSettlementReport = async (req, res, next) => {
  try {
    const claims = await Claim.find({ status: 'Settled', isDeleted: { $ne: true } })
      .populate('clientId', 'firstName lastName email')
      .populate('policyId', 'policyNumber policyType')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ actualSettlement: -1 });

    const report = generateClaimReport(claims);
    responseHandler.success(res, report, 'Settlement analysis report generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update claims
 */
const bulkUpdateClaims = async (req, res, next) => {
  try {
    const { claimIds, update } = req.body;
    const { user } = req;

    if (!Array.isArray(claimIds) || claimIds.length === 0) {
      throw new AppError('Invalid claim IDs', 400);
    }

    if (Object.keys(update).length === 0) {
      throw new AppError('No update data provided', 400);
    }

    const result = await Claim.updateMany(
      { _id: { $in: claimIds }, isDeleted: { $ne: true } },
      { ...update, updatedBy: user._id },
      { new: true, runValidators: true }
    );

    responseHandler.success(res, result, 'Claims updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk assign claims to agents
 */
const bulkAssignClaims = async (req, res, next) => {
  try {
    const { claimIds, agentId } = req.body;
    const { user } = req;

    if (!Array.isArray(claimIds) || claimIds.length === 0) {
      throw new AppError('Invalid claim IDs', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new AppError('Invalid agent ID', 400);
    }

    const result = await Claim.updateMany(
      { _id: { $in: claimIds }, isDeleted: { $ne: true } },
      { assignedTo: agentId, updatedBy: user._id },
      { new: true, runValidators: true }
    );

    responseHandler.success(res, result, 'Claims assigned successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Export claims data
 */
const exportClaims = async (req, res, next) => {
  try {
    const claims = await Claim.findActive()
      .populate('clientId', 'firstName lastName email')
      .populate('policyId', 'policyNumber policyType')
      .populate('assignedTo', 'firstName lastName email');

    const excelBuffer = await exportToExcel(claims);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=claims.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Download claim import template
 */
const downloadTemplate = (req, res, next) => {
  try {
    // Implement logic to serve the template file
    res.download('templates/claim_import_template.xlsx', 'claim_import_template.xlsx', (err) => {
      if (err) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Import claims from file
 */
const importClaims = async (req, res, next) => {
  try {
    const { file, user } = req;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    // Implement logic to parse the file and create claims
    // This is a placeholder, replace with actual implementation
    responseHandler.success(res, null, 'Claims imported successfully');
  } catch (error) {
    next(error);
  }
};

// Import the new form data controller methods
const {
  getPoliciesForClaim,
  getClientsForClaim,
  getPolicyDetails
} = require('./claimFormDataController');

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
  importClaims,
  
  // Add new form data methods
  getPoliciesForClaim,
  getClientsForClaim,
  getPolicyDetails
};
