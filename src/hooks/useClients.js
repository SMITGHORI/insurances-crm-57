
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query keys for client-related queries
export const clientsQueryKeys = {
  all: ['clients'],
  lists: () => [...clientsQueryKeys.all, 'list'],
  list: (filters) => [...clientsQueryKeys.lists(), { filters }],
  details: () => [...clientsQueryKeys.all, 'detail'],
  detail: (id) => [...clientsQueryKeys.details(), id],
  search: (query) => [...clientsQueryKeys.all, 'search', query],
};

import clientsApi from '../services/api/clientsApi';

export const useClients = (params = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.list(params),
    queryFn: async () => {
      try {
        return await clientsApi.getClients(params);
      } catch (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// Hook for getting a single client
export const useClient = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.detail(clientId),
    queryFn: async () => {
      try {
        console.log('Fetching client details:', clientId);
        return await clientsApi.getClientById(clientId);
      } catch (error) {
        console.error('Error fetching client:', error);
        throw error;
      }
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for creating a client
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData) => {
      console.log('Creating client:', clientData);
      return await clientsApi.createClient(clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      toast.success('Client created successfully');
    },
    onError: (error) => {
      console.error('Error creating client:', error);
      toast.error(`Failed to create client: ${error.message}`);
    },
  });
};

// Hook for updating a client
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, clientData }) => {
      console.log('Updating client:', clientId, clientData);
      return await clientsApi.updateClient(clientId, clientData);
    },
    onSuccess: (data, variables) => {
      const { clientId } = variables;
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      toast.success('Client updated successfully');
    },
    onError: (error) => {
      console.error('Error updating client:', error);
      toast.error(`Failed to update client: ${error.message}`);
    },
  });
};

// Hook for deleting a client
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientId) => {
      console.log('Deleting client:', clientId);
      return await clientsApi.deleteClient(clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      toast.success('Client deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting client:', error);
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });
};

// Hook for bulk client operations
export const useBulkClientOperations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ operation, clientIds, data }) => {
      console.log('Bulk client operation:', operation, clientIds, data);
      return await clientsApi.bulkOperation({ operation, clientIds, data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      toast.success('Bulk operation completed successfully');
    },
    onError: (error) => {
      console.error('Error in bulk operation:', error);
      toast.error(`Bulk operation failed: ${error.message}`);
    },
  });
};

// Hook for client export
export const useClientExport = () => {
  return useMutation({
    mutationFn: async (exportParams) => {
      console.log('Exporting clients:', exportParams);
      return await clientsApi.exportClients(exportParams);
    },
    onSuccess: () => {
      toast.success('Clients exported successfully');
    },
    onError: (error) => {
      console.error('Error exporting clients:', error);
      toast.error(`Export failed: ${error.message}`);
    },
  });
};

// Hook for uploading documents
export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, documentType, file }) => {
      console.log('Uploading document:', clientId, documentType, file);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      return await clientsApi.makeRequest(`/${clientId}/documents`, {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      });
    },
    onSuccess: (data, variables) => {
      const { clientId } = variables;
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      console.error('Error uploading document:', error);
      toast.error(`Upload failed: ${error.message}`);
    },
  });
};
