
import { commissionService } from '@/services/commissionService';

// Sample invoice data function removed - using real API data

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
 * Calculate commission data for an invoice
 * Note: Commission storage is now handled through the API
 * This function only calculates commission data for display/processing
 */
export const calculateInvoiceCommission = (invoiceData, agentData, policyData) => {
  try {
    if (agentData) {
      return commissionService.calculateCommission(
        invoiceData, 
        agentData, 
        policyData
      );
    }
    return null;
  } catch (error) {
    console.error('Error calculating commission:', error);
    return null;
  }
};

/**
 * Note: Commission storage and retrieval is now handled through the API.
 * Use useAgentCommissions hook to fetch commission data.
 * Commission processing should be handled on the backend when invoices are created/updated.
 */

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
 * Get status badge class for invoice status (used by mobile view)
 */
export const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'paid': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  
  return statusClasses[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Format invoice date for display
 */
export const formatInvoiceDateForDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
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
