
// Function to generate unique client IDs with pattern AMB-CLI-YYYYMMDD-XXXX
// where XXXX is a sequence number

export const generateClientId = (existingIds = []) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `AMB-CLI-${year}${month}${day}`;
  
  // Find the highest sequence number for today's date
  const todaysIds = existingIds.filter(id => id.startsWith(datePrefix));
  let highestSequence = 0;
  
  if (todaysIds.length > 0) {
    todaysIds.forEach(id => {
      const sequencePart = id.split('-')[3];
      const sequence = parseInt(sequencePart, 10);
      if (sequence > highestSequence) {
        highestSequence = sequence;
      }
    });
  }
  
  // Generate the next sequence number
  const nextSequence = String(highestSequence + 1).padStart(4, '0');
  return `${datePrefix}-${nextSequence}`;
};
