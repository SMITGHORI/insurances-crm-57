
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

// Sample invoice data for development
export function getSampleInvoices(): Invoice[] {
  return [
    {
      id: "1",
      invoiceNumber: "INV-202505-0001",
      clientId: "1",
      clientName: "Rahul Sharma",
      clientEmail: "rahul.sharma@example.com",
      clientPhone: "+91 9876543210",
      clientAddress: "123 Main Street, Mumbai, Maharashtra",
      policyId: "1",
      policyNumber: "AMB-POL-2025-0001",
      insuranceType: "Health Insurance",
      agentId: "1",
      agentName: "Priya Singh",
      issueDate: "2025-05-01",
      dueDate: "2025-05-15",
      status: "paid",
      items: [
        {
          id: "item1",
          description: "Health Insurance Premium - Family Health Optima",
          quantity: 1,
          unitPrice: 12500,
          tax: 2250,
          total: 14750
        }
      ],
      subtotal: 12500,
      discount: 0,
      tax: 2250,
      total: 14750,
      notes: "Thank you for your business.",
      paymentTerms: "Due on receipt",
      paymentMethod: "UPI",
      paymentDate: "2025-05-03",
      transactionId: "UPI/123456789",
      premiumType: "Annual",
      premiumPeriod: "May 2025 - May 2026",
      customFields: {
        "GST Number": "GST123456789"
      },
      layoutTemplate: "standard",
      history: [
        {
          action: "Created",
          date: "2025-05-01",
          user: "Admin",
          details: "Invoice created"
        },
        {
          action: "Sent",
          date: "2025-05-01",
          user: "Admin",
          details: "Invoice sent to client via email"
        },
        {
          action: "Paid",
          date: "2025-05-03",
          user: "System",
          details: "Payment received via UPI"
        }
      ]
    },
    {
      id: "2",
      invoiceNumber: "INV-202505-0002",
      clientId: "2",
      clientName: "Tech Solutions Ltd",
      clientEmail: "info@techsolutions.com",
      clientPhone: "+91 2234567890",
      clientAddress: "456 Tech Park, Bangalore, Karnataka",
      policyId: "2",
      policyNumber: "AMB-POL-2025-0002",
      insuranceType: "Motor Insurance",
      agentId: "2",
      agentName: "Vikram Malhotra",
      issueDate: "2025-05-10",
      dueDate: "2025-05-25",
      status: "sent",
      items: [
        {
          id: "item1",
          description: "Commercial Vehicle Insurance Premium",
          quantity: 1,
          unitPrice: 8000,
          tax: 1440,
          total: 9440
        },
        {
          id: "item2",
          description: "Additional Driver Coverage",
          quantity: 1,
          unitPrice: 1500,
          tax: 270,
          total: 1770
        }
      ],
      subtotal: 9500,
      discount: 500,
      tax: 1710,
      total: 10710,
      notes: "Please make payment before the due date to ensure continuous coverage.",
      paymentTerms: "Net 15",
      premiumType: "Annual",
      premiumPeriod: "May 2025 - May 2026",
      customFields: {
        "GST Number": "GST987654321",
        "PO Number": "PO78901"
      },
      layoutTemplate: "corporate",
      history: [
        {
          action: "Created",
          date: "2025-05-10",
          user: "Admin",
          details: "Invoice created"
        },
        {
          action: "Sent",
          date: "2025-05-10",
          user: "Admin",
          details: "Invoice sent to client via email"
        }
      ]
    },
    {
      id: "3",
      invoiceNumber: "INV-202505-0003",
      clientId: "3",
      clientName: "Priya Patel",
      clientEmail: "priya.patel@example.com",
      clientPhone: "+91 8876543210",
      clientAddress: "789 Residency Road, Chennai, Tamil Nadu",
      policyId: "3",
      policyNumber: "AMB-POL-2025-0003",
      insuranceType: "Life Insurance",
      agentId: "1",
      agentName: "Priya Singh",
      issueDate: "2025-05-15",
      dueDate: "2025-05-30",
      status: "overdue",
      items: [
        {
          id: "item1",
          description: "Term Life Insurance Premium - 20 Year Plan",
          quantity: 1,
          unitPrice: 15000,
          tax: 2700,
          total: 17700
        }
      ],
      subtotal: 15000,
      discount: 0,
      tax: 2700,
      total: 17700,
      notes: "Payment is overdue. Please settle the amount immediately to avoid policy lapse.",
      paymentTerms: "Net 15",
      premiumType: "Annual",
      premiumPeriod: "May 2025 - May 2026",
      layoutTemplate: "standard",
      history: [
        {
          action: "Created",
          date: "2025-05-15",
          user: "Admin",
          details: "Invoice created"
        },
        {
          action: "Sent",
          date: "2025-05-15",
          user: "Admin",
          details: "Invoice sent to client via email"
        },
        {
          action: "Reminder",
          date: "2025-05-25",
          user: "System",
          details: "Payment reminder sent"
        },
        {
          action: "Overdue",
          date: "2025-05-31",
          user: "System",
          details: "Invoice marked as overdue"
        }
      ]
    },
    {
      id: "4",
      invoiceNumber: "INV-202505-0004",
      clientId: "4",
      clientName: "Global Enterprises",
      clientEmail: "finance@global-ent.com",
      clientPhone: "+91 2299887766",
      clientAddress: "101 Business Park, Pune, Maharashtra",
      policyId: "4",
      policyNumber: "AMB-POL-2025-0004",
      insuranceType: "Property Insurance",
      agentId: "3",
      agentName: "Ananya Das",
      issueDate: "2025-05-20",
      dueDate: "2025-06-05",
      status: "draft",
      items: [
        {
          id: "item1",
          description: "Commercial Property Insurance - Comprehensive Plan",
          quantity: 1,
          unitPrice: 25000,
          tax: 4500,
          total: 29500
        },
        {
          id: "item2",
          description: "Inventory Coverage Add-on",
          quantity: 1,
          unitPrice: 8000,
          tax: 1440,
          total: 9440
        },
        {
          id: "item3",
          description: "Business Interruption Coverage",
          quantity: 1,
          unitPrice: 12000,
          tax: 2160,
          total: 14160
        }
      ],
      subtotal: 45000,
      discount: 2000,
      tax: 8100,
      total: 51100,
      notes: "Draft invoice for review. Please check all details before finalization.",
      paymentTerms: "Net 15",
      premiumType: "Annual",
      premiumPeriod: "June 2025 - June 2026",
      customFields: {
        "GST Number": "GST456789012",
        "PO Number": "PO123456",
        "Contract Reference": "CNT-2025-0056"
      },
      layoutTemplate: "corporate",
      history: [
        {
          action: "Created",
          date: "2025-05-20",
          user: "Admin",
          details: "Invoice created as draft"
        }
      ]
    }
  ];
}

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
