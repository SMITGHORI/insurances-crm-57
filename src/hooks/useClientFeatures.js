
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import clientsApi from '../services/api/clientsApi';
import { clientsQueryKeys } from './useClients';

/**
 * Additional client feature hooks for MongoDB operations
 */

/**
 * Hook for client search functionality
 */
export const useClientSearch = () => {
  return useMutation({
    mutationFn: async ({ query, limit = 10 }) => {
      console.log('Searching clients in MongoDB:', { query, limit });
      const result = await clientsApi.searchClients(query, limit);
      console.log('Client search results from MongoDB:', result);
      return result;
    },
    onError: (error) => {
      console.error('Error searching clients in MongoDB:', error);
      toast.error(`Search failed: ${error.message}`);
    },
  });
};

/**
 * Hook for getting clients by agent
 */
export const useClientsByAgent = (agentId) => {
  return useQuery({
    queryKey: ['clients', 'agent', agentId],
    queryFn: async () => {
      console.log('Fetching clients by agent from MongoDB:', agentId);
      const result = await clientsApi.getClientsByAgent(agentId);
      console.log('Agent clients fetched from MongoDB:', result);
      return result;
    },
    enabled: !!agentId,
    staleTime: 30 * 1000,
    onError: (error) => {
      console.error('Error fetching agent clients from MongoDB:', error);
      toast.error(`Failed to load agent clients: ${error.message}`);
    },
  });
};

/**
 * Hook for assigning clients to agents
 */
export const useAssignClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, agentId }) => {
      console.log('Assigning client to agent in MongoDB:', { clientId, agentId });
      const result = await clientsApi.assignClientToAgent(clientId, agentId);
      console.log('Client assigned to agent in MongoDB:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      const { clientId, agentId } = variables;
      console.log('Client successfully assigned to agent in MongoDB:', data);
      
      // Invalidate relevant queries to refresh data from database
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      queryClient.invalidateQueries({ queryKey: ['clients', 'agent', agentId] });
      
      toast.success('Client assigned successfully to agent in database');
    },
    onError: (error) => {
      console.error('Error assigning client to agent in MongoDB:', error);
      toast.error(`Failed to assign client: ${error.message}`);
    },
  });
};

/**
 * Hook for real-time client updates (WebSocket integration)
 */
export const useClientRealTimeUpdates = () => {
  const queryClient = useQueryClient();

  const setupRealTimeUpdates = (clientId) => {
    // This would connect to WebSocket for real-time updates
    // Implementation depends on your WebSocket setup
    console.log('Setting up real-time updates for client:', clientId);
    
    // Example WebSocket connection
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(`${wsUrl}/clients/${clientId}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Real-time client update received:', data);
        
        if (data.type === 'CLIENT_UPDATED') {
          // Invalidate and refetch client data
          queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
          queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
          
          toast.info('Client data updated in real-time');
        }
      } catch (error) {
        console.error('Error processing real-time update:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error for client updates:', error);
    };
    
    return () => {
      ws.close();
    };
  };

  return { setupRealTimeUpdates };
};

/**
 * Export all client feature hooks
 */
export const useClientFeatures = () => {
  const search = useClientSearch();
  const assign = useAssignClient();
  const realTime = useClientRealTimeUpdates();

  return {
    search,
    assign,
    realTime,
  };
};
