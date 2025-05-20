
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ClientEditForm from '../components/clients/ClientEditForm';
import { toast } from 'sonner';

const ClientEdit = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dummy client data - in a real app, this would be fetched from API
  const sampleClients = [
    {
      id: 1,
      clientId: 'AMB-CLI-2025-0001',
      name: 'Rahul Sharma',
      type: 'Individual',
      contact: '+91 9876543210',
      email: 'rahul.sharma@example.com',
      location: 'Mumbai, Maharashtra',
      policies: 3,
      status: 'Active',
    },
    {
      id: 2,
      clientId: 'AMB-CLI-2025-0002',
      name: 'Tech Solutions Ltd',
      type: 'Corporate',
      contact: '+91 2234567890',
      email: 'info@techsolutions.com',
      location: 'Bangalore, Karnataka',
      policies: 8,
      status: 'Active',
    },
  ];

  // Fetch client data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const foundClient = sampleClients.find(c => c.id === parseInt(id));
      setClient(foundClient || {
        id: parseInt(id),
        name: `Client #${id}`,
        type: 'Individual',
        contact: '',
        email: '',
        location: '',
        policies: 0,
        status: 'Active',
      });
      setLoading(false);
    }, 500);
  }, [id]);

  // Handle save client (update)
  const handleSaveClient = (updatedClient) => {
    console.log('Saving client:', updatedClient);
    toast.success(`Client ${updatedClient.name} updated successfully`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <ClientEditForm client={client} onSave={handleSaveClient} />
    </div>
  );
};

export default ClientEdit;
