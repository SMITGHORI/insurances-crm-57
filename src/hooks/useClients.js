
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsBackendApi } from '../services/api/clientsApiBackend';
import { toast } from 'sonner';

// Query keys for clients
export const clientsQueryKeys = {
  all: ['clients'],
  lists: () => [...clientsQueryKeys.all, 'list'],
  list: (filters) => [...clientsQueryKeys.lists(), { filters }],
  details: () => [...clientsQueryKeys.all, 'detail'],
  detail: (id) => [...clientsQueryKeys.details(), id],
  documents: (id) => [...clientsQueryKeys.all, 'documents', id],
  stats: () => [...clientsQueryKeys.all, 'stats'],
};

// Get all clients with filters
export const useClients = (params = {}) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => clientsBackendApi.getClients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single client by ID
export const useClient = (id) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsBackendApi.getClientById(id),
    enabled: !!id,
  });
};

// Create client mutation
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientsBackendApi.createClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created successfully');
    },
    onError: (error) => {
      console.error('Create client error:', error);
      toast.error(error.message || 'Failed to create client');
    }
  });
};

// Update client mutation
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...clientData }) => clientsBackendApi.updateClient(id, clientData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      toast.success('Client updated successfully');
    },
    onError: (error) => {
      console.error('Update client error:', error);
      toast.error(error.message || 'Failed to update client');
    }
  });
};

// Delete client mutation
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientsBackendApi.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted successfully');
    },
    onError: (error) => {
      console.error('Delete client error:', error);
      toast.error(error.message || 'Failed to delete client');
    }
  });
};

// Bulk client operations
export const useBulkClientOperations = () => {
  const queryClient = useQueryClient();

  const bulkAssign = useMutation({
    mutationFn: ({ clientIds, agentId }) => clientsBackendApi.bulkAssignToAgent(clientIds, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Clients assigned successfully');
    },
    onError: (error) => {
      console.error('Bulk assign error:', error);
      toast.error(error.message || 'Failed to assign clients');
    }
  });

  const bulkUpdate = useMutation({
    mutationFn: ({ clientIds, updateData }) => clientsBackendApi.bulkUpdateClients(clientIds, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Clients updated successfully');
    },
    onError: (error) => {
      console.error('Bulk update error:', error);
      toast.error(error.message || 'Failed to update clients');
    }
  });

  const bulkDelete = useMutation({
    mutationFn: (clientIds) => clientsBackendApi.bulkDeleteClients(clientIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Clients deleted successfully');
    },
    onError: (error) => {
      console.error('Bulk delete error:', error);
      toast.error(error.message || 'Failed to delete clients');
    }
  });

  return { bulkAssign, bulkUpdate, bulkDelete };
};

// Export clients
export const useClientExport = () => {
  return useMutation({
    mutationFn: (exportData) => clientsBackendApi.exportClients(exportData),
    onSuccess: () => {
      toast.success('Clients exported successfully');
    },
    onError: (error) => {
      console.error('Export clients error:', error);
      toast.error(error.message || 'Failed to export clients');
    }
  });
};

// Search clients
export const useSearchClients = () => {
  return useMutation({
    mutationFn: ({ query, limit }) => clientsBackendApi.searchClients(query, limit),
  });
};

// Upload document mutation
export const useUploadClientDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clientId, documentType, file }) => 
      clientsBackendApi.uploadDocument(clientId, documentType, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['clientDocuments', variables.clientId] });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload document error:', error);
      toast.error(error.message || 'Failed to upload document');
    }
  });
};

// Get client documents
export const useClientDocuments = (clientId) => {
  return useQuery({
    queryKey: ['clientDocuments', clientId],
    queryFn: () => clientsBackendApi.getClientDocuments(clientId),
    enabled: !!clientId,
  });
};

// Delete document mutation
export const useDeleteClientDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clientId, documentId }) => 
      clientsBackendApi.deleteDocument(clientId, documentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['clientDocuments', variables.clientId] });
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      console.error('Delete document error:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  });
};

// Get client statistics
export const useClientStats = () => {
  return useQuery({
    queryKey: ['clientStats'],
    queryFn: clientsBackendApi.getClientStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Export clients
export const useExportClients = () => {
  return useMutation({
    mutationFn: clientsBackendApi.exportClients,
    onSuccess: () => {
      toast.success('Clients exported successfully');
    },
    onError: (error) => {
      console.error('Export clients error:', error);
      toast.error(error.message || 'Failed to export clients');
    }
  });
};
