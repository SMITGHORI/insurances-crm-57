
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { interactionsApi } from '../services/api/interactionsApi';

// Query keys for cache management
export const interactionsQueryKeys = {
  all: ['interactions'],
  lists: () => [...interactionsQueryKeys.all, 'list'],
  list: (params) => [...interactionsQueryKeys.lists(), params],
  details: () => [...interactionsQueryKeys.all, 'detail'],
  detail: (id) => [...interactionsQueryKeys.details(), id],
  client: (clientId) => [...interactionsQueryKeys.all, 'client', clientId],
  stats: (params) => [...interactionsQueryKeys.all, 'stats', params],
};

export const useInteractions = (params = {}) => {
  return useQuery({
    queryKey: interactionsQueryKeys.list(params),
    queryFn: () => interactionsApi.getInteractions(params),
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching interactions:', error);
      toast.error('Failed to load interactions');
    },
  });
};

export const useInteraction = (interactionId) => {
  return useQuery({
    queryKey: interactionsQueryKeys.detail(interactionId),
    queryFn: () => interactionsApi.getInteractionById(interactionId),
    enabled: !!interactionId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching interaction:', error);
      toast.error('Failed to load interaction details');
    },
  });
};

export const useClientInteractions = (clientId) => {
  return useQuery({
    queryKey: interactionsQueryKeys.client(clientId),
    queryFn: () => interactionsApi.getInteractionsByClient(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching client interactions:', error);
      toast.error('Failed to load client interactions');
    },
  });
};

export const useCreateInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interactionData) => {
      console.log('Creating interaction with data:', interactionData);
      
      if (!interactionData.clientId || !interactionData.type || !interactionData.subject) {
        throw new Error('Missing required fields: client, type, or subject');
      }

      return interactionsApi.createInteraction(interactionData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: interactionsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: interactionsQueryKeys.client(variables.clientId) });
      
      toast.success('Interaction logged successfully');
    },
    onError: (error) => {
      console.error('Error creating interaction:', error);
      toast.error(`Failed to log interaction: ${error.message}`);
    },
  });
};

export const useUpdateInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, interactionData }) => {
      console.log('Updating interaction with data:', interactionData);
      return interactionsApi.updateInteraction(id, interactionData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      queryClient.setQueryData(interactionsQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: interactionsQueryKeys.lists() });
      
      toast.success('Interaction updated successfully');
    },
    onError: (error) => {
      console.error('Error updating interaction:', error);
      toast.error(`Failed to update interaction: ${error.message}`);
    },
  });
};

export const useInteractionStats = (params = {}) => {
  return useQuery({
    queryKey: interactionsQueryKeys.stats(params),
    queryFn: () => interactionsApi.getInteractionStats(params),
    staleTime: 10 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching interaction stats:', error);
      toast.error('Failed to load interaction statistics');
    },
  });
};
