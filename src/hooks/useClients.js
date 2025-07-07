
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Mock clients service for fallback
const mockClientsApi = {
  getClients: () => Promise.resolve({
    success: true,
    data: [
      {
        _id: 'client1',
        displayName: 'John Doe',
        email: 'john@example.com',
        phone: '+91-9876543210',
        assignedAgentId: 'agent-fallback-id'
      },
      {
        _id: 'client2',
        displayName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+91-9876543211',
        assignedAgentId: 'agent-fallback-id'
      }
    ],
    total: 2
  })
};

export const useClients = (params = {}) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: async () => {
      try {
        // For now, use mock data since the focus is on policies
        console.log('Using mock clients data for policies module');
        return await mockClientsApi.getClients();
      } catch (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
