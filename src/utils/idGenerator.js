
// Function to generate unique client IDs with pattern AMB-CLI-YYYY-XXXX
// where YYYY is the year and XXXX is a sequence number that resets each year

export const generateClientId = (existingIds = []) => {
  const today = new Date();
  const year = today.getFullYear();
  const datePrefix = `AMB-CLI-${year}`;
  
  // Find the highest sequence number for the current year
  const yearIds = existingIds.filter(id => id && id.startsWith(datePrefix));
  let highestSequence = 0;
  
  if (yearIds.length > 0) {
    yearIds.forEach(id => {
      const sequencePart = id.split('-')[3];
      if (sequencePart) {
        const sequence = parseInt(sequencePart, 10);
        if (!isNaN(sequence) && sequence > highestSequence) {
          highestSequence = sequence;
        }
      }
    });
  }
  
  // Generate the next sequence number
  const nextSequence = String(highestSequence + 1).padStart(4, '0');
  return `${datePrefix}-${nextSequence}`;
};

// Function to ensure all clients have a valid client ID
export const ensureClientIds = (clients) => {
  const validIds = clients.filter(client => client.clientId).map(client => client.clientId);
  
  return clients.map(client => {
    if (!client.clientId) {
      // Generate a new client ID for this client
      client.clientId = generateClientId(validIds);
      // Add this ID to our list of valid IDs for subsequent generations
      validIds.push(client.clientId);
    }
    return client;
  });
};

// Function to generate a generic ID with a specific prefix and year
export const generateId = (prefix, year, id) => {
  // Format: PREFIX-YYYY-XXXX where XXXX is the sequence padded to 4 digits
  return `${prefix}-${year}-${String(id).padStart(4, '0')}`;
};
