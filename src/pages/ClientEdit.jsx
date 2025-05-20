
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientEditForm from '../components/clients/ClientEditForm';
import { toast } from 'sonner';

const ClientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the clients data from localStorage or use the sample data
  useEffect(() => {
    setLoading(true);
    
    // Try to get clients from localStorage
    const storedClientsData = localStorage.getItem('clientsData');
    let clientsList = [];
    
    if (storedClientsData) {
      clientsList = JSON.parse(storedClientsData);
    } else {
      // Sample clients data as fallback
      clientsList = [
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
    }
    
    // Find the client by id
    const foundClient = clientsList.find(c => c.id === parseInt(id));
    
    if (foundClient) {
      setClient(foundClient);
    } else {
      toast.error(`Client with ID ${id} not found`);
      // Create a placeholder client if not found
      setClient({
        id: parseInt(id),
        name: `Client #${id}`,
        type: 'Individual',
        contact: '',
        email: '',
        location: '',
        policies: 0,
        status: 'Active',
      });
    }
    
    setLoading(false);
  }, [id]);

  // Handle save client (update)
  const handleSaveClient = (updatedClient) => {
    // Get current clients from localStorage
    const storedClientsData = localStorage.getItem('clientsData');
    let clientsList = [];
    
    if (storedClientsData) {
      clientsList = JSON.parse(storedClientsData);
    }
    
    // Find the index of the client to update
    const clientIndex = clientsList.findIndex(c => c.id === updatedClient.id);
    
    if (clientIndex !== -1) {
      // Update the client in the array
      clientsList[clientIndex] = { ...clientsList[clientIndex], ...updatedClient };
    } else {
      // If client doesn't exist, add it
      clientsList.push(updatedClient);
    }
    
    // Save updated clients list back to localStorage
    localStorage.setItem('clientsData', JSON.stringify(clientsList));
    
    toast.success(`Client ${updatedClient.name} updated successfully`);
    navigate('/clients');
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
