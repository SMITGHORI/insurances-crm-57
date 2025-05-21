
// Function to generate IDs with a specific prefix and year
export const generateClientId = (existingIds = []) => {
  const year = new Date().getFullYear();
  let sequence = 1;

  // Find the highest sequence number in existing IDs
  existingIds.forEach(id => {
    if (id && id.includes(`AMB-CLI-${year}-`)) {
      const existingSequence = parseInt(id.split('-').pop());
      if (!isNaN(existingSequence) && existingSequence >= sequence) {
        sequence = existingSequence + 1;
      }
    }
  });

  // Format the sequence number with leading zeros
  const formattedSequence = sequence.toString().padStart(4, '0');
  
  return `AMB-CLI-${year}-${formattedSequence}`;
};

// Ensure all clients have IDs (used during initialization)
export const ensureClientIds = (clients) => {
  const existingIds = clients
    .filter(client => client.clientId)
    .map(client => client.clientId);
  
  return clients.map(client => {
    if (client.clientId) return client;
    
    const newId = generateClientId(existingIds);
    existingIds.push(newId);
    
    return {
      ...client,
      clientId: newId
    };
  });
};

// Function to generate a policy ID
export const generateId = (prefix, year, id) => {
  // Format the ID with leading zeros
  const formattedId = id.toString().padStart(4, '0');
  return `${prefix}-${year}-${formattedId}`;
};

// Function to generate agent IDs
export const generateAgentId = () => {
  const year = new Date().getFullYear();
  
  // Try to get existing agents from localStorage
  const storedAgentsData = localStorage.getItem('agentsData');
  let agents = [];
  
  if (storedAgentsData) {
    agents = JSON.parse(storedAgentsData);
  }
  
  // Find the highest sequence number in existing agent IDs
  let sequence = 1;
  agents.forEach(agent => {
    if (agent.agentId && agent.agentId.includes(`AMB-AGT-${year}-`)) {
      const existingSequence = parseInt(agent.agentId.split('-').pop());
      if (!isNaN(existingSequence) && existingSequence >= sequence) {
        sequence = existingSequence + 1;
      }
    }
  });
  
  // Format the sequence number with leading zeros
  const formattedSequence = sequence.toString().padStart(4, '0');
  
  return `AMB-AGT-${year}-${formattedSequence}`;
};

// Function to generate member IDs for policy members
export const generateMemberId = (policyId, existingMembers = []) => {
  let sequence = 1;
  
  // Find the highest sequence number in existing member IDs for this policy
  existingMembers.forEach(member => {
    if (member && member.memberId && member.memberId.includes(`MBR-${policyId}-`)) {
      const existingSequence = parseInt(member.memberId.split('-').pop());
      if (!isNaN(existingSequence) && existingSequence >= sequence) {
        sequence = existingSequence + 1;
      }
    }
  });
  
  // Format the sequence number with leading zeros
  const formattedSequence = sequence.toString().padStart(2, '0');
  
  return `MBR-${policyId}-${formattedSequence}`;
};

// Function to generate claim IDs
export const generateClaimId = () => {
  const year = new Date().getFullYear();
  
  // Try to get existing claims from localStorage
  const storedClaimsData = localStorage.getItem('claimsData');
  let claims = [];
  
  if (storedClaimsData) {
    claims = JSON.parse(storedClaimsData);
  }
  
  // Find the highest sequence number in existing claim IDs
  let sequence = 1;
  claims.forEach(claim => {
    if (claim.claimId && claim.claimId.includes(`AMB-CLM-${year}-`)) {
      const existingSequence = parseInt(claim.claimId.split('-').pop());
      if (!isNaN(existingSequence) && existingSequence >= sequence) {
        sequence = existingSequence + 1;
      }
    }
  });
  
  // Format the sequence number with leading zeros
  const formattedSequence = sequence.toString().padStart(4, '0');
  
  return `AMB-CLM-${year}-${formattedSequence}`;
};
