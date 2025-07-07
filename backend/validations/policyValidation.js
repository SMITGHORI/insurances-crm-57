
const Joi = require('joi');

// Vehicle details schema for motor insurance
const vehicleDetailsSchema = Joi.object({
  registrationNumber: Joi.string().optional().trim(),
  make: Joi.string().optional().trim(),
  model: Joi.string().optional().trim(),
  variant: Joi.string().optional().trim(),
  yearOfManufacture: Joi.number().optional().min(1950).max(new Date().getFullYear()),
  engineNumber: Joi.string().optional().trim(),
  chassisNumber: Joi.string().optional().trim(),
  fuelType: Joi.string().optional().valid('petrol', 'diesel', 'cng', 'electric', 'hybrid'),
  cubicCapacity: Joi.number().optional().min(50),
  seatingCapacity: Joi.number().optional().min(1),
  vehicleType: Joi.string().optional().valid('two_wheeler', 'car', 'commercial', 'truck', 'bus')
});

// Health details schema for health insurance
const healthDetailsSchema = Joi.object({
  preExistingDiseases: Joi.array().items(Joi.string()).optional(),
  familyMedicalHistory: Joi.string().optional().trim(),
  coverageType: Joi.string().optional().valid('individual', 'family_floater', 'group'),
  roomRentLimit: Joi.number().optional().min(0),
  copaymentPercentage: Joi.number().optional().min(0).max(100),
  waitingPeriod: Joi.number().optional().min(0)
});

// Travel details schema for travel insurance
const travelDetailsSchema = Joi.object({
  destination: Joi.string().optional().trim(),
  travelStartDate: Joi.date().optional(),
  travelEndDate: Joi.date().optional().greater(Joi.ref('travelStartDate')),
  travelPurpose: Joi.string().optional().valid('leisure', 'business', 'education', 'medical'),
  numberOfTravelers: Joi.number().optional().min(1)
});

// Nominees schema for life insurance
const nomineeSchema = Joi.object({
  name: Joi.string().required().trim().max(100),
  relationship: Joi.string().required().trim().max(50),
  percentage: Joi.number().required().min(0).max(100),
  dateOfBirth: Joi.date().optional(),
  address: Joi.string().optional().trim().max(500)
});

// Commission schema
const commissionSchema = Joi.object({
  percentage: Joi.number().required().min(0).max(100),
  amount: Joi.number().required().min(0),
  type: Joi.string().optional().valid('first_year', 'renewal', 'bonus').default('first_year'),
  status: Joi.string().optional().valid('pending', 'paid', 'hold').default('pending'),
  paidDate: Joi.date().optional()
});

// Main policy validation schema
const policyValidation = Joi.object({
  policyNumber: Joi.string().optional().trim(), // Generated automatically if not provided
  clientId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  type: Joi.string().required().valid(
    'life', 'health', 'motor', 'home', 'travel', 'marine', 'fire', 
    'personal_accident', 'group_health', 'group_life', 'commercial', 'other'
  ),
  category: Joi.string().optional().valid('individual', 'family', 'group', 'corporate').default('individual'),
  insuranceCompany: Joi.string().required().trim().max(200),
  planName: Joi.string().required().trim().max(200),
  sumAssured: Joi.number().required().min(1),
  premium: Joi.number().required().min(1),
  paymentFrequency: Joi.string().optional().valid('monthly', 'quarterly', 'half_yearly', 'yearly', 'single').default('yearly'),
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref('startDate')),
  maturityDate: Joi.date().optional().greater(Joi.ref('startDate')),
  status: Joi.string().optional().valid('Proposal', 'Active', 'Lapsed', 'Matured', 'Cancelled', 'Expired', 'Suspended').default('Proposal'),
  gracePeriod: Joi.number().optional().min(0).default(30),
  policyTermYears: Joi.number().optional().min(1),
  premiumPaymentTermYears: Joi.number().optional().min(1),
  lockInPeriod: Joi.number().optional().min(0).default(0),
  gstNumber: Joi.string().optional().trim().uppercase(),
  discountPercentage: Joi.number().optional().min(0).max(100).default(0),
  nextYearPremium: Joi.number().optional().min(0),
  assignedAgentId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  
  // Optional specific details
  nominees: Joi.array().items(nomineeSchema).optional(),
  typeSpecificDetails: Joi.object().optional(),
  vehicleDetails: vehicleDetailsSchema.optional(),
  healthDetails: healthDetailsSchema.optional(),
  travelDetails: travelDetailsSchema.optional(),
  commission: commissionSchema.optional(),
  source: Joi.string().optional().valid('direct', 'referral', 'online', 'campaign', 'renewal').default('direct')
});

// Update policy validation (all fields optional except critical ones)
const updatePolicyValidation = Joi.object({
  clientId: Joi.string().optional().regex(/^[0-9a-fA-F]{24}$/),
  type: Joi.string().optional().valid(
    'life', 'health', 'motor', 'home', 'travel', 'marine', 'fire', 
    'personal_accident', 'group_health', 'group_life', 'commercial', 'other'
  ),
  category: Joi.string().optional().valid('individual', 'family', 'group', 'corporate'),
  insuranceCompany: Joi.string().optional().trim().max(200),
  planName: Joi.string().optional().trim().max(200),
  sumAssured: Joi.number().optional().min(1),
  premium: Joi.number().optional().min(1),
  paymentFrequency: Joi.string().optional().valid('monthly', 'quarterly', 'half_yearly', 'yearly', 'single'),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  maturityDate: Joi.date().optional(),
  status: Joi.string().optional().valid('Proposal', 'Active', 'Lapsed', 'Matured', 'Cancelled', 'Expired', 'Suspended'),
  gracePeriod: Joi.number().optional().min(0),
  policyTermYears: Joi.number().optional().min(1),
  premiumPaymentTermYears: Joi.number().optional().min(1),
  lockInPeriod: Joi.number().optional().min(0),
  gstNumber: Joi.string().optional().trim().uppercase(),
  discountPercentage: Joi.number().optional().min(0).max(100),
  nextYearPremium: Joi.number().optional().min(0),
  assignedAgentId: Joi.string().optional().regex(/^[0-9a-fA-F]{24}$/),
  
  // Optional updates
  nominees: Joi.array().items(nomineeSchema).optional(),
  typeSpecificDetails: Joi.object().optional(),
  vehicleDetails: vehicleDetailsSchema.optional(),
  healthDetails: healthDetailsSchema.optional(),
  travelDetails: travelDetailsSchema.optional(),
  commission: commissionSchema.optional(),
  source: Joi.string().optional().valid('direct', 'referral', 'online', 'campaign', 'renewal')
});

// Policy document validation
const policyDocumentValidation = Joi.object({
  documentType: Joi.string().required().valid('policy_document', 'certificate', 'endorsement', 'claim_form', 'medical_report', 'other'),
  name: Joi.string().optional().trim().max(200)
});

// Payment validation
const paymentValidation = Joi.object({
  amount: Joi.number().required().min(1),
  paymentDate: Joi.date().required(),
  paymentMethod: Joi.string().required().valid('cash', 'cheque', 'online', 'card', 'bank_transfer', 'upi'),
  transactionId: Joi.string().optional().trim(),
  status: Joi.string().optional().valid('pending', 'completed', 'failed', 'cancelled').default('completed'),
  notes: Joi.string().optional().trim().max(500)
});

// Renewal validation
const renewalValidation = Joi.object({
  newEndDate: Joi.date().required(),
  newPremium: Joi.number().optional().min(1),
  renewalType: Joi.string().optional().valid('automatic', 'manual').default('manual'),
  notes: Joi.string().optional().trim().max(500)
});

// Endorsement validation
const endorsementValidation = Joi.object({
  endorsementNumber: Joi.string().required().trim(),
  endorsementDate: Joi.date().required(),
  endorsementType: Joi.string().required().valid('addition', 'deletion', 'modification', 'cancellation'),
  description: Joi.string().required().trim().max(1000),
  premiumImpact: Joi.number().optional().default(0)
});

// Export validation schemas
module.exports = {
  policyValidation,
  updatePolicyValidation,
  policyDocumentValidation,
  paymentValidation,
  renewalValidation,
  endorsementValidation
};
