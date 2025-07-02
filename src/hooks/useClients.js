
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientsApi } from '../services/api/clientsApi';
import { validateClientData, getClientName } from '../schemas/clientSchemas';

/**
 * React Query hooks for client management with MongoDB integration
 * All operations connect directly to the database
 */

// Query keys for cache management
export const clientsQueryKeys = {
  all: ['clients'],
  lists: () => [...clientsQueryKeys.all, 'list'],
  list: (params) => [...clientsQueryKeys.lists(), params],
  details: () => [...clientsQueryKeys.all, 'detail'],
  detail: (id) => [...clientsQueryKeys.details(), id],
  documents: (id) => [...clientsQueryKeys.all, 'documents', id],
  stats: () => [...clientsQueryKeys.all, 'stats'],
};

/**
 * Hook to fetch clients from MongoDB with filtering and pagination
 */
export const useClients = (params = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.list(params),
    queryFn: async () => {
      console.log('Fetching clients from MongoDB with params:', params);
      const result = await clientsApi.getClients(params);
      console.log('Clients fetched from MongoDB:', result);
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    onError: (error) => {
      console.error('Error fetching clients from MongoDB:', error);
      toast.error(`Failed to load clients: ${error.message}`);
    },
    onSuccess: (data) => {
      console.log('Successfully loaded clients from MongoDB:', data);
    }
  });
};

/**
 * Hook to fetch a single client from MongoDB by ID
 */
export const useClient = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.detail(clientId),
    queryFn: async () => {
      console.log('Fetching client from MongoDB:', clientId);
      const result = await clientsApi.getClientById(clientId);
      console.log('Client fetched from MongoDB:', result);
      return result;
    },
    enabled: !!clientId,
    staleTime: 30 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching client from MongoDB:', error);
      toast.error(`Failed to load client: ${error.message}`);
    },
  });
};

/**
 * Hook to create a new client in MongoDB
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientData) => {
      console.log('Creating client in MongoDB:', clientData);
      
      // Validate data before sending to database
      const validation = validateClientData(clientData);
      if (!validation.success) {
        const errorMessages = validation.errors.map(err => err.message || err.path?.join('.') || 'Validation error').join(', ');
        console.error('Client validation failed:', validation.errors);
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      const result = await clientsApi.createClient(validation.data);
      console.log('Client created in MongoDB:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('Client successfully created in MongoDB:', data);
      
      // Invalidate and refetch clients list to get fresh data from database
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      
      const clientName = getClientName(variables);
      toast.success(`Client "${clientName}" created successfully in database`);
    },
    onError: (error, variables) => {
      console.error('Error creating client in MongoDB:', error);
      const clientName = getClientName(variables);
      toast.error(`Failed to create client "${clientName}": ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing client in MongoDB
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, clientData }) => {
      console.log('Updating client in MongoDB:', { id, clientData });
      
      // Ensure clientType is set for validation
      if (!clientData.clientType && clientData.type) {
        clientData.clientType = clientData.type.toLowerCase();
      }
      
      // Validate data before sending to database
      const validation = validateClientData(clientData);
      if (!validation.success) {
        const errorMessages = validation.errors.map(err => err.message || err.path?.join('.') || 'Validation error').join(', ');
        console.error('Client validation failed:', validation.errors);
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      const result = await clientsApi.updateClient(id, validation.data);
      console.log('Client updated in MongoDB:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      console.log('Client successfully updated in MongoDB:', data);
      
      // Update specific client in cache
      queryClient.setQueryData(clientsQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them with database data
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      
      const clientName = getClientName(variables.clientData);
      toast.success(`Client "${clientName}" updated successfully in database`);
    },
    onError: (error, variables) => {
      console.error('Error updating client in MongoDB:', error);
      const clientName = getClientName(variables.clientData);
      toast.error(`Failed to update client "${clientName}": ${error.message}`);
    },
  });
};

/**
 * Hook to delete a client from MongoDB
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId) => {
      console.log('Deleting client from MongoDB:', clientId);
      const result = await clientsApi.deleteClient(clientId);
      console.log('Client deleted from MongoDB:', result);
      return result;
    },
    onSuccess: (data, clientId) => {
      console.log('Client successfully deleted from MongoDB:', clientId);
      
      // Remove client from cache
      queryClient.removeQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      
      // Invalidate lists to refresh them with database data
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      
      toast.success('Client deleted successfully from database');
    },
    onError: (error) => {
      console.error('Error deleting client from MongoDB:', error);
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });
};

/**
 * Hook to upload client documents to MongoDB
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, documentType, file }) => {
      console.log('Uploading document to MongoDB:', { clientId, documentType, fileName: file.name });
      const result = await clientsApi.uploadDocument(clientId, documentType, file);
      console.log('Document uploaded to MongoDB:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      const { clientId, documentType } = variables;
      console.log('Document successfully uploaded to MongoDB:', data);
      
      // Invalidate client documents cache to fetch fresh data from database
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.documents(clientId) });
      
      // Also invalidate client details to refresh document list
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      
      toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document uploaded successfully to database`);
    },
    onError: (error, variables) => {
      console.error('Error uploading document to MongoDB:', error);
      const { documentType } = variables;
      toast.error(`Failed to upload ${documentType} document: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch client documents from MongoDB
 */
export const useClientDocuments = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.documents(clientId),
    queryFn: async () => {
      console.log('Fetching client documents from MongoDB:', clientId);
      const result = await clientsApi.getClientDocuments(clientId);
      console.log('Client documents fetched from MongoDB:', result);
      return result;
    },
    enabled: !!clientId,
    staleTime: 30 * 1000,
    onError: (error) => {
      console.error('Error fetching client documents from MongoDB:', error);
      toast.error(`Failed to load client documents: ${error.message}`);
    },
  });
};

/**
 * Hook to delete client document from MongoDB
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, documentId }) => {
      console.log('Deleting document from MongoDB:', { clientId, documentId });
      const result = await clientsApi.deleteDocument(clientId, documentId);
      console.log('Document deleted from MongoDB:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      const { clientId } = variables;
      console.log('Document successfully deleted from MongoDB:', data);
      
      // Invalidate client documents cache to fetch fresh data from database
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.documents(clientId) });
      
      toast.success('Document deleted successfully from database');
    },
    onError: (error) => {
      console.error('Error deleting document from MongoDB:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
};

/**
 * Hook to get client statistics from MongoDB
 */
export const useClientStats = () => {
  return useQuery({
    queryKey: clientsQueryKeys.stats(),
    queryFn: async () => {
      console.log('Fetching client statistics from MongoDB');
      const result = await clientsApi.getClientStats();
      console.log('Client statistics fetched from MongoDB:', result);
      return result;
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
    onError: (error) => {
      console.error('Error fetching client statistics from MongoDB:', error);
      toast.error(`Failed to load client statistics: ${error.message}`);
    },
  });
};

/**
 * Hook for bulk client operations
 */
export const useBulkClientOperations = () => {
  const queryClient = useQueryClient();

  const bulkUpdate = useMutation({
    mutationFn: async ({ clientIds, updateData }) => {
      console.log('Bulk updating clients in MongoDB:', { clientIds, updateData });
      const result = await clientsApi.bulkUpdateClients(clientIds, updateData);
      console.log('Bulk update completed in MongoDB:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Bulk update successfully completed in MongoDB');
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
    },
    onError: (error) => {
      console.error('Error in bulk update in MongoDB:', error);
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (clientIds) => {
      console.log('Bulk deleting clients from MongoDB:', clientIds);
      const result = await clientsApi.bulkDeleteClients(clientIds);
      console.log('Bulk delete completed in MongoDB:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Bulk delete successfully completed in MongoDB');
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
    },
    onError: (error) => {
      console.error('Error in bulk delete in MongoDB:', error);
    },
  });

  const bulkAssign = useMutation({
    mutationFn: async ({ clientIds, agentId }) => {
      console.log('Bulk assigning clients in MongoDB:', { clientIds, agentId });
      const promises = clientIds.map(clientId => 
        clientsApi.assignClientToAgent(clientId, agentId)
      );
      const results = await Promise.all(promises);
      console.log('Bulk assign completed in MongoDB:', results);
      return results;
    },
    onSuccess: () => {
      console.log('Bulk assign successfully completed in MongoDB');
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      toast.success('Clients assigned successfully in database');
    },
    onError: (error) => {
      console.error('Error in bulk assign in MongoDB:', error);
      toast.error(`Failed to assign clients: ${error.message}`);
    },
  });

  return {
    bulkUpdate,
    bulkDelete,
    bulkAssign,
  };
};

/**
 * Hook for client export from MongoDB
 */
export const useClientExport = () => {
  return useMutation({
    mutationFn: async (exportData) => {
      console.log('Exporting clients from MongoDB:', exportData);
      const result = await clientsApi.exportClients(exportData);
      console.log('Client export completed from MongoDB:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Client export successfully completed from MongoDB');
      toast.success('Clients exported successfully from database');
    },
    onError: (error) => {
      console.error('Error exporting clients from MongoDB:', error);
      toast.error(`Failed to export clients: ${error.message}`);
    },
  });
};
