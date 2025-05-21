
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
          date: "2025-05-11",
          user: "Admin",
          details: "Invoice sent to client via email"
        }
      ]
    },
    {
      id: "3",
      invoiceNumber: "INV-202505-0003",
      clientId: "3",
      clientName: "Sanjay Group",
      clientEmail: "contact@sanjaygroup.com",
      clientPhone: "+91 8765432109",
      clientAddress: "789 Business Tower, Delhi, Delhi",
      policyId: "3",
      policyNumber: "AMB-POL-2025-0003",
      insuranceType: "Life Insurance",
      agentId: "1",
      agentName: "Priya Singh",
      issueDate: "2025-05-15",
      dueDate: "2025-05-30",
      status: "draft",
      items: [
        {
          id: "item1",
          description: "Group Life Insurance - 10 Employees",
          quantity: 10,
          unitPrice: 5000,
          tax: 9000,
          total: 59000
        }
      ],
      subtotal: 50000,
      discount: 0,
      tax: 9000,
      total: 59000,
      notes: "Draft invoice for review.",
      paymentTerms: "Net 15",
      premiumType: "Annual",
      premiumPeriod: "May 2025 - May 2026",
      customFields: {},
      layoutTemplate: "standard",
      history: [
        {
          action: "Created",
          date: "2025-05-15",
          user: "Admin",
          details: "Draft invoice created"
        }
      ]
    }
  ];
}
