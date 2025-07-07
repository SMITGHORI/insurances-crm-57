
const Client = require('../models/Client');
const Activity = require('../models/Activity');
const User = require('../models/User');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

/**
 * Client Controller with full CRUD operations and role-based access
 */

// Get all clients with filtering, pagination, and role-based access
exports.getAllClients = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      type, 
      status = 'All', 
      sortField = 'createdAt', 
      sortDirection = 'desc' 
    } = req.query;

    const { role, _id: userId, isFallbackUser } = req.user;
    let filter = {};

    // Handle fallback users - super admin sees all, agent sees none (no real data)
    if (isFallbackUser) {
      if (role?.name === 'super_admin' || role === 'super_admin') {
        // Super admin fallback user sees all clients (no filter)
      } else {
        // Agent fallback user sees no clients (empty result)
        filter._id = { $in: [] };
      }
    } else {
      // Role-based filtering for database users
      if (role?.name === 'agent' || role === 'agent') {
        filter.assignedAgentId = userId;
      } else if (role?.name === 'manager' || role === 'manager') {
        // Managers see clients from their team/region
        const teamAgents = await User.find({ managerId: userId }).select('_id');
        const agentIds = teamAgents.map(agent => agent._id);
        agentIds.push(userId); // Include manager's own clients
        filter.assignedAgentId = { $in: agentIds };
      }
      // Super admin sees all clients (no additional filter)
    }

    // Apply search filter
    if (search) {
      filter.$or = [
        { clientId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'individualData.firstName': { $regex: search, $options: 'i' } },
        { 'individualData.lastName': { $regex: search, $options: 'i' } },
        { 'corporateData.companyName': { $regex: search, $options: 'i' } },
        { 'groupData.groupName': { $regex: search, $options: 'i' } }
      ];
    }

    // Apply type filter
    if (type && type !== 'all') {
      filter.clientType = type;
    }

    // Apply status filter
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    if (sortField === 'name') {
      sort['individualData.firstName'] = sortDirection === 'desc' ? -1 : 1;
    } else {
      sort[sortField] = sortDirection === 'desc' ? -1 : 1;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const clients = await Client.find(filter)
      .populate('assignedAgentId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalClients = await Client.countDocuments(filter);

    // Transform data for frontend compatibility
    const transformedClients = clients.map(client => ({
      _id: client._id,
      clientId: client.clientId,
      clientType: client.clientType,
      name: client.displayName,
      email: client.email,
      phone: client.phone,
      type: client.clientType.charAt(0).toUpperCase() + client.clientType.slice(1),
      contact: client.phone,
      location: `${client.city}, ${client.state}`,
      status: client.status,
      policies: client.policiesCount,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      assignedAgent: client.assignedAgentId,
      // Include type-specific data
      ...client.individualData?.toObject(),
      ...client.corporateData?.toObject(),
      ...client.groupData?.toObject()
    }));

    res.status(200).json({
      success: true,
      data: transformedClients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalClients / parseInt(limit)),
        totalItems: totalClients,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message
    });
  }
};

// Get client by ID with role-based access
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId, isFallbackUser } = req.user;

    let filter = { _id: id };

    // Handle fallback users
    if (isFallbackUser) {
      if (role?.name === 'agent' || role === 'agent') {
        // Agent fallback user cannot access any specific client
        return res.status(404).json({
          success: false,
          message: 'Client not found or access denied'
        });
      }
      // Super admin fallback user can access any client (no additional filter)
    } else {
      // Role-based filtering for database users
      if (role?.name === 'agent' || role === 'agent') {
        filter.assignedAgentId = userId;
      } else if (role?.name === 'manager' || role === 'manager') {
        const teamAgents = await User.find({ managerId: userId }).select('_id');
        const agentIds = teamAgents.map(agent => agent._id);
        agentIds.push(userId);
        filter.assignedAgentId = { $in: agentIds };
      }
    }

    const client = await Client.findOne(filter)
      .populate('assignedAgentId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or access denied'
      });
    }

    // Transform for frontend
    const transformedClient = {
      _id: client._id,
      clientId: client.clientId,
      clientType: client.clientType,
      name: client.displayName,
      email: client.email,
      phone: client.phone,
      altPhone: client.altPhone,
      address: client.address,
      city: client.city,
      state: client.state,
      pincode: client.pincode,
      country: client.country,
      status: client.status,
      source: client.source,
      notes: client.notes,
      assignedAgentId: client.assignedAgentId?._id,
      assignedAgent: client.assignedAgentId,
      policies: client.policiesCount,
      documents: client.documents,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      createdBy: client.createdBy,
      updatedBy: client.updatedBy,
      // Include type-specific data
      ...client.individualData?.toObject(),
      ...client.corporateData?.toObject(),
      ...client.groupData?.toObject()
    };

    res.status(200).json({
      success: true,
      data: transformedClient
    });

  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client',
      error: error.message
    });
  }
};

// Create new client with business logic validation
exports.createClient = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const clientData = req.body;

    // Business logic validations
    await validateBusinessRules(clientData);

    // Auto-assign to agent if they're creating the client
    if (role === 'agent' && !clientData.assignedAgentId) {
      clientData.assignedAgentId = userId;
    }

    // Set audit fields
    clientData.createdBy = userId;

    // Create type-specific data structure
    const clientDoc = {
      clientType: clientData.clientType,
      email: clientData.email,
      phone: clientData.phone,
      altPhone: clientData.altPhone,
      address: clientData.address,
      city: clientData.city,
      state: clientData.state,
      pincode: clientData.pincode,
      country: clientData.country || 'India',
      status: clientData.status || 'Active',
      source: clientData.source,
      notes: clientData.notes,
      assignedAgentId: clientData.assignedAgentId,
      createdBy: clientData.createdBy,
      documents: clientData.documents,
      individualData: clientData.clientType === 'individual' ? clientData.individualData : undefined,
      corporateData: clientData.clientType === 'corporate' ? clientData.corporateData : undefined,
      groupData: clientData.clientType === 'group' ? clientData.groupData : undefined
    };

    const client = new Client(clientDoc);
    await client.save();

    // Log activity
    await Activity.logActivity({
      action: `Created ${clientData.clientType} client`,
      type: 'client',
      operation: 'create',
      description: `Created client: ${client.displayName}`,
      entityType: 'Client',
      entityId: client._id,
      entityName: client.displayName,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    const populatedClient = await Client.findById(client._id)
      .populate('assignedAgentId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: transformClientResponse(populatedClient)
    });

  } catch (error) {
    console.error('Error creating client:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create client',
      errors: error.errors || []
    });
  }
};

// Update client with role-based restrictions
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;
    const updateData = req.body;

    // Check access permissions
    let filter = { _id: id };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedAgentId = { $in: agentIds };
    }

    const existingClient = await Client.findOne(filter);
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or access denied'
      });
    }

    // Validate business rules for updates
    await validateBusinessRules(updateData, id);

    // Restrict agent updates to certain fields only
    if (role === 'agent') {
      const allowedFields = ['phone', 'altPhone', 'address', 'city', 'state', 'pincode', 'notes'];
      const restrictedUpdate = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          restrictedUpdate[field] = updateData[field];
        }
      });
      Object.assign(updateData, restrictedUpdate);
    }

    // Set audit fields
    updateData.updatedBy = userId;

    // Update type-specific data
    if (updateData.clientType) {
      if (updateData.clientType === 'individual' && updateData.individualData) {
        updateData.individualData = updateData.individualData;
        updateData.corporateData = undefined;
        updateData.groupData = undefined;
      } else if (updateData.clientType === 'corporate' && updateData.corporateData) {
        updateData.corporateData = updateData.corporateData;
        updateData.individualData = undefined;
        updateData.groupData = undefined;
      } else if (updateData.clientType === 'group' && updateData.groupData) {
        updateData.groupData = updateData.groupData;
        updateData.individualData = undefined;
        updateData.corporateData = undefined;
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedAgentId', 'firstName lastName email');

    // Log activity
    await Activity.logActivity({
      action: `Updated ${updatedClient.clientType} client`,
      type: 'client',
      operation: 'update',
      description: `Updated client: ${updatedClient.displayName}`,
      entityType: 'Client',
      entityId: updatedClient._id,
      entityName: updatedClient.displayName,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: transformClientResponse(updatedClient)
    });

  } catch (error) {
    console.error('Error updating client:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update client',
      errors: error.errors || []
    });
  }
};

// Delete client (Super Admin and Manager only)
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if client has active policies or claims
    // const activePolicies = await Policy.countDocuments({ clientId: id, status: 'Active' });
    // const activeClaims = await Claim.countDocuments({ clientId: id, status: { $in: ['Pending', 'Under Review'] } });
    
    // if (activePolicies > 0 || activeClaims > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Cannot delete client with active policies or claims'
    //   });
    // }

    await Client.findByIdAndDelete(id);

    // Log activity
    await Activity.logActivity({
      action: `Deleted ${client.clientType} client`,
      type: 'client',
      operation: 'delete',
      description: `Deleted client: ${client.displayName}`,
      entityType: 'Client',
      entityId: client._id,
      entityName: client.displayName,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
      error: error.message
    });
  }
};

// Upload client document
exports.uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body;
    const { role, _id: userId } = req.user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check client access
    let filter = { _id: id };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    }

    const client = await Client.findOne(filter);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or access denied'
      });
    }

    // Create document object
    const document = {
      documentType,
      fileName: req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileSize: req.file.size,
      uploadedBy: userId
    };

    // Remove existing document of same type
    client.documents = client.documents.filter(doc => doc.documentType !== documentType);
    
    // Add new document
    client.documents.push(document);
    await client.save();

    // Log activity
    await Activity.logActivity({
      action: `Uploaded ${documentType} document`,
      type: 'document',
      operation: 'create',
      description: `Uploaded ${documentType} document for client: ${client.displayName}`,
      entityType: 'Client',
      entityId: client._id,
      entityName: client.displayName,
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

// Get client documents
exports.getClientDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: id };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    }

    const client = await Client.findOne(filter).select('documents');
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: client.documents
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

// Delete client document
exports.deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: id };
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    }

    const client = await Client.findOne(filter);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or access denied'
      });
    }

    const document = client.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete physical file
    try {
      const filePath = path.join(__dirname, '..', document.fileUrl);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError.message);
    }

    // Remove from database
    client.documents.id(documentId).remove();
    await client.save();

    // Log activity
    await Activity.logActivity({
      action: `Deleted ${document.documentType} document`,
      type: 'document',
      operation: 'delete',
      description: `Deleted ${document.documentType} document for client: ${client.displayName}`,
      entityType: 'Client',
      entityId: client._id,
      entityName: client.displayName,
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

// Search clients
exports.searchClients = async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    const { role, _id: userId } = req.user;

    let filter = {
      $text: { $search: query }
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

    const clients = await Client.find(filter)
      .populate('assignedAgentId', 'firstName lastName')
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit));

    const transformedClients = clients.map(client => ({
      _id: client._id,
      clientId: client.clientId,
      name: client.displayName,
      email: client.email,
      phone: client.phone,
      type: client.clientType,
      status: client.status
    }));

    res.status(200).json({
      success: true,
      data: transformedClients
    });

  } catch (error) {
    console.error('Error searching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search clients',
      error: error.message
    });
  }
};

// Get clients by agent
exports.getClientsByAgent = async (req, res) => {
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

    const clients = await Client.find({ assignedAgentId: agentId })
      .populate('assignedAgentId', 'firstName lastName')
      .sort({ createdAt: -1 });

    const transformedClients = clients.map(client => transformClientResponse(client));

    res.status(200).json({
      success: true,
      data: transformedClients
    });

  } catch (error) {
    console.error('Error fetching agent clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent clients',
      error: error.message
    });
  }
};

// Assign client to agent
exports.assignClientToAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    const { role, _id: userId } = req.user;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
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

    client.assignedAgentId = agentId;
    client.updatedBy = userId;
    await client.save();

    // Log activity
    await Activity.logActivity({
      action: 'Assigned client to agent',
      type: 'client',
      operation: 'update',
      description: `Assigned client ${client.displayName} to agent ${agent.firstName} ${agent.lastName}`,
      entityType: 'Client',
      entityId: client._id,
      entityName: client.displayName,
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: 'Client assigned successfully',
      data: await Client.findById(id).populate('assignedAgentId', 'firstName lastName email')
    });

  } catch (error) {
    console.error('Error assigning client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign client',
      error: error.message
    });
  }
};

// Get client statistics
exports.getClientStats = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    let matchFilter = {};
    if (role === 'agent') {
      matchFilter.assignedAgentId = new mongoose.Types.ObjectId(userId);
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      matchFilter.assignedAgentId = { $in: agentIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    const stats = await Client.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
          pendingClients: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          inactiveClients: { $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] } },
          individualClients: { $sum: { $cond: [{ $eq: ['$clientType', 'individual'] }, 1, 0] } },
          corporateClients: { $sum: { $cond: [{ $eq: ['$clientType', 'corporate'] }, 1, 0] } },
          groupClients: { $sum: { $cond: [{ $eq: ['$clientType', 'group'] }, 1, 0] } },
          totalPolicies: { $sum: '$policiesCount' },
          avgPoliciesPerClient: { $avg: '$policiesCount' }
        }
      }
    ]);

    const result = stats[0] || {
      totalClients: 0,
      activeClients: 0,
      pendingClients: 0,
      inactiveClients: 0,
      individualClients: 0,
      corporateClients: 0,
      groupClients: 0,
      totalPolicies: 0,
      avgPoliciesPerClient: 0
    };

    // Calculate conversion rate (active clients / total clients)
    result.conversionRate = result.totalClients > 0 
      ? ((result.activeClients / result.totalClients) * 100).toFixed(2)
      : 0;

    // Get recent client growth
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClients = await Client.countDocuments({
      ...matchFilter,
      createdAt: { $gte: thirtyDaysAgo }
    });

    result.recentGrowth = recentClients;

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client statistics',
      error: error.message
    });
  }
};

// Export clients data
exports.exportClients = async (req, res) => {
  try {
    const { format = 'csv', filters = {} } = req.body;
    const { role, _id: userId } = req.user;

    let filter = {};
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedAgentId = { $in: agentIds };
    }

    // Apply additional filters
    Object.assign(filter, filters);

    const clients = await Client.find(filter)
      .populate('assignedAgentId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Transform data for export
    const exportData = clients.map(client => ({
      clientId: client.clientId,
      clientType: client.clientType,
      name: client.displayName,
      email: client.email,
      phone: client.phone,
      location: `${client.city}, ${client.state}`,
      status: client.status,
      assignedAgent: client.assignedAgentId ? 
        `${client.assignedAgentId.firstName} ${client.assignedAgentId.lastName}` : '',
      createdAt: client.createdAt.toISOString().split('T')[0]
    }));

    res.status(200).json({
      success: true,
      data: exportData,
      message: `${exportData.length} clients exported successfully`
    });

  } catch (error) {
    console.error('Error exporting clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export clients',
      error: error.message
    });
  }
};

// Helper function to validate business rules
async function validateBusinessRules(clientData, excludeId = null) {
  const errors = [];

  // Check for duplicate email
  const emailFilter = { email: clientData.email };
  if (excludeId) emailFilter._id = { $ne: excludeId };
  const existingEmail = await Client.findOne(emailFilter);
  if (existingEmail) {
    errors.push({ field: 'email', message: 'Email address already exists' });
  }

  // Check for duplicate phone
  const phoneFilter = { phone: clientData.phone };
  if (excludeId) phoneFilter._id = { $ne: excludeId };
  const existingPhone = await Client.findOne(phoneFilter);
  if (existingPhone) {
    errors.push({ field: 'phone', message: 'Phone number already exists' });
  }

  // Check for duplicate PAN (for individual clients)
  if (clientData.clientType === 'individual' && clientData.panNumber) {
    const panFilter = { 'individualData.panNumber': clientData.panNumber };
    if (excludeId) panFilter._id = { $ne: excludeId };
    const existingPAN = await Client.findOne(panFilter);
    if (existingPAN) {
      errors.push({ field: 'panNumber', message: 'PAN number already exists' });
    }
  }

  // Check for duplicate registration number (for corporate clients)
  if (clientData.clientType === 'corporate' && clientData.registrationNo) {
    const regFilter = { 'corporateData.registrationNo': clientData.registrationNo };
    if (excludeId) regFilter._id = { $ne: excludeId };
    const existingReg = await Client.findOne(regFilter);
    if (existingReg) {
      errors.push({ field: 'registrationNo', message: 'Registration number already exists' });
    }
  }

  // Check for duplicate GST number (for corporate clients)
  if (clientData.clientType === 'corporate' && clientData.gstNumber) {
    const gstFilter = { 'corporateData.gstNumber': clientData.gstNumber };
    if (excludeId) gstFilter._id = { $ne: excludeId };
    const existingGST = await Client.findOne(gstFilter);
    if (existingGST) {
      errors.push({ field: 'gstNumber', message: 'GST number already exists' });
    }
  }

  if (errors.length > 0) {
    const error = new Error('Validation failed');
    error.errors = errors;
    throw error;
  }
}

// Helper function to transform client response
function transformClientResponse(client) {
  return {
    _id: client._id,
    clientId: client.clientId,
    clientType: client.clientType,
    name: client.displayName,
    email: client.email,
    phone: client.phone,
    altPhone: client.altPhone,
    address: client.address,
    city: client.city,
    state: client.state,
    pincode: client.pincode,
    country: client.country,
    status: client.status,
    source: client.source,
    notes: client.notes,
    assignedAgentId: client.assignedAgentId?._id,
    assignedAgent: client.assignedAgentId,
    policies: client.policiesCount,
    type: client.clientType.charAt(0).toUpperCase() + client.clientType.slice(1),
    contact: client.phone,
    location: `${client.city}, ${client.state}`,
    documents: client.documents,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    // Include type-specific data
    ...client.individualData?.toObject(),
    ...client.corporateData?.toObject(),
    ...client.groupData?.toObject()
  };
}
