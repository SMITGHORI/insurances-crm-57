
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { communicationBackendApi } from '../services/api/communicationApiBackend';

/**
 * React Query hooks for communication management
 * Provides optimistic updates and proper error handling
 */

// Query keys for cache management
export const communicationQueryKeys = {
  all: ['communications'],
  lists: () => [...communicationQueryKeys.all, 'list'],
  list: (params) => [...communicationQueryKeys.lists(), params],
  details: () => [...communicationQueryKeys.all, 'detail'],
  detail: (id) => [...communicationQueryKeys.details(), id],
  stats: () => [...communicationQueryKeys.all, 'stats'],
  offers: ['offers'],
  offersList: (params) => [...communicationQueryKeys.offers, params],
  loyalty: ['loyalty'],
  loyaltyByClient: (clientId) => [...communicationQueryKeys.loyalty, clientId],
  automation: ['automation'],
  automationList: (params) => [...communicationQueryKeys.automation, params],
};

/**
 * Hook to fetch communications with filtering and pagination
 */
export const useCommunications = (params = {}) => {
  return useQuery({
    queryKey: communicationQueryKeys.list(params),
    queryFn: () => communicationBackendApi.getCommunications(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching communications:', error);
      toast.error('Failed to load communications');
    },
  });
};

/**
 * Hook to send communication
 */
export const useSendCommunication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communicationData) => {
      console.log('Sending communication:', communicationData);
      
      // Basic validation
      if (!communicationData.clientId || !communicationData.type || !communicationData.channel || !communicationData.content) {
        throw new Error('Missing required fields: clientId, type, channel, or content');
      }

      return communicationBackendApi.sendCommunication(communicationData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch communications list
      queryClient.invalidateQueries({ queryKey: communicationQueryKeys.lists() });
      
      toast.success('Communication sent successfully');
    },
    onError: (error, variables) => {
      console.error('Error sending communication:', error);
      toast.error(`Failed to send communication: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch client loyalty points
 */
export const useLoyaltyPoints = (clientId) => {
  return useQuery({
    queryKey: communicationQueryKeys.loyaltyByClient(clientId),
    queryFn: () => communicationBackendApi.getLoyaltyPoints(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching loyalty points:', error);
      toast.error('Failed to load loyalty points');
    },
  });
};

/**
 * Hook to update loyalty points
 */
export const useUpdateLoyaltyPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, pointsData }) => {
      console.log('Updating loyalty points:', pointsData);
      
      if (!pointsData.points || !pointsData.reason || !pointsData.transactionType) {
        throw new Error('Missing required fields: points, reason, or transactionType');
      }

      return communicationBackendApi.updateLoyaltyPoints(clientId, pointsData);
    },
    onSuccess: (data, variables) => {
      // Invalidate loyalty points for this client
      queryClient.invalidateQueries({ 
        queryKey: communicationQueryKeys.loyaltyByClient(variables.clientId) 
      });
      
      toast.success('Loyalty points updated successfully');
    },
    onError: (error, variables) => {
      console.error('Error updating loyalty points:', error);
      toast.error(`Failed to update loyalty points: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch offers
 */
export const useOffers = (params = {}) => {
  return useQuery({
    queryKey: communicationQueryKeys.offersList(params),
    queryFn: () => communicationBackendApi.getOffers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load offers');
    },
  });
};

/**
 * Hook to create new offer
 */
export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerData) => {
      console.log('Creating offer:', offerData);
      
      if (!offerData.title || !offerData.description || !offerData.type || !offerData.applicableProducts) {
        throw new Error('Missing required fields: title, description, type, or applicableProducts');
      }

      return communicationBackendApi.createOffer(offerData);
    },
    onSuccess: (data, variables) => {
      // Invalidate offers list
      queryClient.invalidateQueries({ queryKey: communicationQueryKeys.offers });
      
      toast.success('Offer created successfully');
    },
    onError: (error, variables) => {
      console.error('Error creating offer:', error);
      toast.error(`Failed to create offer: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch automation rules
 */
export const useAutomationRules = (params = {}) => {
  return useQuery({
    queryKey: communicationQueryKeys.automationList(params),
    queryFn: () => communicationBackendApi.getAutomationRules(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching automation rules:', error);
      toast.error('Failed to load automation rules');
    },
  });
};

/**
 * Hook to create automation rule
 */
export const useCreateAutomationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleData) => {
      console.log('Creating automation rule:', ruleData);
      
      if (!ruleData.name || !ruleData.type || !ruleData.trigger || !ruleData.action) {
        throw new Error('Missing required fields: name, type, trigger, or action');
      }

      return communicationBackendApi.createAutomationRule(ruleData);
    },
    onSuccess: (data, variables) => {
      // Invalidate automation rules list
      queryClient.invalidateQueries({ queryKey: communicationQueryKeys.automation });
      
      toast.success('Automation rule created successfully');
    },
    onError: (error, variables) => {
      console.error('Error creating automation rule:', error);
      toast.error(`Failed to create automation rule: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch communication statistics
 */
export const useCommunicationStats = (params = {}) => {
  return useQuery({
    queryKey: communicationQueryKeys.stats(),
    queryFn: () => communicationBackendApi.getStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching communication stats:', error);
      toast.error('Failed to load communication statistics');
    },
  });
};

/**
 * Hook to trigger birthday greetings
 */
export const useTriggerBirthdayGreetings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => communicationBackendApi.triggerBirthdayGreetings(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: communicationQueryKeys.lists() });
      toast.success(`Birthday greetings sent to ${data.count || 0} clients`);
    },
    onError: (error) => {
      console.error('Error triggering birthday greetings:', error);
      toast.error('Failed to trigger birthday greetings');
    },
  });
};

/**
 * Hook to trigger anniversary greetings
 */
export const useTriggerAnniversaryGreetings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => communicationBackendApi.triggerAnniversaryGreetings(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: communicationQueryKeys.lists() });
      toast.success(`Anniversary greetings sent to ${data.count || 0} clients`);
    },
    onError: (error) => {
      console.error('Error triggering anniversary greetings:', error);
      toast.error('Failed to trigger anniversary greetings');
    },
  });
};
