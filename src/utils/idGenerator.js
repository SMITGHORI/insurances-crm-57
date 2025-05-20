
// Function to generate unique client IDs with pattern AMB-CLI-YYYYMMDD-XXXX
// where XXXX is a sequence number

export const generateClientId = (existingIds = []) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `AMB-CLI-${year}${month}${day}`;
  
  // Find the highest sequence number for today's date
  const todaysIds = existingIds.filter(id => id && id.startsWith(datePrefix));
  let highestSequence = 0;
  
  if (todaysIds.length > 0) {
    todaysIds.forEach(id => {
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
