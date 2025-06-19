
const Policy = require('../models/Policy');
const Client = require('../models/Client');
const Activity = require('../models/Activity');
const User = require('../models/User');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

/**
 * Policy Controller with full CRUD operations, role-based access, and cross-module integration
 */

// Get all policies with filtering, pagination, and role-based access
exports.getAllPolicies = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      type, 
      status = 'All', 
      clientId,
      agentId,
      sortField = 'createdAt', 
      sortDirection = 'desc',
      minPremium,
      maxPremium,
      startDate,
      endDate
    } = req.query;

    const { role, _id: userId } = req.user;
    let filter = { isDeleted: false };

    // Role-based filtering
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedAgentId = { $in: agentIds };
    }

    // Apply search filter
    if (search) {
      filter.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { companyPolicyNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply type filter
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Apply status filter
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Apply client filter
    if (clientId) {
      filter.clientId = new mongoose.Types.ObjectId(clientId);
    }

    // Apply agent filter
    if (agentId) {
      filter.assignedAgentId = new mongoose.Types.ObjectId(agentId);
    }

    // Apply premium range filters
    if (minPremium || maxPremium) {
      filter['premium.amount'] = {};
      if (minPremium) filter['premium.amount'].$gte = parseFloat(minPremium);
      if (maxPremium) filter['premium.amount'].$lte = parseFloat(maxPremium);
    }

    // Apply date filters
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortField] = sortDirection === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const policies = await Policy.find(filter)
      .populate('clientId', 'displayName email phone clientType')
      .populate('assignedAgentId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalPolicies = await Policy.countDocuments(filter);

    // Update policy statuses automatically
    await updatePolicyStatuses();

    res.status(200).json({
      success: true,
      data: policies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPolicies / parseInt(limit)),
        totalItems: totalPolicies,
        itemsPerPage: parseInt(limit)
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

// Get policy by ID with role-based access
exports.getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };

    // Role-based filtering
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedAgentId = { $in: agentIds };
    }

    const policy = await Policy.findOne(filter)
      .populate('clientId', 'displayName email phone clientType address city state')
      .populate('assignedAgentId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('documents.uploadedBy', 'firstName lastName')
      .populate('notes.createdBy', 'firstName lastName');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
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

// Create new policy with business logic validation
exports.createPolicy = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const policyData = req.body;

    // Validate client exists and is active
    const client = await Client.findById(policyData.clientId);
    if (!client || client.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Client not found or not active'
      });
    }

    // Validate assigned agent exists
    const agent = await User.findById(policyData.assignedAgentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({
        success: false,
        message: 'Invalid assigned agent'
      });
    }

    // Auto-assign to creator if agent role
    if (role === 'agent' && !policyData.assignedAgentId) {
      policyData.assignedAgentId = userId;
    }

    // Generate policy number if not provided
    if (!policyData.policyNumber) {
      policyData.policyNumber = await generatePolicyNumber();
    }

    // Calculate commission amount automatically
    if (policyData.commission && policyData.premium) {
      policyData.commission.amount = (policyData.premium.amount * policyData.commission.rate) / 100;
    }

    // Calculate next due date based on frequency
    if (policyData.premium && policyData.startDate) {
      policyData.premium.nextDueDate = calculateNextDueDate(policyData.startDate, policyData.premium.frequency);
    }

    // Set audit fields
    policyData.createdBy = userId;

    const policy = new Policy(policyData);
    await policy.save();

    // Update client policy count
    await Client.findByIdAndUpdate(policyData.clientId, {
      $inc: { policiesCount: 1 }
    });

    // Log activity
    await Activity.logActivity({
      action: `Created ${policyData.type} policy`,
      type: 'policy',
      operation: 'create',
      description: `Created policy: ${policy.policyNumber} for client: ${client.displayName}`,
      entityType: 'Policy',
      entityId: policy._id,
      entityName: policy.policyNumber,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    const populatedPolicy = await Policy.findById(policy._id)
      .populate('clientId', 'displayName email phone')
      .populate('assignedAgentId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: populatedPolicy
    });

  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create policy',
      errors: error.errors || []
    });
  }
};

// Update policy with role-based restrictions
exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;
    const updateData = req.body;

    // Check access permissions
    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      // Managers can only view, not edit (handled by middleware)
      return res.status(403).json({
        success: false,
        message: 'Managers have read-only access to policies'
      });
    }

    const existingPolicy = await Policy.findOne(filter);
    if (!existingPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    // Recalculate commission if premium or rate changes
    if (updateData.commission || updateData.premium) {
      const newPremium = updateData.premium?.amount || existingPolicy.premium.amount;
      const newRate = updateData.commission?.rate || existingPolicy.commission.rate;
      if (updateData.commission) {
        updateData.commission.amount = (newPremium * newRate) / 100;
      }
    }

    // Update next due date if frequency changes
    if (updateData.premium?.frequency) {
      updateData.premium.nextDueDate = calculateNextDueDate(
        existingPolicy.startDate, 
        updateData.premium.frequency
      );
    }

    // Set audit fields
    updateData.updatedBy = userId;

    const updatedPolicy = await Policy.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('clientId', 'displayName email phone')
     .populate('assignedAgentId', 'firstName lastName email');

    // Log activity
    await Activity.logActivity({
      action: `Updated ${updatedPolicy.type} policy`,
      type: 'policy',
      operation: 'update',
      description: `Updated policy: ${updatedPolicy.policyNumber}`,
      entityType: 'Policy',
      entityId: updatedPolicy._id,
      entityName: updatedPolicy.policyNumber,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: 'Policy updated successfully',
      data: updatedPolicy
    });

  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update policy',
      errors: error.errors || []
    });
  }
};

// Delete policy (soft delete - Super Admin only)
exports.deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    const policy = await Policy.findById(id);
    if (!policy || policy.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check for active claims
    // const activeClaims = await Claim.countDocuments({ policyId: id, status: { $in: ['pending', 'under_review'] } });
    // if (activeClaims > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Cannot delete policy with active claims'
    //   });
    // }

    // Soft delete
    policy.isDeleted = true;
    policy.deletedAt = new Date();
    policy.deletedBy = userId;
    await policy.save();

    // Update client policy count
    await Client.findByIdAndUpdate(policy.clientId, {
      $inc: { policiesCount: -1 }
    });

    // Log activity
    await Activity.logActivity({
      action: `Deleted ${policy.type} policy`,
      type: 'policy',
      operation: 'delete',
      description: `Deleted policy: ${policy.policyNumber}`,
      entityType: 'Policy',
      entityId: policy._id,
      entityName: policy.policyNumber,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

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

// Upload policy document
exports.uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, name } = req.body;
    const { role, _id: userId } = req.user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check policy access
    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    }

    const policy = await Policy.findOne(filter);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    // Create document object
    const document = {
      name: name || req.file.originalname,
      type: documentType,
      url: `/uploads/documents/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: userId
    };

    policy.documents.push(document);
    await policy.save();

    // Log activity
    await Activity.logActivity({
      action: `Uploaded ${documentType} document`,
      type: 'document',
      operation: 'create',
      description: `Uploaded ${documentType} document for policy: ${policy.policyNumber}`,
      entityType: 'Policy',
      entityId: policy._id,
      entityName: policy.policyNumber,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
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
exports.getPolicyDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    }

    const policy = await Policy.findOne(filter)
      .select('documents')
      .populate('documents.uploadedBy', 'firstName lastName');
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
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

// Delete policy document
exports.deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    }

    const policy = await Policy.findOne(filter);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    const document = policy.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete physical file
    try {
      const filePath = path.join(__dirname, '..', document.url);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError.message);
    }

    // Remove from database
    policy.documents.id(documentId).remove();
    await policy.save();

    // Log activity
    await Activity.logActivity({
      action: `Deleted ${document.type} document`,
      type: 'document',
      operation: 'delete',
      description: `Deleted ${document.type} document for policy: ${policy.policyNumber}`,
      entityType: 'Policy',
      entityId: policy._id,
      entityName: policy.policyNumber,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

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
exports.addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    }

    const policy = await Policy.findOne(filter);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    // Add payment to history
    policy.paymentHistory.push(paymentData);

    // Update next due date if it's a premium payment
    if (paymentData.amount >= policy.premium.amount) {
      policy.premium.nextDueDate = calculateNextDueDate(
        policy.premium.nextDueDate || new Date(),
        policy.premium.frequency
      );
    }

    await policy.save();

    // Log activity
    await Activity.logActivity({
      action: 'Added payment record',
      type: 'payment',
      operation: 'create',
      description: `Added payment of ${paymentData.amount} for policy: ${policy.policyNumber}`,
      entityType: 'Policy',
      entityId: policy._id,
      entityName: policy.policyNumber,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(201).json({
      success: true,
      message: 'Payment record added successfully',
      data: policy.paymentHistory[policy.paymentHistory.length - 1]
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
exports.getPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    }

    const policy = await Policy.findOne(filter).select('paymentHistory');
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: policy.paymentHistory
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
exports.renewPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { newEndDate, premium, notes } = req.body;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    }

    const policy = await Policy.findOne(filter);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    // Add renewal record
    const renewalRecord = {
      renewalDate: new Date(),
      previousEndDate: policy.endDate,
      premium: premium || policy.premium.amount,
      agentId: userId,
      notes: notes
    };

    policy.renewalHistory.push(renewalRecord);

    // Update policy details
    policy.endDate = new Date(newEndDate);
    policy.status = 'active';
    
    if (premium) {
      policy.premium.amount = premium;
      // Recalculate commission
      policy.commission.amount = (premium * policy.commission.rate) / 100;
    }

    // Update next due date
    policy.premium.nextDueDate = calculateNextDueDate(new Date(), policy.premium.frequency);

    await policy.save();

    // Log activity
    await Activity.logActivity({
      action: 'Renewed policy',
      type: 'policy',
      operation: 'update',
      description: `Renewed policy: ${policy.policyNumber} until ${newEndDate}`,
      entityType: 'Policy',
      entityId: policy._id,
      entityName: policy.policyNumber,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

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

// Add note to policy
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const noteData = req.body;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    }

    const policy = await Policy.findOne(filter);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    noteData.createdBy = userId;
    policy.notes.push(noteData);
    await policy.save();

    const populatedPolicy = await Policy.findById(id)
      .select('notes')
      .populate('notes.createdBy', 'firstName lastName');

    const newNote = populatedPolicy.notes[populatedPolicy.notes.length - 1];

    res.status(201).json({
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
exports.getPolicyNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    }

    const policy = await Policy.findOne(filter)
      .select('notes')
      .populate('notes.createdBy', 'firstName lastName');
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
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
exports.searchPolicies = async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    const { role, _id: userId } = req.user;

    let filter = {
      isDeleted: false,
      $or: [
        { policyNumber: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { companyPolicyNumber: { $regex: query, $options: 'i' } }
      ]
    };

    // Role-based filtering
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedAgentId = { $in: agentIds };
    }

    const policies = await Policy.find(filter)
      .populate('clientId', 'displayName email phone')
      .populate('assignedAgentId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

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
exports.getPoliciesByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { role, _id: userId } = req.user;

    // Authorization check
    if (role === 'agent' && agentId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const policies = await Policy.find({ 
      assignedAgentId: agentId, 
      isDeleted: false 
    })
      .populate('clientId', 'displayName email phone')
      .populate('assignedAgentId', 'firstName lastName')
      .sort({ createdAt: -1 });

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
exports.assignPolicyToAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    const { role, _id: userId } = req.user;

    const policy = await Policy.findOne({ _id: id, isDeleted: false });
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Verify agent exists
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    policy.assignedAgentId = agentId;
    policy.updatedBy = userId;
    await policy.save();

    // Log activity
    await Activity.logActivity({
      action: 'Assigned policy to agent',
      type: 'policy',
      operation: 'update',
      description: `Assigned policy ${policy.policyNumber} to agent ${agent.firstName} ${agent.lastName}`,
      entityType: 'Policy',
      entityId: policy._id,
      entityName: policy.policyNumber,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: 'Policy assigned successfully',
      data: await Policy.findById(id).populate('assignedAgentId', 'firstName lastName email')
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
exports.getPolicyStats = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    let matchFilter = { isDeleted: false };
    if (role === 'agent') {
      matchFilter.assignedAgentId = new mongoose.Types.ObjectId(userId);
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      matchFilter.assignedAgentId = { $in: agentIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    const stats = await Policy.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalPolicies: { $sum: 1 },
          activePolicies: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          expiredPolicies: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
          cancelledPolicies: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalPremium: { $sum: '$premium.amount' },
          avgPremium: { $avg: '$premium.amount' },
          totalCommission: { $sum: '$commission.amount' }
        }
      }
    ]);

    // Get policies by type
    const byType = await Policy.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const result = stats[0] || {
      totalPolicies: 0,
      activePolicies: 0,
      expiredPolicies: 0,
      cancelledPolicies: 0,
      totalPremium: 0,
      avgPremium: 0,
      totalCommission: 0
    };

    result.byType = byType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Get recent policies count
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPolicies = await Policy.countDocuments({
      ...matchFilter,
      createdAt: { $gte: thirtyDaysAgo }
    });

    result.recentPolicies = recentPolicies;

    res.status(200).json({
      success: true,
      data: result
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
exports.getExpiringPolicies = async (req, res) => {
  try {
    const { days = 30 } = req.params;
    const { role, _id: userId } = req.user;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));

    let filter = {
      isDeleted: false,
      status: 'active',
      endDate: { $lte: expiryDate, $gte: new Date() }
    };

    // Role-based filtering
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedAgentId = { $in: agentIds };
    }

    const expiringPolicies = await Policy.find(filter)
      .populate('clientId', 'displayName email phone')
      .populate('assignedAgentId', 'firstName lastName email')
      .sort({ endDate: 1 });

    res.status(200).json({
      success: true,
      data: expiringPolicies
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
exports.getPoliciesDueForRenewal = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const { role, _id: userId } = req.user;

    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + parseInt(days));

    let filter = {
      isDeleted: false,
      status: { $in: ['active', 'expired'] },
      endDate: { $lte: renewalDate }
    };

    // Role-based filtering
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedAgentId = { $in: agentIds };
    }

    const renewalPolicies = await Policy.find(filter)
      .populate('clientId', 'displayName email phone')
      .populate('assignedAgentId', 'firstName lastName email')
      .sort({ endDate: 1 });

    res.status(200).json({
      success: true,
      data: renewalPolicies
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
exports.bulkAssignPolicies = async (req, res) => {
  try {
    const { policyIds, agentId } = req.body;
    const { role, _id: userId } = req.user;

    // Verify agent exists
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    const result = await Policy.updateMany(
      { _id: { $in: policyIds }, isDeleted: false },
      { 
        assignedAgentId: agentId,
        updatedBy: userId
      }
    );

    // Log activity
    await Activity.logActivity({
      action: 'Bulk assigned policies',
      type: 'policy',
      operation: 'update',
      description: `Bulk assigned ${result.modifiedCount} policies to agent ${agent.firstName} ${agent.lastName}`,
      entityType: 'Policy',
      entityId: null,
      entityName: 'Bulk Assignment',
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} policies assigned successfully`,
      data: { assignedCount: result.modifiedCount }
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
exports.exportPolicies = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const filters = req.query;

    let filter = { isDeleted: false };
    
    // Role-based filtering
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedAgentId = { $in: agentIds };
    }

    // Apply additional filters
    if (filters.type && filters.type !== 'all') {
      filter.type = filters.type;
    }
    if (filters.status && filters.status !== 'All') {
      filter.status = filters.status;
    }

    const policies = await Policy.find(filter)
      .populate('clientId', 'displayName email phone')
      .populate('assignedAgentId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Transform data for export
    const exportData = policies.map(policy => ({
      policyNumber: policy.policyNumber,
      clientName: policy.clientId?.displayName || '',
      type: policy.type,
      status: policy.status,
      company: policy.company,
      premium: policy.premium.amount,
      coverage: policy.coverage.amount,
      startDate: policy.startDate.toISOString().split('T')[0],
      endDate: policy.endDate.toISOString().split('T')[0],
      assignedAgent: policy.assignedAgentId ? 
        `${policy.assignedAgentId.firstName} ${policy.assignedAgentId.lastName}` : '',
      createdAt: policy.createdAt.toISOString().split('T')[0]
    }));

    res.status(200).json({
      success: true,
      data: exportData,
      message: `${exportData.length} policies exported successfully`
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

// Helper function to generate policy number
async function generatePolicyNumber() {
  const year = new Date().getFullYear();
  const count = await Policy.countDocuments({ 
    policyNumber: { $regex: `^POL-${year}-` }
  });
  return `POL-${year}-${String(count + 1).padStart(3, '0')}`;
}

// Helper function to calculate next due date
function calculateNextDueDate(startDate, frequency) {
  const date = new Date(startDate);
  
  switch (frequency) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'semi-annual':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annual':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  
  return date;
}

// Helper function to automatically update policy statuses
async function updatePolicyStatuses() {
  const today = new Date();
  
  // Update expired policies
  await Policy.updateMany(
    {
      endDate: { $lt: today },
      status: 'active',
      isDeleted: false
    },
    { status: 'expired' }
  );
  
  // Update lapsed policies (overdue premium)
  await Policy.updateMany(
    {
      'premium.nextDueDate': { $lt: today },
      status: 'active',
      isDeleted: false
    },
    { status: 'lapsed' }
  );
}
