
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientEditForm from '../components/clients/ClientEditForm';
import { useClient } from '../hooks/useClients';
import { Button } from '@/components/ui/button';

/**
 * Client Edit page with backend integration
 * Uses React Query for data fetching
 */
const ClientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch client data using React Query
  const {
    data: client,
    isLoading,
    isError,
    error,
    refetch
  } = useClient(id);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Failed to load client: {error?.message || 'Unknown error'}
        </div>
        <div className="space-x-2">
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
          <Button onClick={() => navigate('/clients')}>
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  // Client not found
  if (!client) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">
          Client not found
        </div>
        <Button onClick={() => navigate('/clients')}>
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <ClientEditForm client={client} />
    </div>
  );
};

export default ClientEdit;
