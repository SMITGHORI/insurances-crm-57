
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { followUpsApi } from '../services/api/followUpsApi';

// Query keys for cache management
export const followUpsQueryKeys = {
  all: ['followUps'],
  lists: () => [...followUpsQueryKeys.all, 'list'],
  list: (params) => [...followUpsQueryKeys.lists(), params],
  details: () => [...followUpsQueryKeys.all, 'detail'],
  detail: (id) => [...followUpsQueryKeys.details(), id],
  today: () => [...followUpsQueryKeys.all, 'today'],
  overdue: () => [...followUpsQueryKeys.all, 'overdue'],
  stats: (params) => [...followUpsQueryKeys.all, 'stats', params],
};

export const useFollowUps = (params = {}) => {
  return useQuery({
    queryKey: followUpsQueryKeys.list(params),
    queryFn: () => followUpsApi.getFollowUps(params),
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching follow-ups:', error);
      toast.error('Failed to load follow-ups');
    },
  });
};

export const useFollowUp = (followUpId) => {
  return useQuery({
    queryKey: followUpsQueryKeys.detail(followUpId),
    queryFn: () => followUpsApi.getFollowUpById(followUpId),
    enabled: !!followUpId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching follow-up:', error);
      toast.error('Failed to load follow-up details');
    },
  });
};

export const useTodaysFollowUps = () => {
  return useQuery({
    queryKey: followUpsQueryKeys.today(),
    queryFn: () => followUpsApi.getTodaysFollowUps(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching today\'s follow-ups:', error);
      toast.error('Failed to load today\'s follow-ups');
    },
  });
};

export const useOverdueFollowUps = () => {
  return useQuery({
    queryKey: followUpsQueryKeys.overdue(),
    queryFn: () => followUpsApi.getOverdueFollowUps(),
    staleTime: 2 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching overdue follow-ups:', error);
      toast.error('Failed to load overdue follow-ups');
    },
  });
};

export const useCreateFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followUpData) => {
      console.log('Creating follow-up with data:', followUpData);
      
      if (!followUpData.clientId || !followUpData.title || !followUpData.scheduledDate) {
        throw new Error('Missing required fields: client, title, or scheduled date');
      }

      return followUpsApi.createFollowUp(followUpData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.today() });
      
      toast.success('Follow-up scheduled successfully');
    },
    onError: (error) => {
      console.error('Error creating follow-up:', error);
      toast.error(`Failed to schedule follow-up: ${error.message}`);
    },
  });
};

export const useUpdateFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, followUpData }) => {
      console.log('Updating follow-up with data:', followUpData);
      return followUpsApi.updateFollowUp(id, followUpData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      queryClient.setQueryData(followUpsQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.today() });
      queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.overdue() });
      
      toast.success('Follow-up updated successfully');
    },
    onError: (error) => {
      console.error('Error updating follow-up:', error);
      toast.error(`Failed to update follow-up: ${error.message}`);
    },
  });
};

export const useCompleteFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completionData }) => {
      console.log('Completing follow-up with data:', completionData);
      return followUpsApi.completeFollowUp(id, completionData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      queryClient.setQueryData(followUpsQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.today() });
      queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.overdue() });
      
      toast.success('Follow-up completed successfully');
    },
    onError: (error) => {
      console.error('Error completing follow-up:', error);
      toast.error(`Failed to complete follow-up: ${error.message}`);
    },
  });
};

export const useFollowUpStats = (params = {}) => {
  return useQuery({
    queryKey: followUpsQueryKeys.stats(params),
    queryFn: () => followUpsApi.getFollowUpStats(params),
    staleTime: 10 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching follow-up stats:', error);
      toast.error('Failed to load follow-up statistics');
    },
  });
};
