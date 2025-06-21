
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientsApi } from '../services/api/clientsApi';

/**
 * Hook for client statistics
 */
export const useClientStats = () => {
  return useQuery({
    queryKey: ['clientStats'],
    queryFn: () => clientsApi.getClientStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching client stats:', error);
    },
  });
};

/**
 * Hook for enhanced client search
 */
export const useClientSearch = (searchTerm, enabled = true) => {
  return useQuery({
    queryKey: ['clientSearch', searchTerm],
    queryFn: () => clientsApi.searchClients(searchTerm),
    enabled: enabled && searchTerm && searchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
};

/**
 * Hook for client activities
 */
export const useClientActivities = (clientId) => {
  return useQuery({
    queryKey: ['clientActivities', clientId],
    queryFn: () => clientsApi.getClientActivities(clientId),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for bulk client operations
 */
export const useBulkClientOperations = () => {
  const queryClient = useQueryClient();

  const bulkAssignMutation = useMutation({
    mutationFn: ({ clientIds, agentId }) => clientsApi.bulkAssignClients(clientIds, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Clients assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign clients: ${error.message}`);
    },
  });

  const bulkStatusUpdateMutation = useMutation({
    mutationFn: ({ clientIds, status }) => clientsApi.bulkUpdateStatus(clientIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (clientIds) => clientsApi.bulkDeleteClients(clientIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Clients deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete clients: ${error.message}`);
    },
  });

  return {
    bulkAssign: bulkAssignMutation.mutateAsync,
    bulkStatusUpdate: bulkStatusUpdateMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    isLoading: bulkAssignMutation.isLoading || bulkStatusUpdateMutation.isLoading || bulkDeleteMutation.isLoading,
  };
};

/**
 * Hook for client export
 */
export const useClientExport = () => {
  return useMutation({
    mutationFn: (exportData) => clientsApi.exportClients(exportData),
    onSuccess: (data) => {
      // Handle download
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export completed successfully');
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });
};
