
const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const authMiddleware = require('../middleware/auth');
const { AppError } = require('../utils/errorHandler');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/clients - Get all clients with pagination and filtering
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      clientType,
      assignedAgentId
    } = req.query;

    let query = {};

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Add filters
    if (status) query.status = status;
    if (clientType) query.clientType = clientType;
    if (assignedAgentId) query.assignedAgentId = assignedAgentId;

    // Apply branch filtering for non-admin users
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      query.assignedAgentId = req.user._id;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'assignedAgentId', select: 'name email' },
        { path: 'createdBy', select: 'name email' }
      ]
    };

    const clients = await Client.paginate(query, options);

    res.json({
      success: true,
      data: clients.docs,
      pagination: {
        currentPage: clients.page,
        totalPages: clients.totalPages,
        totalItems: clients.totalDocs,
        itemsPerPage: clients.limit
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/clients/:id - Get client by ID
router.get('/:id', async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedAgentId', 'name email')
      .populate('createdBy', 'name email');

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/clients - Create new client
router.post('/', async (req, res, next) => {
  try {
    const clientData = {
      ...req.body,
      createdBy: req.user._id,
      assignedAgentId: req.body.assignedAgentId || req.user._id
    };

    const client = new Client(clientData);
    await client.save();

    res.status(201).json({
      success: true,
      data: client,
      message: 'Client created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    res.json({
      success: true,
      data: client,
      message: 'Client updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id', async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/clients/search - Search clients
router.get('/search', async (req, res, next) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query) {
      throw new AppError('Search query is required', 400);
    }

    const clients = await Client.find({
      $text: { $search: query }
    })
    .limit(parseInt(limit))
    .sort({ score: { $meta: 'textScore' } });

    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
