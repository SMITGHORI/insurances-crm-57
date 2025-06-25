
const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats,
  sendInvoice
} = require('../controllers/invoiceController');
const {
  createInvoiceValidation,
  updateInvoiceValidation,
  getInvoiceValidation,
  sendInvoiceValidation,
  queryValidation
} = require('../validations/invoiceValidation');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// GET /api/invoices - Get all invoices with filtering and pagination
router.get('/', queryValidation, getInvoices);

// GET /api/invoices/stats - Get invoice statistics
router.get('/stats', getInvoiceStats);

// GET /api/invoices/:id - Get single invoice
router.get('/:id', getInvoiceValidation, getInvoiceById);

// POST /api/invoices - Create new invoice
router.post('/', createInvoiceValidation, createInvoice);

// PUT /api/invoices/:id - Update invoice
router.put('/:id', updateInvoiceValidation, updateInvoice);

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', getInvoiceValidation, deleteInvoice);

// POST /api/invoices/:id/send - Send invoice via email
router.post('/:id/send', sendInvoiceValidation, sendInvoice);

module.exports = router;
