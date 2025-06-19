
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const Client = require('../models/Client');
const Activity = require('../models/Activity');
const User = require('../models/User');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

/**
 * Claim Controller with full CRUD operations, cross-module integration, and advanced business logic
 */

// Required documents for different insurance types
const REQUIRED_DOCUMENTS = {
  'Auto': ['incident_report', 'police_report', 'photo_evidence'],
  'Home': ['incident_report', 'photo_evidence', 'repair_estimate'],
  'Life': ['medical_report', 'insurance_form'],
  'Health': ['medical_report', 'receipt'],
  'Travel': ['incident_report', 'receipt'],
  'Business': ['incident_report', 'repair_estimate'],
  'Disability': ['medical_report', 'insurance_form'],
  'Property': ['incident_report', 'photo_evidence', 'repair_estimate'],
  'Liability': ['incident_report', 'witness_statement'],
  'Workers Compensation': ['incident_report', 'medical_report']
};

// Status workflow validation
const VALID_STATUS_TRANSITIONS = {
  'Reported': ['Under Review', 'Pending'],
  'Under Review': ['Pending', 'Approved', 'Rejected'],
  'Pending': ['Under Review', 'Approved', 'Rejected'],
  'Approved': ['Settled', 'Closed'],
  'Rejected': ['Closed'],
  'Settled': ['Closed'],
  'Closed': []
};

// Get form data - policies for claim creation
exports.getPoliciesForClaim = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = { isDeleted: false, status: 'active' };

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
      .select('policyNumber type company clientId premium coverage startDate endDate')
      .sort({ policyNumber: 1 });

    res.status(200).json({
      success: true,
      data: policies
    });

  } catch (error) {
    console.error('Error fetching policies for claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policies',
      error: error.message
    });
  }
};

// Get form data - clients for claim creation
exports.getClientsForClaim = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = { isDeleted: false, status: 'Active' };

    // Role-based filtering through policies
    if (role === 'agent') {
      const agentPolicyClients = await Policy.find({ 
        assignedAgentId: userId, 
        isDeleted: false 
      }).select('clientId');
      const clientIds = agentPolicyClients.map(p => p.clientId);
      filter._id = { $in: clientIds };
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      const teamPolicyClients = await Policy.find({ 
        assignedAgentId: { $in: agentIds }, 
        isDeleted: false 
      }).select('clientId');
      const clientIds = teamPolicyClients.map(p => p.clientId);
      filter._id = { $in: clientIds };
    }

    const clients = await Client.find(filter)
      .select('displayName email phone clientType address city state')
      .sort({ displayName: 1 });

    res.status(200).json({
      success: true,
      data: clients
    });

  } catch (error) {
    console.error('Error fetching clients for claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message
    });
  }
};

// Get specific policy details for claim form
exports.getPolicyDetails = async (req, res) => {
  try {
    const { policyId } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: policyId, isDeleted: false };

    // Role-based access check
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedAgentId = { $in: agentIds };
    }

    const policy = await Policy.findOne(filter)
      .populate('clientId', 'displayName email phone address city state')
      .populate('assignedAgentId', 'firstName lastName email');

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
    console.error('Error fetching policy details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policy details',
      error: error.message
    });
  }
};

// Get all claims with filtering and pagination
exports.getAllClaims = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status = 'All', 
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

    const { role, _id: userId } = req.user;
    let filter = { isDeleted: false };

    // Role-based filtering
    if (role === 'agent') {
      filter.assignedTo = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedTo = { $in: agentIds };
    }

    // Apply search filter
    if (search) {
      filter.$or = [
        { claimNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'contactDetails.primaryContact': { $regex: search, $options: 'i' } }
      ];
    }

    // Apply filters
    if (status && status !== 'All') filter.status = status;
    if (claimType) filter.claimType = claimType;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    if (clientId) filter.clientId = new mongoose.Types.ObjectId(clientId);
    if (policyId) filter.policyId = new mongoose.Types.ObjectId(policyId);

    // Apply amount range filters
    if (minAmount || maxAmount) {
      filter.claimAmount = {};
      if (minAmount) filter.claimAmount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.claimAmount.$lte = parseFloat(maxAmount);
    }

    // Apply date filters
    if (dateFrom || dateTo) {
      filter.reportedDate = {};
      if (dateFrom) filter.reportedDate.$gte = new Date(dateFrom);
      if (dateTo) filter.reportedDate.$lte = new Date(dateTo);
    }

    // Build sort object
    const sort = {};
    sort[sortField] = sortDirection === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const claims = await Claim.find(filter)
      .populate('clientId', 'displayName email phone')
      .populate('policyId', 'policyNumber type company')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalClaims = await Claim.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: claims,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalClaims / parseInt(limit)),
        totalItems: totalClaims,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims',
      error: error.message
    });
  }
};

// Get claim by ID
exports.getClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };

    // Role-based filtering
    if (role === 'agent') {
      filter.assignedTo = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedTo = { $in: agentIds };
    }

    const claim = await Claim.findOne(filter)
      .populate('clientId', 'displayName email phone address city state')
      .populate('policyId', 'policyNumber type company premium coverage deductible')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('documents.uploadedBy', 'firstName lastName')
      .populate('notes.createdBy', 'firstName lastName')
      .populate('timeline.createdBy', 'firstName lastName');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: claim
    });

  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim',
      error: error.message
    });
  }
};

// Create new claim with validation and auto-assignment
exports.createClaim = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const claimData = req.body;

    // Validate policy exists and is active
    const policy = await Policy.findById(claimData.policyId).populate('clientId');
    if (!policy || policy.isDeleted || policy.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Policy not found or not active'
      });
    }

    // Validate client exists and matches policy
    if (claimData.clientId && claimData.clientId !== policy.clientId._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Client does not match policy holder'
      });
    }

    // Auto-set client from policy if not provided
    if (!claimData.clientId) {
      claimData.clientId = policy.clientId._id;
    }

    // Validate incident date is within policy period
    const incidentDate = new Date(claimData.incidentDate);
    if (incidentDate < policy.startDate || incidentDate > policy.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Incident date is outside policy coverage period'
      });
    }

    // Validate claim amount against policy coverage
    if (claimData.claimAmount > policy.coverage.amount) {
      return res.status(400).json({
        success: false,
        message: `Claim amount exceeds policy coverage limit of ${policy.coverage.amount}`
      });
    }

    // Auto-apply deductible from policy
    claimData.deductible = policy.deductible || 0;

    // Auto-assign to policy's agent or creator
    claimData.assignedTo = policy.assignedAgentId || userId;
    claimData.createdBy = userId;

    // Check for duplicate claims
    const duplicateClaim = await checkDuplicateClaim(claimData.clientId, claimData.policyId, incidentDate, claimData.claimAmount);
    if (duplicateClaim) {
      return res.status(400).json({
        success: false,
        message: 'Similar claim already exists for this policy and incident date'
      });
    }

    // Calculate fraud risk score
    claimData.riskFactors = await calculateFraudRisk(claimData, policy);

    const claim = new Claim(claimData);
    await claim.save();

    // Update policy statistics
    await Policy.findByIdAndUpdate(policy._id, {
      $inc: { 
        'claimsCount': 1,
        'totalClaimsAmount': claimData.claimAmount
      }
    });

    // Update client risk profile
    await updateClientRiskProfile(claimData.clientId, 'claim_created', claimData.claimAmount);

    // Log activity
    await Activity.logActivity({
      action: 'Created claim',
      type: 'claim',
      operation: 'create',
      description: `Created ${claimData.claimType} claim: ${claim.claimNumber}`,
      entityType: 'Claim',
      entityId: claim._id,
      entityName: claim.claimNumber,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate('clientId', 'displayName email phone')
      .populate('policyId', 'policyNumber type company')
      .populate('assignedTo', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Claim created successfully',
      data: populatedClaim
    });

  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create claim',
      errors: error.errors || []
    });
  }
};

// Update claim with workflow validation
exports.updateClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;
    const updateData = req.body;

    // Check access permissions
    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedTo = userId;
    } else if (role === 'manager') {
      // Managers have read-only access
      return res.status(403).json({
        success: false,
        message: 'Managers have read-only access to claims'
      });
    }

    const existingClaim = await Claim.findOne(filter);
    if (!existingClaim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found or access denied'
      });
    }

    // Validate status transitions if status is being updated
    if (updateData.status && updateData.status !== existingClaim.status) {
      if (!isValidStatusTransition(existingClaim.status, updateData.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from ${existingClaim.status} to ${updateData.status}`
        });
      }

      // Check if super admin approval is required for certain status changes
      if (requiresSuperAdminApproval(existingClaim.status, updateData.status) && role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Super admin approval required for this status change'
        });
      }

      // Auto-settlement calculations for approved claims
      if (updateData.status === 'Approved' && !updateData.approvedAmount) {
        updateData.approvedAmount = Math.min(
          existingClaim.claimAmount - existingClaim.deductible,
          (await Policy.findById(existingClaim.policyId)).coverage.amount
        );
      }
    }

    // Validate large settlement amounts
    if (updateData.approvedAmount && updateData.approvedAmount > 50000 && role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Super admin approval required for settlements over $50,000'
      });
    }

    updateData.updatedBy = userId;

    const updatedClaim = await Claim.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('clientId', 'displayName email phone')
     .populate('policyId', 'policyNumber type company')
     .populate('assignedTo', 'firstName lastName email');

    // Update client risk profile on status change
    if (updateData.status && updateData.status !== existingClaim.status) {
      await updateClientRiskProfile(updatedClaim.clientId._id, 'status_change', updateData.status);
    }

    // Update policy premium on claim closure
    if (updateData.status === 'Closed' || updateData.status === 'Settled') {
      await recalculatePolicyPremium(updatedClaim.policyId._id, updatedClaim.approvedAmount);
    }

    // Log activity
    await Activity.logActivity({
      action: 'Updated claim',
      type: 'claim',
      operation: 'update',
      description: `Updated claim: ${updatedClaim.claimNumber}`,
      entityType: 'Claim',
      entityId: updatedClaim._id,
      entityName: updatedClaim.claimNumber,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: 'Claim updated successfully',
      data: updatedClaim
    });

  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update claim',
      errors: error.errors || []
    });
  }
};

// Delete claim (soft delete - Super Admin only)
exports.deleteClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    const claim = await Claim.findById(id);
    if (!claim || claim.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Only allow deletion if claim is not settled or approved
    if (['Settled', 'Approved'].includes(claim.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete settled or approved claims'
      });
    }

    await claim.softDelete(userId);

    // Update policy statistics
    await Policy.findByIdAndUpdate(claim.policyId, {
      $inc: { 
        'claimsCount': -1,
        'totalClaimsAmount': -claim.claimAmount
      }
    });

    // Log activity
    await Activity.logActivity({
      action: 'Deleted claim',
      type: 'claim',
      operation: 'delete',
      description: `Deleted claim: ${claim.claimNumber}`,
      entityType: 'Claim',
      entityId: claim._id,
      entityName: claim.claimNumber,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: 'Claim deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete claim',
      error: error.message
    });
  }
};

// Upload claim document with auto timeline event
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

    // Check claim access
    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedTo = userId;
    }

    const claim = await Claim.findOne(filter);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found or access denied'
      });
    }

    // Create document object
    const document = {
      name: name || req.file.originalname,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      documentType: documentType,
      filePath: `/uploads/documents/${req.file.filename}`,
      uploadedBy: userId
    };

    claim.documents.push(document);

    // Auto-create timeline event
    await claim.addTimelineEvent(
      `Document uploaded: ${documentType}`,
      `${name || req.file.originalname} uploaded`,
      'document_uploaded',
      userId
    );

    await claim.save();

    // Log activity
    await Activity.logActivity({
      action: `Uploaded ${documentType} document`,
      type: 'document',
      operation: 'create',
      description: `Uploaded ${documentType} document for claim: ${claim.claimNumber}`,
      entityType: 'Claim',
      entityId: claim._id,
      entityName: claim.claimNumber,
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

// Get claim documents
exports.getClaimDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedTo = userId;
    }

    const claim = await Claim.findOne(filter)
      .select('documents')
      .populate('documents.uploadedBy', 'firstName lastName');
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: claim.documents
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

// Delete claim document
exports.deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedTo = userId;
    }

    const claim = await Claim.findOne(filter);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found or access denied'
      });
    }

    const document = claim.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete physical file
    try {
      const filePath = path.join(__dirname, '..', document.filePath);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError.message);
    }

    // Remove from database
    claim.documents.id(documentId).remove();
    await claim.save();

    // Log activity
    await Activity.logActivity({
      action: `Deleted ${document.documentType} document`,
      type: 'document',
      operation: 'delete',
      description: `Deleted ${document.documentType} document for claim: ${claim.claimNumber}`,
      entityType: 'Claim',
      entityId: claim._id,
      entityName: claim.claimNumber,
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

// Update claim status with workflow validation
exports.updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, approvedAmount } = req.body;
    const { role, _id: userId } = req.user;

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Validate status transition
    if (!isValidStatusTransition(claim.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${claim.status} to ${status}`
      });
    }

    // Check required documents before approval
    if (status === 'Approved') {
      const requiredDocs = REQUIRED_DOCUMENTS[claim.claimType] || [];
      const uploadedDocTypes = claim.documents.map(doc => doc.documentType);
      const missingDocs = requiredDocs.filter(docType => !uploadedDocTypes.includes(docType));
      
      if (missingDocs.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required documents: ${missingDocs.join(', ')}`
        });
      }
    }

    claim.status = status;
    if (approvedAmount !== undefined) claim.approvedAmount = approvedAmount;
    claim.updatedBy = userId;

    // Add timeline event
    await claim.addTimelineEvent(
      `Status changed to ${status}`,
      reason || `Status updated to ${status}`,
      status.toLowerCase().replace(' ', '_'),
      userId
    );

    await claim.save();

    res.status(200).json({
      success: true,
      message: 'Claim status updated successfully',
      data: claim
    });

  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update claim status',
      error: error.message
    });
  }
};

// Add note to claim
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const noteData = req.body;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedTo = userId;
    }

    const claim = await Claim.findOne(filter);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found or access denied'
      });
    }

    await claim.addNote(noteData.content, noteData.type, noteData.priority, userId);

    const populatedClaim = await Claim.findById(id)
      .select('notes')
      .populate('notes.createdBy', 'firstName lastName');

    const newNote = populatedClaim.notes[populatedClaim.notes.length - 1];

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

// Get claim notes
exports.getClaimNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: id, isDeleted: false };
    if (role === 'agent') {
      filter.assignedTo = userId;
    }

    const claim = await Claim.findOne(filter)
      .select('notes')
      .populate('notes.createdBy', 'firstName lastName');
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: claim.notes
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

// Search claims
exports.searchClaims = async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    const { role, _id: userId } = req.user;

    let filter = {
      isDeleted: false,
      $or: [
        { claimNumber: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'contactDetails.primaryContact': { $regex: query, $options: 'i' } }
      ]
    };

    // Role-based filtering
    if (role === 'agent') {
      filter.assignedTo = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedTo = { $in: agentIds };
    }

    const claims = await Claim.find(filter)
      .populate('clientId', 'displayName email phone')
      .populate('policyId', 'policyNumber type')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: claims
    });

  } catch (error) {
    console.error('Error searching claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search claims',
      error: error.message
    });
  }
};

// Get claims statistics
exports.getClaimsStats = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    let matchFilter = { isDeleted: false };
    if (role === 'agent') {
      matchFilter.assignedTo = new mongoose.Types.ObjectId(userId);
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      matchFilter.assignedTo = { $in: agentIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    const stats = await Claim.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalClaims: { $sum: 1 },
          reportedClaims: { $sum: { $cond: [{ $eq: ['$status', 'Reported'] }, 1, 0] } },
          underReviewClaims: { $sum: { $cond: [{ $eq: ['$status', 'Under Review'] }, 1, 0] } },
          pendingClaims: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          approvedClaims: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
          rejectedClaims: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
          settledClaims: { $sum: { $cond: [{ $eq: ['$status', 'Settled'] }, 1, 0] } },
          totalClaimAmount: { $sum: '$claimAmount' },
          totalApprovedAmount: { $sum: '$approvedAmount' },
          avgClaimAmount: { $avg: '$claimAmount' }
        }
      }
    ]);

    // Get claims by type
    const byType = await Claim.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$claimType', count: { $sum: 1 } } }
    ]);

    const result = stats[0] || {
      totalClaims: 0,
      reportedClaims: 0,
      underReviewClaims: 0,
      pendingClaims: 0,
      approvedClaims: 0,
      rejectedClaims: 0,
      settledClaims: 0,
      totalClaimAmount: 0,
      totalApprovedAmount: 0,
      avgClaimAmount: 0
    };

    result.byType = byType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching claims stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims statistics',
      error: error.message
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    let matchFilter = { isDeleted: false };
    if (role === 'agent') {
      matchFilter.assignedTo = new mongoose.Types.ObjectId(userId);
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      matchFilter.assignedTo = { $in: agentIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    const totalClaims = await Claim.countDocuments(matchFilter);
    const pendingClaims = await Claim.countDocuments({ ...matchFilter, status: { $in: ['Reported', 'Under Review', 'Pending'] } });
    const approvedClaims = await Claim.countDocuments({ ...matchFilter, status: 'Approved' });
    const settledClaims = await Claim.countDocuments({ ...matchFilter, status: 'Settled' });

    // Get aging data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const agingClaims = await Claim.countDocuments({
      ...matchFilter,
      reportedDate: { $lte: thirtyDaysAgo },
      status: { $nin: ['Settled', 'Closed', 'Rejected'] }
    });

    res.status(200).json({
      success: true,
      data: {
        totalClaims,
        pendingClaims,
        approvedClaims,
        settledClaims,
        agingClaims
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get claims aging report
exports.getClaimsAgingReport = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    let matchFilter = { isDeleted: false, status: { $nin: ['Settled', 'Closed', 'Rejected'] } };
    if (role === 'agent') {
      matchFilter.assignedTo = new mongoose.Types.ObjectId(userId);
    }

    const claims = await Claim.find(matchFilter)
      .populate('clientId', 'displayName email')
      .populate('policyId', 'policyNumber type')
      .populate('assignedTo', 'firstName lastName')
      .sort({ reportedDate: 1 });

    const agingReport = claims.map(claim => {
      const daysOld = Math.floor((Date.now() - claim.reportedDate) / (1000 * 60 * 60 * 24));
      return {
        ...claim.toObject(),
        daysOld,
        agingCategory: daysOld <= 30 ? '0-30 days' : 
                      daysOld <= 60 ? '31-60 days' : 
                      daysOld <= 90 ? '61-90 days' : '90+ days'
      };
    });

    res.status(200).json({
      success: true,
      data: agingReport
    });

  } catch (error) {
    console.error('Error generating aging report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate aging report',
      error: error.message
    });
  }
};

// Get settlement report
exports.getSettlementReport = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const { startDate, endDate, claimType } = req.query;

    let matchFilter = { isDeleted: false, status: 'Settled' };
    if (role === 'agent') {
      matchFilter.assignedTo = new mongoose.Types.ObjectId(userId);
    }

    if (startDate || endDate) {
      matchFilter.actualSettlement = {};
      if (startDate) matchFilter.actualSettlement.$gte = new Date(startDate);
      if (endDate) matchFilter.actualSettlement.$lte = new Date(endDate);
    }

    if (claimType) matchFilter.claimType = claimType;

    const settlements = await Claim.find(matchFilter)
      .populate('clientId', 'displayName')
      .populate('policyId', 'policyNumber type')
      .sort({ actualSettlement: -1 });

    const report = {
      totalSettlements: settlements.length,
      totalSettlementAmount: settlements.reduce((sum, claim) => sum + claim.approvedAmount, 0),
      avgSettlementAmount: settlements.length > 0 ? settlements.reduce((sum, claim) => sum + claim.approvedAmount, 0) / settlements.length : 0,
      settlements: settlements
    };

    res.status(200).json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error generating settlement report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate settlement report',
      error: error.message
    });
  }
};

// Bulk update claims
exports.bulkUpdateClaims = async (req, res) => {
  try {
    const { claimIds, updateData } = req.body;
    const { role, _id: userId } = req.user;

    if (!Array.isArray(claimIds) || claimIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim IDs'
      });
    }

    let filter = { _id: { $in: claimIds }, isDeleted: false };
    if (role === 'agent') {
      filter.assignedTo = userId;
    }

    const result = await Claim.updateMany(
      filter,
      { ...updateData, updatedBy: userId }
    );

    // Log activity
    await Activity.logActivity({
      action: 'Bulk updated claims',
      type: 'claim',
      operation: 'update',
      description: `Bulk updated ${result.modifiedCount} claims`,
      entityType: 'Claim',
      entityId: null,
      entityName: 'Bulk Update',
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} claims updated successfully`,
      data: { updatedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Error bulk updating claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update claims',
      error: error.message
    });
  }
};

// Bulk assign claims to agents
exports.bulkAssignClaims = async (req, res) => {
  try {
    const { claimIds, assignedTo } = req.body;
    const { role, _id: userId } = req.user;

    if (!Array.isArray(claimIds) || claimIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim IDs'
      });
    }

    // Verify agent exists
    const agent = await User.findById(assignedTo);
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    const result = await Claim.updateMany(
      { _id: { $in: claimIds }, isDeleted: false },
      { assignedTo: assignedTo, updatedBy: userId }
    );

    // Log activity
    await Activity.logActivity({
      action: 'Bulk assigned claims',
      type: 'claim',
      operation: 'update',
      description: `Bulk assigned ${result.modifiedCount} claims to agent ${agent.firstName} ${agent.lastName}`,
      entityType: 'Claim',
      entityId: null,
      entityName: 'Bulk Assignment',
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} claims assigned successfully`,
      data: { assignedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Error bulk assigning claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk assign claims',
      error: error.message
    });
  }
};

// Export claims
exports.exportClaims = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const filters = req.query;

    let filter = { isDeleted: false };
    
    // Role-based filtering
    if (role === 'agent') {
      filter.assignedTo = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedTo = { $in: agentIds };
    }

    // Apply additional filters
    if (filters.status && filters.status !== 'All') {
      filter.status = filters.status;
    }
    if (filters.claimType) {
      filter.claimType = filters.claimType;
    }

    const claims = await Claim.find(filter)
      .populate('clientId', 'displayName email phone')
      .populate('policyId', 'policyNumber type')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Transform data for export
    const exportData = claims.map(claim => ({
      claimNumber: claim.claimNumber,
      clientName: claim.clientId?.displayName || '',
      policyNumber: claim.policyId?.policyNumber || '',
      claimType: claim.claimType,
      status: claim.status,
      priority: claim.priority,
      claimAmount: claim.claimAmount,
      approvedAmount: claim.approvedAmount,
      incidentDate: claim.incidentDate.toISOString().split('T')[0],
      reportedDate: claim.reportedDate.toISOString().split('T')[0],
      assignedTo: claim.assignedTo ? 
        `${claim.assignedTo.firstName} ${claim.assignedTo.lastName}` : '',
      description: claim.description
    }));

    res.status(200).json({
      success: true,
      data: exportData,
      message: `${exportData.length} claims exported successfully`
    });

  } catch (error) {
    console.error('Error exporting claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export claims',
      error: error.message
    });
  }
};

// Download template
exports.downloadTemplate = async (req, res) => {
  try {
    // This would serve a template file
    res.status(200).json({
      success: true,
      message: 'Template download functionality',
      data: { templateUrl: '/templates/claims_import_template.xlsx' }
    });

  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download template',
      error: error.message
    });
  }
};

// Import claims
exports.importClaims = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // This would process the uploaded file and create claims
    res.status(200).json({
      success: true,
      message: 'Claims imported successfully',
      data: { importedCount: 0 }
    });

  } catch (error) {
    console.error('Error importing claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import claims',
      error: error.message
    });
  }
};

// Helper functions

// Check for duplicate claims
async function checkDuplicateClaim(clientId, policyId, incidentDate, claimAmount) {
  const startDate = new Date(incidentDate);
  const endDate = new Date(incidentDate);
  endDate.setDate(endDate.getDate() + 7); // Check within 7 days

  return await Claim.findOne({
    clientId: clientId,
    policyId: policyId,
    incidentDate: { $gte: startDate, $lte: endDate },
    claimAmount: { $gte: claimAmount * 0.9, $lte: claimAmount * 1.1 }, // Within 10% range
    isDeleted: false
  });
}

// Calculate fraud risk score
async function calculateFraudRisk(claimData, policy) {
  let riskScore = 0;
  const fraudIndicators = [];

  // Check claim amount vs premium ratio
  const claimToPremiumRatio = claimData.claimAmount / policy.premium.amount;
  if (claimToPremiumRatio > 5) {
    riskScore += 20;
    fraudIndicators.push('High claim to premium ratio');
  }

  // Check recent claims from same client
  const recentClaims = await Claim.countDocuments({
    clientId: claimData.clientId,
    reportedDate: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    isDeleted: false
  });

  if (recentClaims > 2) {
    riskScore += 30;
    fraudIndicators.push('Multiple recent claims');
  }

  // Check incident timing
  const incidentDate = new Date(claimData.incidentDate);
  const reportedDate = new Date();
  const daysDifference = Math.floor((reportedDate - incidentDate) / (1000 * 60 * 60 * 24));

  if (daysDifference > 30) {
    riskScore += 15;
    fraudIndicators.push('Late reporting');
  }

  return {
    riskScore: Math.min(riskScore, 100),
    fraudIndicators,
    investigationRequired: riskScore > 50
  };
}

// Update client risk profile
async function updateClientRiskProfile(clientId, event, data) {
  try {
    const client = await Client.findById(clientId);
    if (!client) return;

    if (!client.riskProfile) {
      client.riskProfile = {
        riskScore: 0,
        riskFactors: [],
        lastUpdated: new Date()
      };
    }

    switch (event) {
      case 'claim_created':
        client.riskProfile.riskScore += data > 10000 ? 10 : 5;
        break;
      case 'status_change':
        if (data === 'Rejected') {
          client.riskProfile.riskScore += 15;
          client.riskProfile.riskFactors.push('Rejected claim');
        }
        break;
    }

    client.riskProfile.riskScore = Math.min(client.riskProfile.riskScore, 100);
    client.riskProfile.lastUpdated = new Date();

    await client.save();
  } catch (error) {
    console.error('Error updating client risk profile:', error);
  }
}

// Validate status transitions
function isValidStatusTransition(currentStatus, newStatus) {
  return VALID_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
}

// Check if status change requires super admin approval
function requiresSuperAdminApproval(currentStatus, newStatus) {
  const restrictedTransitions = [
    { from: 'Rejected', to: 'Approved' },
    { from: 'Closed', to: 'Approved' }
  ];
  
  return restrictedTransitions.some(t => t.from === currentStatus && t.to === newStatus);
}

// Recalculate policy premium based on claims
async function recalculatePolicyPremium(policyId, settlementAmount) {
  try {
    const policy = await Policy.findById(policyId);
    if (!policy) return;

    // Simple premium adjustment based on claims
    const claimsHistory = await Claim.find({
      policyId: policyId,
      status: { $in: ['Settled', 'Approved'] },
      isDeleted: false
    });

    const totalClaims = claimsHistory.reduce((sum, claim) => sum + claim.approvedAmount, 0);
    const claimRatio = totalClaims / policy.premium.amount;

    // Adjust premium for next renewal
    if (claimRatio > 1) {
      const adjustmentFactor = Math.min(1.5, 1 + (claimRatio - 1) * 0.2);
      policy.premium.renewalAdjustment = adjustmentFactor;
    }

    await policy.save();
  } catch (error) {
    console.error('Error recalculating policy premium:', error);
  }
}
