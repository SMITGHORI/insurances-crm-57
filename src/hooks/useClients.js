
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
    queryKey: clientsQueryKeys.list(params),
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

// Hook for getting a single client
export const useClient = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.detail(clientId),
    queryFn: async () => {
      try {
        console.log('Fetching client details:', clientId);
        // Mock single client data
        return {
          success: true,
          data: {
            _id: clientId,
            displayName: 'John Doe',
            email: 'john@example.com',
            phone: '+91-9876543210',
            assignedAgentId: 'agent-fallback-id'
          }
        };
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
      // Mock create response
      return {
        success: true,
        data: {
          _id: 'new-client-id',
          ...clientData
        }
      };
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
      // Mock update response
      return {
        success: true,
        data: {
          _id: clientId,
          ...clientData
        }
      };
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
      // Mock delete response
      return { success: true };
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
      // Mock bulk operation response
      return { success: true, affected: clientIds.length };
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
      // Mock export response
      return {
        success: true,
        data: [],
        message: 'Export completed successfully'
      };
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
      // Mock upload response
      return {
        success: true,
        data: {
          documentId: 'new-doc-id',
          documentType,
          fileName: file.name
        }
      };
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
