
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientsApi } from '../services/api/clientsApi';
import { validateClientData, getClientName } from '../schemas/clientSchemas';

/**
 * React Query hooks for client management
 * Provides optimistic updates and proper error handling
 */

// Query keys for cache management
export const clientsQueryKeys = {
  all: ['clients'],
  lists: () => [...clientsQueryKeys.all, 'list'],
  list: (params) => [...clientsQueryKeys.lists(), params],
  details: () => [...clientsQueryKeys.all, 'detail'],
  detail: (id) => [...clientsQueryKeys.details(), id],
  documents: (id) => [...clientsQueryKeys.all, 'documents', id],
};

/**
 * Hook to fetch clients with filtering and pagination
 */
export const useClients = (params = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.list(params),
    queryFn: () => clientsApi.getClients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true, // Keep previous data while fetching new data
    onError: (error) => {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    },
  });
};

/**
 * Hook to fetch a single client by ID
 */
export const useClient = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.detail(clientId),
    queryFn: () => clientsApi.getClientById(clientId),
    enabled: !!clientId, // Only run if clientId exists
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching client:', error);
      toast.error('Failed to load client details');
    },
  });
};

/**
 * Hook to create a new client
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientData) => {
      // Validate data before sending to API
      const validation = validateClientData(clientData);
      if (!validation.success) {
        throw new Error('Validation failed: ' + validation.errors.map(e => e.message).join(', '));
      }

      return clientsApi.createClient(validation.data);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      
      const clientName = getClientName(variables);
      toast.success(`Client "${clientName}" created successfully`);
    },
    onError: (error, variables) => {
      console.error('Error creating client:', error);
      const clientName = getClientName(variables);
      toast.error(`Failed to create client "${clientName}": ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing client
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, clientData }) => {
      // Validate data before sending to API
      const validation = validateClientData(clientData);
      if (!validation.success) {
        throw new Error('Validation failed: ' + validation.errors.map(e => e.message).join(', '));
      }

      return clientsApi.updateClient(id, validation.data);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Update specific client in cache
      queryClient.setQueryData(clientsQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      
      const clientName = getClientName(variables.clientData);
      toast.success(`Client "${clientName}" updated successfully`);
    },
    onError: (error, variables) => {
      console.error('Error updating client:', error);
      const clientName = getClientName(variables.clientData);
      toast.error(`Failed to update client "${clientName}": ${error.message}`);
    },
  });
};

/**
 * Hook to delete a client
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId) => clientsApi.deleteClient(clientId),
    onSuccess: (data, clientId) => {
      // Remove client from cache
      queryClient.removeQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      
      toast.success('Client deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting client:', error);
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });
};

/**
 * Hook to upload client documents
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, documentType, file }) => 
      clientsApi.uploadDocument(clientId, documentType, file),
    onSuccess: (data, variables) => {
      const { clientId, documentType } = variables;
      
      // Invalidate client documents cache
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.documents(clientId) });
      
      // Also invalidate client details to refresh document list
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      
      toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document uploaded successfully`);
    },
    onError: (error, variables) => {
      console.error('Error uploading document:', error);
      const { documentType } = variables;
      toast.error(`Failed to upload ${documentType} document: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch client documents
 */
export const useClientDocuments = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.documents(clientId),
    queryFn: () => clientsApi.getClientDocuments(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching client documents:', error);
      toast.error('Failed to load client documents');
    },
  });
};

/**
 * Hook to delete client document
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, documentId }) => 
      clientsApi.deleteDocument(clientId, documentId),
    onSuccess: (data, variables) => {
      const { clientId } = variables;
      
      // Invalidate client documents cache
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.documents(clientId) });
      
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
};
