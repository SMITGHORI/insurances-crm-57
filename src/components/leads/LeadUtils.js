
export const getStatusColor = (status) => {
  switch (status) {
    case 'New':
      return 'bg-blue-500';
    case 'In Progress':
      return 'bg-yellow-500';
    case 'Qualified':
      return 'bg-green-500';
    case 'Closed':
      return 'bg-gray-500';
    case 'Lost':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return 'text-red-600';
    case 'Medium':
      return 'text-yellow-600';
    case 'Low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};
