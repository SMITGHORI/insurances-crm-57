
export interface Quote {
  id: string;
  quoteId: string;
  leadId: string;
  leadName: string;
  carrier: string;
  premium: number;
  coverageAmount: number;
  planName: string;
  validityStart: string;
  validityEnd: string;
  validUntil: string; // Add this field that components expect
  insuranceType: 'Health Insurance' | 'Life Insurance' | 'Motor Insurance' | 'Home Insurance' | 'Travel Insurance';
  status: 'draft' | 'ready' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  agentId: string;
  agentName: string;
  branch: string;
  createdAt: string;
  updatedAt?: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  approvedAt?: string;
  notes?: string;
  documentUrl?: string;
  commissionAmount?: number;
  whatsappSent?: boolean;
  emailSent?: boolean;
  valueScore: number; // Add this field
  riskProfile?: {
    age?: number;
    location?: string;
    vehicleType?: string;
    healthStatus?: string;
  };
  followUpReminders: Array<{
    type: 'email' | 'call' | 'whatsapp';
    scheduledFor: string;
    completed: boolean;
  }>;
}

export const mockQuotes: Quote[] = [
  {
    id: '1',
    quoteId: 'QT-2025-0001',
    leadId: 'LD000001',
    leadName: 'John Doe',
    carrier: 'HDFC ERGO',
    premium: 25000,
    coverageAmount: 500000,
    planName: 'Family Health Plus',
    validityStart: '2025-01-01',
    validityEnd: '2025-02-01',
    validUntil: '2025-02-01',
    insuranceType: 'Health Insurance',
    status: 'sent',
    agentId: '2',
    agentName: 'Agent Smith',
    branch: 'Mumbai',
    createdAt: '2025-01-15T10:00:00Z',
    sentAt: '2025-01-15T14:30:00Z',
    commissionAmount: 2500,
    emailSent: true,
    whatsappSent: false,
    valueScore: 20,
    followUpReminders: [
      { type: 'call', scheduledFor: '2025-01-20T10:00:00Z', completed: false },
      { type: 'email', scheduledFor: '2025-01-25T09:00:00Z', completed: false }
    ]
  },
  {
    id: '2',
    quoteId: 'QT-2025-0002',
    leadId: 'LD000002',
    leadName: 'Jane Smith',
    carrier: 'ICICI Lombard',
    premium: 15000,
    coverageAmount: 800000,
    planName: 'Comprehensive Motor Plan',
    validityStart: '2025-01-10',
    validityEnd: '2025-02-10',
    validUntil: '2025-02-10',
    insuranceType: 'Motor Insurance',
    status: 'viewed',
    agentId: '2',
    agentName: 'Agent Smith',
    branch: 'Mumbai',
    createdAt: '2025-01-10T09:15:00Z',
    sentAt: '2025-01-10T16:20:00Z',
    viewedAt: '2025-01-12T11:45:00Z',
    commissionAmount: 1500,
    emailSent: true,
    whatsappSent: true,
    valueScore: 53,
    followUpReminders: [
      { type: 'whatsapp', scheduledFor: '2025-01-18T15:00:00Z', completed: false }
    ]
  },
  {
    id: '3',
    quoteId: 'QT-2025-0003',
    leadId: 'LD000003',
    leadName: 'Mike Johnson',
    carrier: 'LIC',
    premium: 12000,
    coverageAmount: 1000000,
    planName: 'Term Life Secure',
    validityStart: '2025-01-05',
    validityEnd: '2025-02-05',
    validUntil: '2025-02-05',
    insuranceType: 'Life Insurance',
    status: 'accepted',
    agentId: '2',
    agentName: 'Agent Smith',
    branch: 'Mumbai',
    createdAt: '2025-01-05T08:30:00Z',
    sentAt: '2025-01-05T12:15:00Z',
    viewedAt: '2025-01-06T09:20:00Z',
    acceptedAt: '2025-01-07T16:45:00Z',
    commissionAmount: 1200,
    emailSent: true,
    whatsappSent: false,
    valueScore: 83,
    followUpReminders: []
  }
];

export const insuranceCarriers = [
  'HDFC ERGO',
  'ICICI Lombard',
  'LIC',
  'Star Health',
  'Bajaj Allianz',
  'New India Assurance',
  'Oriental Insurance',
  'United India Insurance',
  'SBI General',
  'IFFCO Tokio'
];

export const emailTemplates = {
  'Health Insurance': {
    subject: 'Your Health Insurance Quote - {{quoteid}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Health Insurance Quote</h2>
        <p>Dear {{clientName}},</p>
        <p>We're pleased to share your personalized health insurance quote:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>{{planName}}</h3>
          <p><strong>Carrier:</strong> {{carrier}}</p>
          <p><strong>Premium:</strong> ₹{{premium}}</p>
          <p><strong>Coverage:</strong> ₹{{coverage}}</p>
          <p><strong>Valid Until:</strong> {{validityEnd}}</p>
        </div>
        <p>This quote is valid until {{validityEnd}}. Click below to accept:</p>
        <a href="{{acceptUrl}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Quote</a>
      </div>
    `
  },
  'Motor Insurance': {
    subject: 'Your Motor Insurance Quote - {{quoteid}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Motor Insurance Quote</h2>
        <p>Dear {{clientName}},</p>
        <p>Here's your motor insurance quote:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>{{planName}}</h3>
          <p><strong>Carrier:</strong> {{carrier}}</p>
          <p><strong>Premium:</strong> ₹{{premium}}</p>
          <p><strong>Coverage:</strong> ₹{{coverage}}</p>
          <p><strong>Valid Until:</strong> {{validityEnd}}</p>
        </div>
        <a href="{{acceptUrl}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Quote</a>
      </div>
    `
  },
  'Life Insurance': {
    subject: 'Your Life Insurance Quote - {{quoteid}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Life Insurance Quote</h2>
        <p>Dear {{clientName}},</p>
        <p>Your life insurance quote is ready:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>{{planName}}</h3>
          <p><strong>Carrier:</strong> {{carrier}}</p>
          <p><strong>Premium:</strong> ₹{{premium}}</p>
          <p><strong>Coverage:</strong> ₹{{coverage}}</p>
          <p><strong>Valid Until:</strong> {{validityEnd}}</p>
        </div>
        <a href="{{acceptUrl}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Quote</a>
      </div>
    `
  }
};
