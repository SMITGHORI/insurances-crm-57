
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientDetails from '@/components/clients/ClientDetails';
import { useClient } from '@/hooks/useClients';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading, error } = useClient(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Not Found</h2>
          <p className="text-gray-600 mb-4">The requested client could not be found.</p>
          <Button onClick={() => navigate('/clients')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/clients')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {client.name || `${client.firstName} ${client.lastName}` || 'Client Details'}
        </h1>
        <p className="text-gray-600">Complete client information and management</p>
      </div>

      <ClientDetails 
        client={client} 
        showFullDetails={true}
        onEditClient={(id) => navigate(`/clients/${id}/edit`)}
        onDeleteClient={(id) => {
          // Handle delete and navigate back
          navigate('/clients');
        }}
      />
    </div>
  );
};

export default ClientDetail;
