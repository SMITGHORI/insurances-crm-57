
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { User, Calendar, Phone, Mail, FileText } from 'lucide-react';

const AgentClientsTable = ({ clients, agentId }) => {
  const navigate = useNavigate();
  
  // In a real application, you would filter clients by agent ID
  // But for now, we'll just show the clients that were passed in
  
  const handleViewClient = (id) => {
    navigate(`/clients/${id}`);
  };
  
  return (
    <div>
      {clients.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No clients assigned to this agent yet.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Policies</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {client.name}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`amba-badge ${
                    client.type === 'Individual' ? 'amba-badge-blue' : 
                    client.type === 'Corporate' ? 'amba-badge-purple' :
                    'amba-badge-green'
                  }`}>
                    {client.type}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    {client.contact}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    {client.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    {client.policies || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`amba-badge ${
                    client.status === 'Active' ? 'amba-badge-green' : 'amba-badge-red'
                  }`}>
                    {client.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleViewClient(client.id)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AgentClientsTable;
