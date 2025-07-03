
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
  offers: ['offers'],
  offersList: (params) => [...broadcastQueryKeys.offers, 'list', params],
  offerDetail: (id) => [...broadcastQueryKeys.offers, 'detail', id],
  templates: ['broadcast-templates'],
  analytics: (id) => [...broadcastQueryKeys.all, 'analytics', id],
};

/**
 * Hook to fetch broadcasts from MongoDB
 */
export const useBroadcasts = (params = {}) => {
  return useQuery({
    queryKey: broadcastQueryKeys.list(params),
    queryFn: () => broadcastApi.getBroadcasts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching broadcasts from MongoDB:', error);
      toast.error('Failed to load broadcasts from database');
    },
  });
};

/**
 * Hook to fetch single broadcast from MongoDB
 */
export const useBroadcast = (broadcastId) => {
  return useQuery({
    queryKey: broadcastQueryKeys.detail(broadcastId),
    queryFn: () => broadcastApi.getBroadcastById(broadcastId),
    enabled: !!broadcastId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching broadcast from MongoDB:', error);
      toast.error('Failed to load broadcast from database');
    },
  });
};

/**
 * Hook to create broadcast in MongoDB
 */
export const useCreateBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (broadcastData) => {
      console.log('Creating broadcast in MongoDB:', broadcastData);
      
      if (!broadcastData.title || !broadcastData.content || !broadcastData.channels?.length) {
        throw new Error('Missing required fields: title, content, or channels');
      }

      return broadcastApi.createBroadcast(broadcastData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.lists() });
      toast.success('Broadcast created and saved to database successfully');
      console.log('Broadcast created in MongoDB successfully:', data);
    },
    onError: (error, variables) => {
      console.error('Error creating broadcast in MongoDB:', error);
      toast.error(`Failed to create broadcast in database: ${error.message}`);
    },
  });
};

/**
 * Hook to update broadcast in MongoDB
 */
export const useUpdateBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ broadcastId, broadcastData }) => {
      return broadcastApi.updateBroadcast(broadcastId, broadcastData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.detail(variables.broadcastId) });
      toast.success('Broadcast updated in database successfully');
    },
    onError: (error) => {
      console.error('Error updating broadcast in MongoDB:', error);
      toast.error(`Failed to update broadcast in database: ${error.message}`);
    },
  });
};

/**
 * Hook to delete broadcast from MongoDB
 */
export const useDeleteBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (broadcastId) => {
      return broadcastApi.deleteBroadcast(broadcastId);
    },
    onSuccess: (data, broadcastId) => {
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: broadcastQueryKeys.detail(broadcastId) });
      toast.success('Broadcast deleted from database successfully');
    },
    onError: (error) => {
      console.error('Error deleting broadcast from MongoDB:', error);
      toast.error(`Failed to delete broadcast from database: ${error.message}`);
    },
  });
};

/**
 * Hook to get eligible clients from MongoDB
 */
export const useEligibleClients = () => {
  return useMutation({
    mutationFn: async ({ targetAudience, channels }) => {
      return broadcastApi.getEligibleClients(targetAudience, channels);
    },
    onError: (error) => {
      console.error('Error fetching eligible clients from MongoDB:', error);
      toast.error('Failed to fetch eligible clients from database');
    },
  });
};

/**
 * Hook to update client preferences in MongoDB
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
      toast.success('Communication preferences updated in database successfully');
    },
    onError: (error) => {
      console.error('Error updating preferences in MongoDB:', error);
      toast.error(`Failed to update preferences in database: ${error.message}`);
    },
  });
};

/**
 * Hook to get broadcast stats from MongoDB
 */
export const useBroadcastStats = (broadcastId) => {
  return useQuery({
    queryKey: broadcastQueryKeys.stats(broadcastId),
    queryFn: () => broadcastApi.getBroadcastStats(broadcastId),
    enabled: !!broadcastId,
    staleTime: 30 * 1000, // 30 seconds
    onError: (error) => {
      console.error('Error fetching broadcast stats from MongoDB:', error);
      toast.error('Failed to load broadcast statistics from database');
    },
  });
};

/**
 * Hook to fetch offers from MongoDB
 */
export const useOffers = (params = {}) => {
  return useQuery({
    queryKey: broadcastQueryKeys.offersList(params),
    queryFn: () => broadcastApi.getOffers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching offers from MongoDB:', error);
      toast.error('Failed to load offers from database');
    },
  });
};

/**
 * Hook to fetch single offer from MongoDB
 */
export const useOffer = (offerId) => {
  return useQuery({
    queryKey: broadcastQueryKeys.offerDetail(offerId),
    queryFn: () => broadcastApi.getOfferById(offerId),
    enabled: !!offerId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching offer from MongoDB:', error);
      toast.error('Failed to load offer from database');
    },
  });
};

/**
 * Hook to create offer in MongoDB
 */
export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerData) => {
      console.log('Creating offer in MongoDB:', offerData);
      
      if (!offerData.title || !offerData.description || !offerData.type) {
        throw new Error('Missing required fields: title, description, or type');
      }

      return broadcastApi.createOffer(offerData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.offers });
      toast.success('Offer created and saved to database successfully');
      console.log('Offer created in MongoDB successfully:', data);
    },
    onError: (error, variables) => {
      console.error('Error creating offer in MongoDB:', error);
      toast.error(`Failed to create offer in database: ${error.message}`);
    },
  });
};

/**
 * Hook to update offer in MongoDB
 */
export const useUpdateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ offerId, offerData }) => {
      return broadcastApi.updateOffer(offerId, offerData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.offers });
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.offerDetail(variables.offerId) });
      toast.success('Offer updated in database successfully');
    },
    onError: (error) => {
      console.error('Error updating offer in MongoDB:', error);
      toast.error(`Failed to update offer in database: ${error.message}`);
    },
  });
};

/**
 * Hook to delete offer from MongoDB
 */
export const useDeleteOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId) => {
      return broadcastApi.deleteOffer(offerId);
    },
    onSuccess: (data, offerId) => {
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.offers });
      queryClient.removeQueries({ queryKey: broadcastQueryKeys.offerDetail(offerId) });
      toast.success('Offer deleted from database successfully');
    },
    onError: (error) => {
      console.error('Error deleting offer from MongoDB:', error);
      toast.error(`Failed to delete offer from database: ${error.message}`);
    },
  });
};

/**
 * Hook to send broadcast via MongoDB
 */
export const useSendBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (broadcastId) => {
      return broadcastApi.sendBroadcast(broadcastId);
    },
    onSuccess: (data, broadcastId) => {
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.detail(broadcastId) });
      toast.success('Broadcast sent successfully via database');
    },
    onError: (error) => {
      console.error('Error sending broadcast via MongoDB:', error);
      toast.error(`Failed to send broadcast: ${error.message}`);
    },
  });
};

/**
 * Hook to get broadcast analytics from MongoDB
 */
export const useBroadcastAnalytics = (broadcastId) => {
  return useQuery({
    queryKey: broadcastQueryKeys.analytics(broadcastId),
    queryFn: () => broadcastApi.getBroadcastAnalytics(broadcastId),
    enabled: !!broadcastId,
    staleTime: 2 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching broadcast analytics from MongoDB:', error);
      toast.error('Failed to load broadcast analytics from database');
    },
  });
};

/**
 * Hook to export broadcasts from MongoDB
 */
export const useExportBroadcasts = () => {
  return useMutation({
    mutationFn: async (params) => {
      return broadcastApi.exportBroadcasts(params);
    },
    onSuccess: (data) => {
      toast.success('Broadcasts exported from database successfully');
    },
    onError: (error) => {
      console.error('Error exporting broadcasts from MongoDB:', error);
      toast.error(`Failed to export broadcasts: ${error.message}`);
    },
  });
};

/**
 * Hook to export offers from MongoDB
 */
export const useExportOffers = () => {
  return useMutation({
    mutationFn: async (params) => {
      return broadcastApi.exportOffers(params);
    },
    onSuccess: (data) => {
      toast.success('Offers exported from database successfully');
    },
    onError: (error) => {
      console.error('Error exporting offers from MongoDB:', error);
      toast.error(`Failed to export offers: ${error.message}`);
    },
  });
};
