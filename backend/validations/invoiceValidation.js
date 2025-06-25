
const { body, param, query } = require('express-validator');

const createInvoiceValidation = [
  body('clientId')
    .notEmpty()
    .withMessage('Client ID is required'),
  
  body('clientName')
    .notEmpty()
    .withMessage('Client name is required'),
  
  body('clientEmail')
    .isEmail()
    .withMessage('Valid client email is required'),
  
  body('issueDate')
    .isISO8601()
    .withMessage('Valid issue date is required'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  
  body('status')
    .optional()
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.description')
    .notEmpty()
    .withMessage('Item description is required'),
  
  body('items.*.quantity')
    .isNumeric()
    .isInt({ min: 1 })
    .withMessage('Item quantity must be a positive integer'),
  
  body('items.*.unitPrice')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Item unit price must be a positive number'),
  
  body('subtotal')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),
  
  body('total')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Total must be a positive number')
];

const updateInvoiceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid invoice ID'),
  
  body('clientName')
    .optional()
    .notEmpty()
    .withMessage('Client name cannot be empty'),
  
  body('clientEmail')
    .optional()
    .isEmail()
    .withMessage('Valid client email is required'),
  
  body('issueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid issue date is required'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid due date is required'),
  
  body('status')
    .optional()
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('subtotal')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),
  
  body('total')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Total must be a positive number')
];

const getInvoiceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid invoice ID')
];

const sendInvoiceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid invoice ID'),
  
  body('to')
    .isEmail()
    .withMessage('Valid recipient email is required'),
  
  body('subject')
    .notEmpty()
    .withMessage('Email subject is required'),
  
  body('message')
    .optional()
    .isString()
    .withMessage('Message must be a string')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status filter'),
  
  query('sortBy')
    .optional()
    .isIn(['issueDate', 'dueDate', 'total', 'status', 'clientName'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];

module.exports = {
  createInvoiceValidation,
  updateInvoiceValidation,
  getInvoiceValidation,
  sendInvoiceValidation,
  queryValidation
};
