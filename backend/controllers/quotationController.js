
const Quotation = require('../models/Quotation');
const { responseHandler } = require('../utils/responseHandler');
const { errorHandler } = require('../utils/errorHandler');

// Get all quotations with filtering and pagination
exports.getQuotations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      insuranceType,
      agentId,
      clientId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      validFrom,
      validTo
    } = req.query;

    // Build filter object
    const filter = {};

    // Role-based filtering
    const userRole = req.user.role?.name || req.user.role;
    if (userRole === 'agent') {
      filter.agentId = req.user.id;
    } else if (agentId && agentId !== 'all') {
      filter.agentId = agentId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (insuranceType && insuranceType !== 'all') {
      filter.insuranceType = insuranceType;
    }

    if (clientId) {
      filter.clientId = clientId;
    }

    // Date range filters
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    if (validFrom || validTo) {
      filter.validUntil = {};
      if (validFrom) filter.validUntil.$gte = new Date(validFrom);
      if (validTo) filter.validUntil.$lte = new Date(validTo);
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { quoteId: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { insuranceCompany: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const quotations = await Quotation.find(filter)
      .populate('clientId', 'name email phone')
      .populate('agentId', 'name email')
      .sort(sortConfig)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalCount = await Quotation.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    responseHandler.success(res, {
      quotations,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, 'Quotations retrieved successfully');

  } catch (error) {
    console.error('Error fetching quotations:', error);
    errorHandler(error, req, res);
  }
};

// Get quotation by ID
exports.getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quotation = await Quotation.findById(id)
      .populate('clientId', 'name email phone address')
      .populate('agentId', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!quotation) {
      return responseHandler.error(res, 'Quotation not found', 404);
    }

    // Check access permissions
    const userRole = req.user.role?.name || req.user.role;
    if (userRole === 'agent' && quotation.agentId.toString() !== req.user.id) {
      return responseHandler.error(res, 'Access denied', 403);
    }

    responseHandler.success(res, quotation, 'Quotation retrieved successfully');
  } catch (error) {
    console.error('Error fetching quotation:', error);
    errorHandler(error, req, res);
  }
};

// Create new quotation
exports.createQuotation = async (req, res) => {
  try {
    const quotationData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    // If agent role, set agentId to current user
    const userRole = req.user.role?.name || req.user.role;
    if (userRole === 'agent') {
      quotationData.agentId = req.user.id;
      quotationData.agentName = req.user.name;
    }

    const quotation = new Quotation(quotationData);
    await quotation.save();

    const populatedQuotation = await Quotation.findById(quotation._id)
      .populate('clientId', 'name email phone')
      .populate('agentId', 'name email');

    responseHandler.success(res, populatedQuotation, 'Quotation created successfully', 201);
  } catch (error) {
    console.error('Error creating quotation:', error);
    errorHandler(error, req, res);
  }
};

// Update quotation
exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return responseHandler.error(res, 'Quotation not found', 404);
    }

    // Check permissions
    const userRole = req.user.role?.name || req.user.role;
    if (userRole === 'agent' && quotation.agentId.toString() !== req.user.id) {
      return responseHandler.error(res, 'Access denied', 403);
    }

    // Prevent updating if quotation is accepted or expired
    if (quotation.status === 'accepted') {
      return responseHandler.error(res, 'Cannot update accepted quotation', 400);
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const updatedQuotation = await Quotation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('clientId', 'name email phone')
     .populate('agentId', 'name email');

    responseHandler.success(res, updatedQuotation, 'Quotation updated successfully');
  } catch (error) {
    console.error('Error updating quotation:', error);
    errorHandler(error, req, res);
  }
};

// Delete quotation
exports.deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return responseHandler.error(res, 'Quotation not found', 404);
    }

    // Check permissions
    const userRole = req.user.role?.name || req.user.role;
    if (userRole === 'agent' && quotation.agentId.toString() !== req.user.id) {
      return responseHandler.error(res, 'Access denied', 403);
    }

    // Prevent deletion if quotation is accepted
    if (quotation.status === 'accepted') {
      return responseHandler.error(res, 'Cannot delete accepted quotation', 400);
    }

    await Quotation.findByIdAndDelete(id);
    responseHandler.success(res, null, 'Quotation deleted successfully');
  } catch (error) {
    console.error('Error deleting quotation:', error);
    errorHandler(error, req, res);
  }
};

// Send quotation via email
exports.sendQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { emailTo, emailSubject, emailMessage } = req.body;
    
    const quotation = await Quotation.findById(id)
      .populate('clientId', 'name email phone')
      .populate('agentId', 'name email');

    if (!quotation) {
      return responseHandler.error(res, 'Quotation not found', 404);
    }

    // Check permissions
    const userRole = req.user.role?.name || req.user.role;
    if (userRole === 'agent' && quotation.agentId.toString() !== req.user.id) {
      return responseHandler.error(res, 'Access denied', 403);
    }

    // Update quotation status
    await quotation.markAsSent();

    // TODO: Implement actual email sending logic here
    console.log('Email would be sent to:', emailTo || quotation.clientId.email);
    console.log('Subject:', emailSubject || `Quotation ${quotation.quoteId}`);
    console.log('Message:', emailMessage || 'Please find your quotation attached.');

    const updatedQuotation = await Quotation.findById(id)
      .populate('clientId', 'name email phone')
      .populate('agentId', 'name email');

    responseHandler.success(res, updatedQuotation, 'Quotation sent successfully');
  } catch (error) {
    console.error('Error sending quotation:', error);
    errorHandler(error, req, res);
  }
};

// Update quotation status
exports.updateQuotationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, convertedToPolicy } = req.body;
    
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return responseHandler.error(res, 'Quotation not found', 404);
    }

    // Check permissions for status updates
    const userRole = req.user.role?.name || req.user.role;
    if (userRole === 'agent' && quotation.agentId.toString() !== req.user.id) {
      return responseHandler.error(res, 'Access denied', 403);
    }

    // Handle status-specific logic
    switch (status) {
      case 'viewed':
        await quotation.markAsViewed();
        break;
      case 'accepted':
        await quotation.markAsAccepted();
        if (convertedToPolicy) {
          quotation.convertedToPolicy = convertedToPolicy;
          await quotation.save();
        }
        break;
      case 'rejected':
        await quotation.markAsRejected(rejectionReason);
        break;
      default:
        quotation.status = status;
        quotation.updatedBy = req.user.id;
        await quotation.save();
    }

    const updatedQuotation = await Quotation.findById(id)
      .populate('clientId', 'name email phone')
      .populate('agentId', 'name email');

    responseHandler.success(res, updatedQuotation, 'Quotation status updated successfully');
  } catch (error) {
    console.error('Error updating quotation status:', error);
    errorHandler(error, req, res);
  }
};

// Get quotations statistics
exports.getQuotationsStats = async (req, res) => {
  try {
    const { period = '30', agentId } = req.query;
    
    // Build base filter
    const baseFilter = {};
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));
    baseFilter.createdAt = { $gte: dateFrom };

    // Role-based filtering
    const userRole = req.user.role?.name || req.user.role;
    if (userRole === 'agent') {
      baseFilter.agentId = req.user.id;
    } else if (agentId && agentId !== 'all') {
      baseFilter.agentId = agentId;
    }

    // Get various statistics
    const [
      totalQuotations,
      statusStats,
      premiumStats,
      conversionStats
    ] = await Promise.all([
      Quotation.countDocuments(baseFilter),
      
      Quotation.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      Quotation.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            totalPremium: { $sum: '$premium' },
            averagePremium: { $avg: '$premium' },
            minPremium: { $min: '$premium' },
            maxPremium: { $max: '$premium' }
          }
        }
      ]),
      
      Quotation.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Process status statistics
    const statusMap = {
      draft: 0,
      sent: 0,
      viewed: 0,
      accepted: 0,
      rejected: 0,
      expired: 0
    };
    
    statusStats.forEach(stat => {
      statusMap[stat._id] = stat.count;
    });

    // Calculate conversion rate
    const sentQuotations = statusMap.sent + statusMap.viewed + statusMap.accepted + statusMap.rejected;
    const conversionRate = sentQuotations > 0 ? (statusMap.accepted / sentQuotations * 100) : 0;

    const stats = {
      totalQuotations,
      statusBreakdown: statusMap,
      premiumStats: premiumStats[0] || {
        totalPremium: 0,
        averagePremium: 0,
        minPremium: 0,
        maxPremium: 0
      },
      conversionRate: Math.round(conversionRate * 100) / 100,
      period: parseInt(period)
    };

    responseHandler.success(res, stats, 'Quotation statistics retrieved successfully');
  } catch (error) {
    console.error('Error fetching quotation statistics:', error);
    errorHandler(error, req, res);
  }
};

// Search quotations
exports.searchQuotations = async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    
    const searchFilter = {
      $or: [
        { quoteId: { $regex: query, $options: 'i' } },
        { clientName: { $regex: query, $options: 'i' } },
        { insuranceCompany: { $regex: query, $options: 'i' } }
      ]
    };

    // Role-based filtering
    const userRole = req.user.role?.name || req.user.role;
    if (userRole === 'agent') {
      searchFilter.agentId = req.user.id;
    }

    const quotations = await Quotation.find(searchFilter)
      .populate('clientId', 'name email')
      .populate('agentId', 'name')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    responseHandler.success(res, quotations, 'Search results retrieved successfully');
  } catch (error) {
    console.error('Error searching quotations:', error);
    errorHandler(error, req, res);
  }
};

// Export quotations
exports.exportQuotations = async (req, res) => {
  try {
    const { format = 'csv', filters = {} } = req.body;
    
    // Build filter object
    const filter = {};
    
    // Role-based filtering
    const userRole = req.user.role?.name || req.user.role;
    if (userRole === 'agent') {
      filter.agentId = req.user.id;
    } else if (filters.agentId && filters.agentId !== 'all') {
      filter.agentId = filters.agentId;
    }
    
    if (filters.status && filters.status !== 'all') {
      filter.status = filters.status;
    }
    
    if (filters.insuranceType && filters.insuranceType !== 'all') {
      filter.insuranceType = filters.insuranceType;
    }
    
    if (filters.dateFrom || filters.dateTo) {
      filter.createdAt = {};
      if (filters.dateFrom) filter.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) filter.createdAt.$lte = new Date(filters.dateTo);
    }
    
    const quotations = await Quotation.find(filter)
      .populate('clientId', 'name email phone')
      .populate('agentId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    // Format data for export
    const exportData = quotations.map(quotation => ({
      quoteId: quotation.quoteId,
      clientName: quotation.clientName,
      clientEmail: quotation.clientId?.email || '',
      clientPhone: quotation.clientId?.phone || '',
      insuranceType: quotation.insuranceType,
      insuranceCompany: quotation.insuranceCompany,
      sumInsured: quotation.sumInsured,
      premium: quotation.premium,
      status: quotation.status,
      agentName: quotation.agentName,
      validUntil: quotation.validUntil,
      createdAt: quotation.createdAt,
      sentDate: quotation.sentDate,
      acceptedAt: quotation.acceptedAt,
      rejectedAt: quotation.rejectedAt
    }));
    
    responseHandler.success(res, {
      data: exportData,
      format,
      count: exportData.length
    }, 'Quotations exported successfully');
  } catch (error) {
    console.error('Error exporting quotations:', error);
    errorHandler(error, req, res);
  }
};
