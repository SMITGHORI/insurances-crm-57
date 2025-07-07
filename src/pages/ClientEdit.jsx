
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ClientForm from '../components/clients/ClientForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useClients, useUpdateClient } from '../hooks/useClients';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const ClientEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const isMobile = window.innerWidth <= 768;

  // React Query hooks
  const { data: client, isLoading: isClientLoading, error: clientError } = useClients({ id });
  const updateClientMutation = useUpdateClient();

  useEffect(() => {
    if (client?.data) {
      setClientData(client.data);
    }
    setLoading(false);
  }, [client]);

  const handleUpdateClient = async (updatedClientData) => {
    try {
      await updateClientMutation.mutateAsync({ id, ...updatedClientData });
      toast.success('Client updated successfully');
      navigate('/clients');
    } catch (error) {
      toast.error('Failed to update client');
    }
  };

  const handleGoBack = () => {
    navigate('/clients');
  };

  // Show professional loading skeleton
  if (loading || isClientLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  if (!clientData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            Failed to load client details.
          </div>
          <Button onClick={handleGoBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button onClick={handleGoBack} variant="ghost" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Clients
      </Button>
      <div className="rounded-lg shadow overflow-hidden">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Client</h3>
          <ClientForm
            client={clientData}
            onSubmit={handleUpdateClient}
            onCancel={handleGoBack}
            isLoading={updateClientMutation.isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientEdit;
