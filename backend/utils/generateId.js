
/**
 * Utility functions for generating various ID formats
 */

/**
 * Generate claim number
 * Format: CLM-YYYY-NNN
 */
const generateClaimNumber = async (ClaimModel) => {
  const year = new Date().getFullYear();
  const count = await ClaimModel.countDocuments({
    claimNumber: new RegExp(`^CLM-${year}-`)
  });
  return `CLM-${year}-${String(count + 1).padStart(3, '0')}`;
};

/**
 * Generate policy number
 * Format: POL-YYYY-NNN
 */
const generatePolicyNumber = async (PolicyModel) => {
  const year = new Date().getFullYear();
  const count = await PolicyModel.countDocuments({
    policyNumber: new RegExp(`^POL-${year}-`)
  });
  return `POL-${year}-${String(count + 1).padStart(3, '0')}`;
};

/**
 * Generate client number
 * Format: CLT-YYYY-NNN
 */
const generateClientNumber = async (ClientModel) => {
  const year = new Date().getFullYear();
  const count = await ClientModel.countDocuments({
    clientNumber: new RegExp(`^CLT-${year}-`)
  });
  return `CLT-${year}-${String(count + 1).padStart(3, '0')}`;
};

/**
 * Generate agent number
 * Format: AGT-YYYY-NNN
 */
const generateAgentNumber = async (AgentModel) => {
  const year = new Date().getFullYear();
  const count = await AgentModel.countDocuments({
    agentNumber: new RegExp(`^AGT-${year}-`)
  });
  return `AGT-${year}-${String(count + 1).padStart(3, '0')}`;
};

/**
 * Generate random reference ID
 * Format: XXX-XXXXXX (alphanumeric)
 */
const generateReferenceId = (prefix = 'REF') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate UUID v4
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

module.exports = {
  generateClaimNumber,
  generatePolicyNumber,
  generateClientNumber,
  generateAgentNumber,
  generateReferenceId,
  generateUUID
};
