import { commissionService } from '@/services/commissionService';

export const getSampleInvoices = () => [
  {
    id: '1',
    invoiceNumber: 'INV-2025-0001',
    clientId: '1',
    clientName: 'Rajesh Kumar',
    clientEmail: 'rajesh.kumar@email.com',
    clientPhone: '+91 98765 43210',
    clientAddress: '123 MG Road, Bangalore, Karnataka 560001',
    policyId: '1',
    policyNumber: 'POL-2024-0543',
    insuranceType: 'Health Insurance',
    agentId: '1',
    agentName: 'Priya Sharma',
    issueDate: '2025-01-15',
    dueDate: '2025-02-14',
    status: 'paid',
    items: [
      {
        id: 'item_1',
        description: 'Health Insurance Premium - Family Floater',
        quantity: 1,
        unitPrice: 25000,
        tax: 4500,
        total: 29500
      }
    ],
    subtotal: 25000,
    discount: 0,
    tax: 4500,
    total: 29500,
    notes: 'Annual premium payment for family health insurance policy',
    paymentTerms: 'Due on receipt',
    premiumType: 'Annual',
    coverageStartDate: '2025-01-15',
    coverageEndDate: '2026-01-14',
    premiumPeriod: 'Jan 2025 - Jan 2026',
    customFields: {
      'GST Number': '29ABCDE1234F1Z5',
      'PAN Number': 'ABCDE1234F'
    },
    history: [
      {
        action: 'Created',
        date: '2025-01-15',
        user: 'Admin',
        details: 'Invoice created for health insurance premium'
      },
      {
        action: 'Sent',
        date: '2025-01-15',
        user: 'Admin',
        details: 'Invoice sent to client via email'
      },
      {
        action: 'Paid',
        date: '2025-01-20',
        user: 'System',
        details: 'Payment received and processed'
      }
    ]
  }
  // ... other sample invoices
];

export const generateInvoiceNumber = (prefix = 'INV', existingNumbers = []) => {
  const year = new Date().getFullYear();
  const currentNumbers = existingNumbers
    .filter(num => num.includes(`${prefix}-${year}`))
    .map(num => {
      const parts = num.split('-');
      return parseInt(parts[parts.length - 1]) || 0;
    });
  
  const nextNumber = currentNumbers.length > 0 ? Math.max(...currentNumbers) + 1 : 1;
  return `${prefix}-${year}-${nextNumber.toString().padStart(4, '0')}`;
};

export const calculateInvoiceTotals = (items) => {
  const subtotal = items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    return sum + (quantity * unitPrice);
  }, 0);
  
  const taxTotal = items.reduce((sum, item) => {
    return sum + (parseFloat(item.tax) || 0);
  }, 0);
  
  return {
    subtotal,
    taxTotal,
    total: subtotal + taxTotal
  };
};

/**
 * Enhanced invoice creation with commission processing
 */
export const processInvoiceWithCommission = (invoiceData, agentData, policyData) => {
  try {
    // If agent is assigned and invoice is new (not editing), calculate commission
    if (agentData && !invoiceData.isEditing) {
      const commissionData = commissionService.calculateCommission(
        invoiceData, 
        agentData, 
        policyData
      );
      
      // Store commission in background
      commissionService.storeCommission(commissionData);
      
      console.log('Commission calculated and stored for invoice:', invoiceData.invoiceNumber);
    }
    
    return invoiceData;
  } catch (error) {
    console.error('Error processing invoice with commission:', error);
    // Don't fail invoice creation if commission calculation fails
    return invoiceData;
  }
};

/**
 * Get invoice commission status
 */
export const getInvoiceCommissionStatus = (invoiceId) => {
  try {
    const allCommissions = commissionService.getAllCommissions();
    const invoiceCommission = allCommissions.find(c => c.invoiceId === invoiceId);
    
    return invoiceCommission ? {
      exists: true,
      status: invoiceCommission.status,
      amount: invoiceCommission.commissionAmount,
      rate: invoiceCommission.commissionRate
    } : {
      exists: false
    };
  } catch (error) {
    console.error('Error getting invoice commission status:', error);
    return { exists: false };
  }
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  
  const numAmount = parseFloat(amount);
  
  if (currency === 'INR') {
    return `₹${numAmount.toLocaleString('en-IN', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    })}`;
  }
  
  return numAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

/**
 * Invoice status helpers
 */
export const getInvoiceStatusColor = (status) => {
  const statusColors = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'paid': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getInvoiceStatusLabel = (status) => {
  const statusLabels = {
    'draft': 'Draft',
    'sent': 'Sent',
    'paid': 'Paid',
    'overdue': 'Overdue',
    'cancelled': 'Cancelled'
  };
  
  return statusLabels[status] || status;
};

/**
 * Validation helpers
 */
export const validateInvoiceData = (data) => {
  const errors = [];
  
  if (!data.clientId) {
    errors.push('Client is required');
  }
  
  if (!data.invoiceNumber) {
    errors.push('Invoice number is required');
  }
  
  if (!data.items || data.items.length === 0) {
    errors.push('At least one item is required');
  }
  
  if (data.items) {
    data.items.forEach((item, index) => {
      if (!item.description) {
        errors.push(`Item ${index + 1}: Description is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        errors.push(`Item ${index + 1}: Unit price must be 0 or greater`);
      }
    });
  }
  
  return errors;
};
