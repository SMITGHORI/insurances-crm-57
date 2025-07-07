
const Client = require('../models/Client');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// Get all clients with pagination and filtering
const getAllClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      sortField = 'createdAt',
      sortDirection = 'desc'
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
        { clientId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'individualData.firstName': { $regex: search, $options: 'i' } },
        { 'individualData.lastName': { $regex: search, $options: 'i' } },
        { 'corporateData.companyName': { $regex: search, $options: 'i' } },
        { 'groupData.groupName': { $regex: search, $options: 'i' } }
      ];
    }

    // Type filtering
    if (type && type !== 'all') {
      filter.clientType = type;
    }

    // Status filtering
    if (status && status !== 'All') {
      filter.status = status;
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
        { path: 'assignedAgentId', select: 'name email' },
        { path: 'createdBy', select: 'name email' }
      ]
    };

    const result = await Client.paginate(filter, options);

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
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message
    });
  }
};

// Get client by ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID format'
      });
    }

    let filter = { _id: id };

    // Role-based access control
    if (req.user.role === 'agent') {
      filter.assignedAgentId = req.user.id;
    }

    const client = await Client.findOne(filter)
      .populate('assignedAgentId', 'name email')
      .populate('createdBy', 'name email');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: client
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

// Create new client
const createClient = async (req, res) => {
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

    const clientData = req.body;

    // Set the user who created the client
    clientData.createdBy = req.user.id;

    // If no assigned agent specified, assign to current user if they're an agent
    if (!clientData.assignedAgentId && req.user.role === 'agent') {
      clientData.assignedAgentId = req.user.id;
    }

    // Create the client
    const client = new Client(clientData);
    await client.save();

    // Populate the created client
    await client.populate([
      { path: 'assignedAgentId', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    console.error('Error creating client:', error);

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
      message: 'Failed to create client',
      error: error.message
    });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID format'
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

    // Set the user who updated the client
    updateData.updatedBy = req.user.id;

    const client = await Client.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'assignedAgentId', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    console.error('Error updating client:', error);

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
      message: 'Failed to update client',
      error: error.message
    });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID format'
      });
    }

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

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

// Search clients
const searchClients = async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    let filter = {
      $text: { $search: query }
    };

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.assignedAgentId = req.user.id;
    }

    const clients = await Client.find(filter)
      .limit(parseInt(limit))
      .sort({ score: { $meta: 'textScore' } })
      .populate('assignedAgentId', 'name email');

    res.status(200).json({
      success: true,
      data: clients
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

// Upload document
const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const documentData = {
      documentType,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      fileSize: req.file.size,
      uploadedBy: req.user.id
    };

    client.documents.push(documentData);
    await client.save();

    const newDocument = client.documents[client.documents.length - 1];

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

// Get client documents
const getClientDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id).populate('documents.uploadedBy', 'name email');
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
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

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    client.documents.id(documentId).remove();
    await client.save();

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

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  uploadDocument,
  getClientDocuments,
  deleteDocument
};
