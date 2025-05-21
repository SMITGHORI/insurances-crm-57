
import React, { useState } from 'react';
import { Search, Filter, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AgentClients = ({ agentId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Sample data - in a real app, this would be fetched from an API based on agentId
  const clients = [
    {
      id: 'AMB-CLI-2025-0001',
      name: 'Vivek Patel',
      type: 'Individual',
      phone: '+91 98765 43210',
      email: 'vivek.patel@example.com',
      activePolicies: 2,
      totalPremium: '₹45,000',
      lastInteraction: '12 May 2025',
      status: 'active'
    },
    {
      id: 'AMB-CLI-2025-0012',
      name: 'Priya Desai',
      type: 'Individual',
      phone: '+91 87654 32109',
      email: 'priya.desai@example.com',
      activePolicies: 1,
      totalPremium: '₹28,500',
      lastInteraction: '05 May 2025',
      status: 'active'
    },
    {
      id: 'AMB-CLI-2025-0024',
      name: 'Tech Solutions Ltd',
      type: 'Corporate',
      phone: '+91 76543 21098',
      email: 'info@techsolutions.com',
      activePolicies: 5,
      totalPremium: '₹1,75,000',
      lastInteraction: '22 Apr 2025',
      status: 'active'
    },
    {
      id: 'AMB-CLI-2025-0035',
      name: 'Arjun Singh',
      type: 'Individual',
      phone: '+91 65432 10987',
      email: 'arjun.singh@example.com',
      activePolicies: 3,
      totalPremium: '₹62,000',
      lastInteraction: '15 Apr 2025',
      status: 'pending'
    },
    {
      id: 'AMB-CLI-2025-0048',
      name: 'Global Traders Inc',
      type: 'Corporate',
      phone: '+91 54321 09876',
      email: 'contact@globaltraders.com',
      activePolicies: 4,
      totalPremium: '₹1,20,000',
      lastInteraction: '08 Apr 2025',
      status: 'active'
    },
    {
      id: 'AMB-CLI-2025-0057',
      name: 'Meera Joshi',
      type: 'Individual',
      phone: '+91 43210 98765',
      email: 'meera.joshi@example.com',
      activePolicies: 1,
      totalPremium: '₹15,000',
      lastInteraction: '02 Apr 2025',
      status: 'inactive'
    },
  ];

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         client.id.includes(searchTerm);
    
    const matchesCategory = filterCategory === 'all' || client.type === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex">
          <Button className="bg-amba-blue hover:bg-blue-800 text-white">
            <UserPlus size={16} className="mr-2" />
            Assign New Client
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full md:w-[250px]"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center">
            <Filter size={16} className="mr-1 text-gray-500" />
            <Select
              value={filterCategory}
              onValueChange={setFilterCategory}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Client Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="amba-table">
            <thead>
              <tr>
                <th className="py-3 px-4 font-medium">Client ID</th>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Contact</th>
                <th className="py-3 px-4 font-medium">Active Policies</th>
                <th className="py-3 px-4 font-medium">Total Premium</th>
                <th className="py-3 px-4 font-medium">Last Interaction</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    No clients found matching your search criteria
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50 cursor-pointer">
                    <td className="py-3 px-4 text-gray-500">{client.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{client.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{client.type}</td>
                    <td className="py-3 px-4">
                      <div className="text-gray-500">{client.phone}</div>
                      <div className="text-gray-500 text-sm">{client.email}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{client.activePolicies}</td>
                    <td className="py-3 px-4 text-gray-500">{client.totalPremium}</td>
                    <td className="py-3 px-4 text-gray-500">{client.lastInteraction}</td>
                    <td className="py-3 px-4">{getStatusBadge(client.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentClients;
