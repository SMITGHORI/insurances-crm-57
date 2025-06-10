
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { broadcastApi } from '../services/api/broadcastApi';

// Query keys for cache management
export const broadcastQueryKeys = {
  all: ['broadcasts'],
  lists: () => [...broadcastQueryKeys.all, 'list'],
  list: (params) => [...broadcastQueryKeys.lists(), params],
  details: () => [...broadcastQueryKeys.all, 'detail'],
  detail: (id) => [...broadcastQueryKeys.details(), id],
  eligibleClients: ['eligible-clients'],
  stats: (id) => [...broadcastQueryKeys.all, 'stats', id],
};

/**
 * Hook to fetch broadcasts
 */
export const useBroadcasts = (params = {}) => {
  return useQuery({
    queryKey: broadcastQueryKeys.list(params),
    queryFn: () => broadcastApi.getBroadcasts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching broadcasts:', error);
      toast.error('Failed to load broadcasts');
    },
  });
};

/**
 * Hook to create broadcast
 */
export const useCreateBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (broadcastData) => {
      console.log('Creating broadcast:', broadcastData);
      
      if (!broadcastData.title || !broadcastData.content || !broadcastData.channels?.length) {
        throw new Error('Missing required fields: title, content, or channels');
      }

      return broadcastApi.createBroadcast(broadcastData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.lists() });
      toast.success('Broadcast created and scheduled successfully');
    },
    onError: (error, variables) => {
      console.error('Error creating broadcast:', error);
      toast.error(`Failed to create broadcast: ${error.message}`);
    },
  });
};

/**
 * Hook to get eligible clients
 */
export const useEligibleClients = () => {
  return useMutation({
    mutationFn: async ({ targetAudience, channels }) => {
      return broadcastApi.getEligibleClients(targetAudience, channels);
    },
    onError: (error) => {
      console.error('Error fetching eligible clients:', error);
      toast.error('Failed to fetch eligible clients');
    },
  });
};

/**
 * Hook to update client preferences
 */
export const useUpdateClientPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, preferences }) => {
      return broadcastApi.updateClientPreferences(clientId, preferences);
    },
    onSuccess: (data, variables) => {
      // Invalidate client data to refresh preferences
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Communication preferences updated successfully');
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });
};

/**
 * Hook to get broadcast stats
 */
export const useBroadcastStats = (broadcastId) => {
  return useQuery({
    queryKey: broadcastQueryKeys.stats(broadcastId),
    queryFn: () => broadcastApi.getBroadcastStats(broadcastId),
    enabled: !!broadcastId,
    staleTime: 30 * 1000, // 30 seconds
    onError: (error) => {
      console.error('Error fetching broadcast stats:', error);
      toast.error('Failed to load broadcast statistics');
    },
  });
};
