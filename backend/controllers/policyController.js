
const Policy = require('../models/Policy');
const Client = require('../models/Client');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// Get all policies with pagination and filtering
const getAllPolicies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      clientId,
      agentId,
      sortField = 'createdAt',
      sortDirection = 'desc',
      minPremium,
      maxPremium,
      startDate,
      endDate
    } = req.query;

    // Build filter query
    let filter = {};

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedAgentId = req.user.id;
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { planName: { $regex: search, $options: 'i' } },
        { insuranceCompany: { $regex: search, $options: 'i' } }
      ];
    }

    // Type filtering
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Status filtering
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Client filtering
    if (clientId) {
      filter.clientId = clientId;
    }

    // Agent filtering
    if (agentId) {
      filter.assignedAgentId = agentId;
    }

    // Premium range filtering
    if (minPremium || maxPremium) {
      filter.premium = {};
      if (minPremium) filter.premium.$gte = parseFloat(minPremium);
      if (maxPremium) filter.premium.$lte = parseFloat(maxPremium);
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortField] = sortDirection === 'asc' ? 1 : -1;

    // Execute query with pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
      populate: [
        { path: 'clientId', select: 'displayName email clientId clientType' },
        { path: 'assignedAgentId', select: 'name email' },
        { path: 'createdBy', select: 'name email' }
      ]
    };

    const result = await Policy.paginate(filter, options);

    res.status(200).json({
      success: true,
      data: result.docs,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.totalDocs,
        itemsPerPage: result.limit
      }
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policies',
      error: error.message
    });
  }
};

// Get policy by ID
const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid policy ID format'
      });
    }

    let filter = { _id: id };

    // Role-based access control
    if (req.user.role === 'agent') {
      filter.assignedAgentId = req.user.id;
    }

    const policy = await Policy.findOne(filter)
      .populate('clientId', 'displayName email clientId clientType individualData corporateData groupData')
      .populate('assignedAgentId', 'name email')
      .populate('createdBy', 'name email');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policy',
      error: error.message
    });
  }
};

// Create new policy
const createPolicy = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const policyData = req.body;

    // Set the user who created the policy
    policyData.createdBy = req.user.id;

    // If no assigned agent specified, assign to current user if they're an agent
    if (!policyData.assignedAgentId && req.user.role === 'agent') {
      policyData.assignedAgentId = req.user.id;
    }

    // Verify client exists
    if (policyData.clientId) {
      const client = await Client.findById(policyData.clientId);
      if (!client) {
        return res.status(400).json({
          success: false,
          message: 'Client not found'
        });
      }
    }

    // Create the policy
    const policy = new Policy(policyData);
    await policy.save();

    // Populate the created policy
    await policy.populate([
      { path: 'clientId', select: 'displayName email clientId clientType' },
      { path: 'assignedAgentId', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: policy
    });
  } catch (error) {
    console.error('Error creating policy:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create policy',
      error: error.message
    });
  }
};

// Update policy
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid policy ID format'
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let filter = { _id: id };

    // Role-based access control
    if (req.user.role === 'agent') {
      filter.assignedAgentId = req.user.id;
    }

    // Set the user who updated the policy
    updateData.updatedBy = req.user.id;

    const policy = await Policy.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'clientId', select: 'displayName email clientId clientType' },
      { path: 'assignedAgentId', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Policy updated successfully',
      data: policy
    });
  } catch (error) {
    console.error('Error updating policy:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update policy',
      error: error.message
    });
  }
};

// Delete policy
const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid policy ID format'
      });
    }

    const policy = await Policy.findByIdAndDelete(id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete policy',
      error: error.message
    });
  }
};

// Upload document
const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, name } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    const documentData = {
      documentType,
      name: name || req.file.originalname,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      fileSize: req.file.size,
      uploadedBy: req.user.id
    };

    policy.documents.push(documentData);
    await policy.save();

    const newDocument = policy.documents[policy.documents.length - 1];

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: newDocument
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Get policy documents
const getPolicyDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findById(id).populate('documents.uploadedBy', 'name email');
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    res.status(200).json({
      success: true,
      data: policy.documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    policy.documents.id(documentId).remove();
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Add payment record
const addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    paymentData.recordedBy = req.user.id;
    policy.payments.push(paymentData);
    await policy.save();

    const newPayment = policy.payments[policy.payments.length - 1];

    res.status(200).json({
      success: true,
      message: 'Payment record added successfully',
      data: newPayment
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment record',
      error: error.message
    });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findById(id).populate('payments.recordedBy', 'name email');
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    res.status(200).json({
      success: true,
      data: policy.payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

// Renew policy
const renewPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const renewalData = req.body;

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Update policy with renewal data
    policy.status = 'Active';
    policy.startDate = renewalData.newStartDate || policy.endDate;
    policy.endDate = renewalData.newEndDate;
    policy.premium = renewalData.newPremium || policy.premium;

    // Add renewal record
    renewalData.renewedBy = req.user.id;
    policy.renewals.push(renewalData);

    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Policy renewed successfully',
      data: policy
    });
  } catch (error) {
    console.error('Error renewing policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to renew policy',
      error: error.message
    });
  }
};

// Add note
const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    const noteData = {
      note,
      addedBy: req.user.id,
      addedAt: new Date()
    };

    policy.notes.push(noteData);
    await policy.save();

    const newNote = policy.notes[policy.notes.length - 1];

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: newNote
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
};

// Get policy notes
const getPolicyNotes = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findById(id).populate('notes.addedBy', 'name email');
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    res.status(200).json({
      success: true,
      data: policy.notes
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
      error: error.message
    });
  }
};

// Search policies
const searchPolicies = async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    let filter = {
      $or: [
        { policyNumber: { $regex: query, $options: 'i' } },
        { planName: { $regex: query, $options: 'i' } },
        { insuranceCompany: { $regex: query, $options: 'i' } }
      ]
    };

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedAgentId = req.user.id;
    }

    const policies = await Policy.find(filter)
      .limit(parseInt(limit))
      .populate('clientId', 'displayName email clientId')
      .populate('assignedAgentId', 'name email');

    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error('Error searching policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search policies',
      error: error.message
    });
  }
};

// Get policies by agent
const getPoliciesByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    const policies = await Policy.find({ assignedAgentId: agentId })
      .populate('clientId', 'displayName email clientId')
      .populate('assignedAgentId', 'name email');

    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error('Error fetching agent policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent policies',
      error: error.message
    });
  }
};

// Assign policy to agent
const assignPolicyToAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const policy = await Policy.findByIdAndUpdate(
      id,
      { assignedAgentId: agentId, updatedBy: req.user.id },
      { new: true }
    ).populate('assignedAgentId', 'name email');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Policy assigned successfully',
      data: policy
    });
  } catch (error) {
    console.error('Error assigning policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign policy',
      error: error.message
    });
  }
};

// Get policy statistics
const getPolicyStats = async (req, res) => {
  try {
    let filter = {};

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedAgentId = req.user.id;
    }

    const stats = await Policy.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPolicies: { $sum: 1 },
          activePolicies: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          expiredPolicies: {
            $sum: { $cond: [{ $eq: ['$status', 'Expired'] }, 1, 0] }
          },
          totalPremium: { $sum: '$premium' },
          averagePremium: { $avg: '$premium' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalPolicies: 0,
        activePolicies: 0,
        expiredPolicies: 0,
        totalPremium: 0,
        averagePremium: 0
      }
    });
  } catch (error) {
    console.error('Error fetching policy stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policy statistics',
      error: error.message
    });
  }
};

// Get expiring policies
const getExpiringPolicies = async (req, res) => {
  try {
    const { days } = req.params;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));

    let filter = {
      status: 'Active',
      endDate: { $lte: expiryDate }
    };

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedAgentId = req.user.id;
    }

    const policies = await Policy.find(filter)
      .populate('clientId', 'displayName email clientId')
      .populate('assignedAgentId', 'name email')
      .sort({ endDate: 1 });

    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error('Error fetching expiring policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring policies',
      error: error.message
    });
  }
};

// Get policies due for renewal
const getPoliciesDueForRenewal = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + parseInt(days));

    let filter = {
      status: 'Active',
      endDate: { $lte: renewalDate }
    };

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedAgentId = req.user.id;
    }

    const policies = await Policy.find(filter)
      .populate('clientId', 'displayName email clientId')
      .populate('assignedAgentId', 'name email')
      .sort({ endDate: 1 });

    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error('Error fetching renewal policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policies due for renewal',
      error: error.message
    });
  }
};

// Bulk assign policies
const bulkAssignPolicies = async (req, res) => {
  try {
    const { policyIds, agentId } = req.body;

    const result = await Policy.updateMany(
      { _id: { $in: policyIds } },
      { assignedAgentId: agentId, updatedBy: req.user.id }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} policies assigned successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error bulk assigning policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk assign policies',
      error: error.message
    });
  }
};

// Export policies
const exportPolicies = async (req, res) => {
  try {
    let filter = {};

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedAgentId = req.user.id;
    }

    // Apply any additional filters from query
    Object.keys(req.query).forEach(key => {
      if (req.query[key] && key !== 'format') {
        filter[key] = req.query[key];
      }
    });

    const policies = await Policy.find(filter)
      .populate('clientId', 'displayName email clientId')
      .populate('assignedAgentId', 'name email');

    res.status(200).json({
      success: true,
      data: policies,
      message: 'Policies exported successfully'
    });
  } catch (error) {
    console.error('Error exporting policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export policies',
      error: error.message
    });
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
