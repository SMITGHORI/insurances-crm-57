
export const INSURANCE_TYPES = {
  HEALTH: 'Health Insurance',
  TERM_LIFE: 'Term Life Insurance', 
  VEHICLE: 'Vehicle Insurance',
  PROPERTY: 'Property Insurance'
};

export const INSURANCE_TYPE_CONFIG = {
  [INSURANCE_TYPES.HEALTH]: {
    id: 'health',
    name: 'Health Insurance',
    documentTypes: [
      { value: 'medical_bills', label: 'Medical Bills/Invoices' },
      { value: 'discharge_summary', label: 'Discharge Summary' },
      { value: 'prescription', label: 'Prescription/Medicine Bills' },
      { value: 'lab_reports', label: 'Lab/Diagnostic Reports' },
      { value: 'pre_auth', label: 'Pre-Authorization Letter' },
      { value: 'medical_certificate', label: 'Medical Certificate' },
      { value: 'id_proof', label: 'ID Proof' },
      { value: 'policy_copy', label: 'Policy Copy' },
      { value: 'claim_form', label: 'Duly Filled Claim Form' },
      { value: 'other', label: 'Other Medical Documents' }
    ],
    specificFields: {
      hospitalName: { required: true, label: 'Hospital/Clinic Name' },
      hospitalAddress: { required: false, label: 'Hospital Address' },
      hospitalContact: { required: false, label: 'Hospital Contact' },
      admissionDate: { required: true, label: 'Admission Date' },
      dischargeDate: { required: false, label: 'Discharge Date' },
      roomCategory: { required: false, label: 'Room Category' },
      diagnosis: { required: true, label: 'Diagnosis/Medical Condition' },
      treatment: { required: true, label: 'Treatment Received' },
      treatmentType: { required: false, label: 'Treatment Type' },
      doctorName: { required: true, label: 'Attending Doctor Name' },
      doctorSpeciality: { required: false, label: 'Doctor Speciality' },
      medicalHistory: { required: false, label: 'Relevant Medical History' },
      billedAmount: { required: true, label: 'Total Billed Amount' },
      cashless: { required: false, label: 'Cashless Treatment' },
      preAuthApproved: { required: false, label: 'Pre-Authorization Approved' },
      preAuthAmount: { required: false, label: 'Pre-Authorization Amount' }
    }
  },
  
  [INSURANCE_TYPES.TERM_LIFE]: {
    id: 'term_life',
    name: 'Term Life Insurance',
    documentTypes: [
      { value: 'death_certificate', label: 'Death Certificate' },
      { value: 'medical_certificate', label: 'Medical Certificate of Death' },
      { value: 'post_mortem', label: 'Post-Mortem Report (if applicable)' },
      { value: 'police_report', label: 'Police Report (if accidental)' },
      { value: 'hospital_records', label: 'Hospital/Medical Records' },
      { value: 'policy_copy', label: 'Original Policy Document' },
      { value: 'nominee_id', label: 'Nominee ID Proof' },
      { value: 'nominee_relationship', label: 'Relationship Proof' },
      { value: 'claim_form', label: 'Duly Filled Claim Form' },
      { value: 'other', label: 'Other Supporting Documents' }
    ],
    specificFields: {
      dateOfDeath: { required: true, label: 'Date of Death' },
      placeOfDeath: { required: true, label: 'Place of Death' },
      causeOfDeath: { required: true, label: 'Cause of Death' },
      natureOfDeath: { required: true, label: 'Nature of Death (Natural/Accidental/Suicide)' },
      hospitalName: { required: false, label: 'Hospital Name (if applicable)' },
      doctorName: { required: false, label: 'Attending Doctor Name' },
      nomineeName: { required: true, label: 'Nominee Name' },
      nomineeRelationship: { required: true, label: 'Relationship with Insured' },
      nomineeContact: { required: true, label: 'Nominee Contact Number' },
      sumAssured: { required: true, label: 'Sum Assured Amount' },
      premiumsPaid: { required: false, label: 'Total Premiums Paid' },
      policeStationName: { required: false, label: 'Police Station (if accidental)' },
      firNumber: { required: false, label: 'FIR Number (if applicable)' }
    }
  },
  
  [INSURANCE_TYPES.VEHICLE]: {
    id: 'vehicle',
    name: 'Vehicle Insurance',
    documentTypes: [
      { value: 'damage_photos', label: 'Vehicle Damage Photos' },
      { value: 'repair_estimate', label: 'Repair Estimate/Invoice' },
      { value: 'police_report', label: 'Police Report/FIR' },
      { value: 'driving_license', label: 'Valid Driving License' },
      { value: 'rc_copy', label: 'Registration Certificate (RC)' },
      { value: 'policy_copy', label: 'Insurance Policy Copy' },
      { value: 'puc_certificate', label: 'PUC Certificate' },
      { value: 'fitness_certificate', label: 'Fitness Certificate (Commercial)' },
      { value: 'claim_form', label: 'Motor Claim Form' },
      { value: 'other', label: 'Other Vehicle Documents' }
    ],
    specificFields: {
      vehicleNumber: { required: true, label: 'Vehicle Registration Number' },
      vehicleMake: { required: true, label: 'Vehicle Make/Brand' },
      vehicleModel: { required: true, label: 'Vehicle Model' },
      vehicleYear: { required: false, label: 'Year of Manufacture' },
      engineNumber: { required: false, label: 'Engine Number' },
      chassisNumber: { required: false, label: 'Chassis Number' },
      driverName: { required: true, label: 'Driver Name at Time of Accident' },
      driverLicenseNumber: { required: true, label: 'Driver License Number' },
      accidentLocation: { required: true, label: 'Accident Location' },
      policeStationName: { required: false, label: 'Police Station Name' },
      firNumber: { required: false, label: 'FIR Number' },
      damageDescription: { required: true, label: 'Description of Damage' },
      repairGarage: { required: false, label: 'Preferred Repair Garage' },
      estimatedRepairCost: { required: false, label: 'Estimated Repair Cost' },
      thirdPartyInvolved: { required: false, label: 'Third Party Involved' },
      thirdPartyDetails: { required: false, label: 'Third Party Details' }
    }
  },
  
  [INSURANCE_TYPES.PROPERTY]: {
    id: 'property',
    name: 'Property Insurance',
    documentTypes: [
      { value: 'damage_photos', label: 'Property Damage Photos' },
      { value: 'repair_estimate', label: 'Repair/Restoration Estimate' },
      { value: 'police_report', label: 'Police Report (if theft/burglary)' },
      { value: 'fire_brigade_report', label: 'Fire Brigade Report (if fire)' },
      { value: 'property_deed', label: 'Property Ownership Documents' },
      { value: 'policy_copy', label: 'Property Insurance Policy' },
      { value: 'purchase_receipts', label: 'Purchase Receipts of Damaged Items' },
      { value: 'surveyor_report', label: 'Surveyor Assessment Report' },
      { value: 'claim_form', label: 'Property Claim Form' },
      { value: 'other', label: 'Other Property Documents' }
    ],
    specificFields: {
      propertyAddress: { required: true, label: 'Property Address' },
      propertyType: { required: true, label: 'Property Type' },
      propertySize: { required: false, label: 'Property Size/Area' },
      propertyValue: { required: false, label: 'Current Property Value' },
      damageType: { required: true, label: 'Type of Damage' },
      damageDate: { required: true, label: 'Date of Damage' },
      damageDescription: { required: true, label: 'Description of Damage' },
      affectedAreas: { required: true, label: 'Affected Areas/Rooms' },
      damageExtent: { required: true, label: 'Extent of Damage (%)' },
      surveyorName: { required: false, label: 'Insurance Surveyor Name' },
      surveyorContact: { required: false, label: 'Surveyor Contact' },
      surveyDate: { required: false, label: 'Survey Date' },
      estimatedRepairCost: { required: false, label: 'Estimated Repair Cost' },
      temporaryAccommodation: { required: false, label: 'Temporary Accommodation Required' },
      policeStationName: { required: false, label: 'Police Station (if applicable)' },
      firNumber: { required: false, label: 'FIR Number (if applicable)' }
    }
  }
};

export const getInsuranceTypeConfig = (policyType) => {
  return INSURANCE_TYPE_CONFIG[policyType] || null;
};

export const getDocumentTypes = (policyType) => {
  const config = getInsuranceTypeConfig(policyType);
  return config ? config.documentTypes : [];
};

export const getSpecificFields = (policyType) => {
  const config = getInsuranceTypeConfig(policyType);
  return config ? config.specificFields : {};
};
