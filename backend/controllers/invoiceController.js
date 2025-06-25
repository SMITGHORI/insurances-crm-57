
const Invoice = require('../models/Invoice');
const { validationResult } = require('express-validator');
const generateId = require('../utils/generateId');

// Get all invoices with filtering and pagination
const getInvoices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      clientId, 
      agentId, 
      policyType,
      search,
      sortBy = 'issueDate',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (clientId && clientId !== 'all') {
      filter.clientId = clientId;
    }
    
    if (agentId && agentId !== 'all') {
      filter.agentId = agentId;
    }
    
    if (policyType && policyType !== 'all') {
      filter.policyType = policyType;
    }
    
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate) filter.issueDate.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const invoices = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Invoice.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      data: invoices,
      total,
      page: pageNum,
      totalPages,
      success: true
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch invoices',
      details: error.message 
    });
  }
};

// Get single invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return res.status(404).json({ 
        error: 'Invoice not found' 
      });
    }

    res.json({
      data: invoice,
      success: true
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ 
      error: 'Failed to fetch invoice',
      details: error.message 
    });
  }
};

// Create new invoice
const createInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const invoiceData = req.body;
    
    // Generate invoice number if not provided
    if (!invoiceData.invoiceNumber) {
      invoiceData.invoiceNumber = `INV-${Date.now()}`;
    }

    // Add creation history entry
    invoiceData.history = [{
      action: 'Created',
      date: new Date(),
      user: req.user?.name || 'System',
      details: 'Invoice created'
    }];

    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();

    res.status(201).json({
      data: savedInvoice,
      success: true
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Invoice number already exists' 
      });
    }
    res.status(500).json({ 
      error: 'Failed to create invoice',
      details: error.message 
    });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const existingInvoice = await Invoice.findById(id);
    if (!existingInvoice) {
      return res.status(404).json({ 
        error: 'Invoice not found' 
      });
    }

    // Add update history entry
    if (!updateData.history) {
      updateData.history = existingInvoice.history || [];
    }
    updateData.history.push({
      action: 'Updated',
      date: new Date(),
      user: req.user?.name || 'System',
      details: 'Invoice updated'
    });

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      data: updatedInvoice,
      success: true
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ 
      error: 'Failed to update invoice',
      details: error.message 
    });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    
    if (!deletedInvoice) {
      return res.status(404).json({ 
        error: 'Invoice not found' 
      });
    }

    res.json({
      message: 'Invoice deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ 
      error: 'Failed to delete invoice',
      details: error.message 
    });
  }
};

// Get invoice statistics
const getInvoiceStats = async (req, res) => {
  try {
    const { startDate, endDate, agentId } = req.query;

    // Build filter for date range
    const filter = {};
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate) filter.issueDate.$lte = new Date(endDate);
    }
    if (agentId) {
      filter.agentId = agentId;
    }

    const [stats] = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          paid: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] 
            } 
          },
          pending: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] 
            } 
          },
          overdue: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] 
            } 
          },
          draft: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] 
            } 
          },
          totalAmount: { $sum: '$total' },
          paidAmount: { 
            $sum: { 
              $cond: [
                { $eq: ['$status', 'paid'] }, 
                '$total', 
                0
              ] 
            } 
          },
          pendingAmount: { 
            $sum: { 
              $cond: [
                { $eq: ['$status', 'sent'] }, 
                '$total', 
                0
              ] 
            } 
          }
        }
      }
    ]);

    const result = stats || {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      draft: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0
    };

    res.json({
      data: result,
      success: true
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch invoice statistics',
      details: error.message 
    });
  }
};

// Send invoice via email
const sendInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { to, subject, message } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ 
        error: 'Invoice not found' 
      });
    }

    // Update invoice status and sent timestamp
    invoice.status = 'sent';
    invoice.sentAt = new Date();
    
    // Add history entry
    invoice.history.push({
      action: 'Sent',
      date: new Date(),
      user: req.user?.name || 'System',
      details: `Invoice sent to ${to}`
    });

    await invoice.save();

    // TODO: Implement actual email sending logic here
    // This would typically use a service like SendGrid, Mailgun, etc.
    console.log(`Invoice ${invoice.invoiceNumber} sent to ${to}`);

    res.json({
      data: { 
        message: 'Invoice sent successfully',
        sentAt: invoice.sentAt
      },
      success: true
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({ 
      error: 'Failed to send invoice',
      details: error.message 
    });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats,
  sendInvoice
};
