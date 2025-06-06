
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientsBackendApi } from '../services/api/clientsApiBackend';

/**
 * React Query hooks for client management with backend integration
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
    queryFn: () => clientsBackendApi.getClients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients: ' + error.message);
    },
  });
};

/**
 * Hook to fetch a single client by ID
 */
export const useClient = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.detail(clientId),
    queryFn: () => clientsBackendApi.getClientById(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching client:', error);
      toast.error('Failed to load client details: ' + error.message);
    },
  });
};

/**
 * Hook to create a new client
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientData) => {
      console.log('Creating client with data:', clientData);
      return clientsBackendApi.createClient(clientData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      console.log('Client created successfully:', data);
    },
    onError: (error, variables) => {
      console.error('Error creating client:', error);
      toast.error(`Failed to create client: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing client
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientData }) => {
      console.log('Updating client with data:', clientData);
      return clientsBackendApi.updateClient(id, clientData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Update specific client in cache
      queryClient.setQueryData(clientsQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      
      console.log('Client updated successfully:', data);
    },
    onError: (error, variables) => {
      console.error('Error updating client:', error);
      toast.error(`Failed to update client: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a client
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId) => clientsBackendApi.deleteClient(clientId),
    onSuccess: (data, clientId) => {
      // Remove client from cache
      queryClient.removeQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Error deleting client:', error);
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });
};
