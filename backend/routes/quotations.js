
const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/auth');
const { roleMiddleware, resourceOwnershipMiddleware } = require('../middleware/roleMiddleware');
const { validationMiddleware } = require('../middleware/validation');

// Import validation schemas
const {
  createQuotationSchema,
  updateQuotationSchema,
  sendQuotationSchema,
  statusUpdateSchema,
  queryParamsSchema
} = require('../validations/quotationValidation');

// Import controllers
const {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  sendQuotation,
  updateQuotationStatus,
  getQuotationsStats,
  searchQuotations
} = require('../controllers/quotationController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/quotations
 * @desc    Get all quotations with filtering and pagination
 * @access  Private (All authenticated users)
 * @query   page, limit, status, insuranceType, agentId, clientId, search, sortBy, sortOrder
 */
router.get('/',
  validationMiddleware(queryParamsSchema, 'query'),
  getQuotations
);

/**
 * @route   GET /api/quotations/stats
 * @desc    Get quotations statistics
 * @access  Private (All authenticated users)
 * @query   period, agentId
 */
router.get('/stats',
  getQuotationsStats
);

/**
 * @route   GET /api/quotations/search/:query
 * @desc    Search quotations by text
 * @access  Private (All authenticated users)
 * @param   query - Search query string
 * @query   limit
 */
router.get('/search/:query',
  searchQuotations
);

/**
 * @route   POST /api/quotations
 * @desc    Create a new quotation
 * @access  Private (Agents, Managers, Super Admin)
 * @body    Quotation data according to createQuotationSchema
 */
router.post('/',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(createQuotationSchema),
  createQuotation
);

/**
 * @route   GET /api/quotations/:id
 * @desc    Get quotation by ID
 * @access  Private (All authenticated users)
 * @param   id - Quotation ID
 */
router.get('/:id',
  getQuotationById
);

/**
 * @route   PUT /api/quotations/:id
 * @desc    Update quotation
 * @access  Private (Agents can update own quotations, Managers/Super Admin can update all)
 * @param   id - Quotation ID
 * @body    Quotation update data according to updateQuotationSchema
 */
router.put('/:id',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(updateQuotationSchema),
  updateQuotation
);

/**
 * @route   DELETE /api/quotations/:id
 * @desc    Delete quotation
 * @access  Private (Managers, Super Admin only)
 * @param   id - Quotation ID
 */
router.delete('/:id',
  roleMiddleware(['manager', 'super_admin']),
  deleteQuotation
);

/**
 * @route   POST /api/quotations/:id/send
 * @desc    Send quotation via email
 * @access  Private (Agents can send own quotations, Managers/Super Admin can send all)
 * @param   id - Quotation ID
 * @body    Email data according to sendQuotationSchema
 */
router.post('/:id/send',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(sendQuotationSchema),
  sendQuotation
);

/**
 * @route   PUT /api/quotations/:id/status
 * @desc    Update quotation status
 * @access  Private (Agents can update own quotations, Managers/Super Admin can update all)
 * @param   id - Quotation ID
 * @body    Status data according to statusUpdateSchema
 */
router.put('/:id/status',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(statusUpdateSchema),
  updateQuotationStatus
);

module.exports = router;
