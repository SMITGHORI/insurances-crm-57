
import { formatCurrency } from "@/lib/utils";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  policyId?: string;
  policyNumber?: string;
  insuranceType?: string;
  agentId?: string;
  agentName?: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  paymentDate?: string;
  transactionId?: string;
  premiumType?: string;
  premiumPeriod?: string;
  customFields?: Record<string, string>;
  layoutTemplate?: string;
  history: {
    action: string;
    date: string;
    user: string;
    details: string;
  }[];
}

export function calculateInvoiceTotals(items: InvoiceItem[]): { 
  subtotal: number; 
  taxTotal: number; 
  total: number 
} {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxTotal = items.reduce((sum, item) => sum + item.tax, 0);
  const total = subtotal + taxTotal;
  
  return { subtotal, taxTotal, total };
}

export function generateInvoiceNumber(prefix = 'INV', existingNumbers: string[] = []): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Get the highest number for this year/month
  const regex = new RegExp(`^${prefix}-${year}${month}-(\\d{4})$`);
  let maxNumber = 0;
  
  existingNumbers.forEach(num => {
    const match = num.match(regex);
    if (match) {
      const number = parseInt(match[1]);
      if (number > maxNumber) maxNumber = number;
    }
  });
  
  const nextNumber = String(maxNumber + 1).padStart(4, '0');
  return `${prefix}-${year}${month}-${nextNumber}`;
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function formatInvoiceDateForDisplay(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Sample invoice data function removed - using real API data

export function calculateDueStatus(dueDate: string): 'upcoming' | 'due-soon' | 'overdue' {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'overdue';
  } else if (diffDays <= 3) {
    return 'due-soon';
  } else {
    return 'upcoming';
  }
}

export function groupInvoicesByMonth(invoices: Invoice[]): Record<string, Invoice[]> {
  return invoices.reduce((acc, invoice) => {
    const date = new Date(invoice.issueDate);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    
    acc[monthYear].push(invoice);
    return acc;
  }, {} as Record<string, Invoice[]>);
}

export function calculateTotalsByStatus(invoices: Invoice[]): Record<string, number> {
  const result = {
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
    total: 0
  };
  
  invoices.forEach(invoice => {
    if (invoice.status in result) {
      result[invoice.status] += invoice.total;
    }
    result.total += invoice.total;
  });
  
  return result;
}
