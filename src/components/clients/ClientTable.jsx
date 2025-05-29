import React from 'react';
import { Eye, Edit, Trash, ArrowUpDown, User, Building, Group, Link } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableSkeleton, CardSkeleton } from '@/components/ui/professional-skeleton';

const ClientTable = ({ 
  clients = [], 
  onViewClient, 
  onEditClient, 
  onDeleteClient, 
  sortField, 
  sortDirection, 
  onSort,
  isMobile,
  isLoading,
  isEmpty,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isDeleting
}) => {
  const navigate = useNavigate();
  
  const getClientTypeIcon = (type) => {
    switch (type) {
      case 'Individual':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'Corporate':
        return <Building className="h-5 w-5 text-purple-500" />;
      case 'Group':
        return <Group className="h-5 w-5 text-green-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const viewClientPolicies = (e, clientId) => {
    e.stopPropagation();
    
    // Get policies for this client
    const storedPoliciesData = localStorage.getItem('policiesData');
    if (!storedPoliciesData) {
      return;
    }
    
    const policies = JSON.parse(storedPoliciesData);
    const clientPolicies = policies.filter(policy => policy.client.id === clientId);
    
    // If client has exactly one policy, go directly to it
    if (clientPolicies.length === 1) {
      navigate(`/policies/${clientPolicies[0].id}`);
    } 
    // If multiple policies, go to policies view with filter
    else if (clientPolicies.length > 1) {
      navigate('/policies', { state: { clientFilter: clientId } });
    } else {
      alert('No policies found for this client');
    }
  };

  const getSortIcon = (field) => {
    return sortField === field ? (
      sortDirection === 'asc' ? '↑' : '↓'
    ) : '';
  };

  // Loading state with professional skeleton
  if (isLoading) {
    return isMobile ? (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    ) : (
      <TableSkeleton />
    );
  }

  // Empty state
  if (isEmpty || !clients || clients.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No clients found. Try adjusting your filters or create a new client.</p>
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        {clients.map((client) => (
          <div 
            key={client._id || client.id} 
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {getClientTypeIcon(client.type)}
                </div>
                <div>
                  <div className="font-medium">{client.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{client.clientId || "-"}</div>
                </div>
              </div>
              <Badge className={`${
                client.status === 'Active' ? 'bg-green-100 text-green-800' : 
                client.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {client.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 divide-y divide-gray-100 text-sm">
              <div className="py-2">
                <div className="text-xs text-gray-500">Contact</div>
                <div>{client.contact || client.phone}</div>
                <div className="text-xs text-blue-500">{client.email}</div>
              </div>
              <div className="py-2">
                <div className="text-xs text-gray-500">Location</div>
                <div>{client.location || `${client.city || ''}, ${client.state || ''}`.trim()}</div>
              </div>
              <div className="py-2 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Policies</div>
                  {(client.policies || 0) > 0 ? (
                    <button 
                      onClick={(e) => viewClientPolicies(e, client._id || client.id)}
                      className="inline-flex items-center px-2 py-1 text-xs leading-5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      <Link className="h-3 w-3 mr-1" />
                      {client.policies} policies
                    </button>
                  ) : (
                    <span className="text-gray-600">0</span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    onClick={() => onViewClient(client._id || client.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onEditClient(client._id || client.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-yellow-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onDeleteClient(client._id || client.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600"
                    disabled={isDeleting}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Simple Mobile Pagination */}
        <div className="flex justify-between items-center py-4 bg-white px-4">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">
              <div 
                className="flex items-center space-x-1 cursor-pointer" 
                onClick={() => onSort('clientId')}
              >
                <span>Client ID</span>
                <ArrowUpDown className="h-4 w-4" />
                <span>{getSortIcon('clientId')}</span>
              </div>
            </TableHead>
            <TableHead>
              <div 
                className="flex items-center space-x-1 cursor-pointer"
                onClick={() => onSort('name')}
              >
                <span>Client</span>
                <ArrowUpDown className="h-4 w-4" />
                <span>{getSortIcon('name')}</span>
              </div>
            </TableHead>
            <TableHead>
              <div 
                className="flex items-center space-x-1 cursor-pointer"
                onClick={() => onSort('type')}
              >
                <span>Type</span>
                <ArrowUpDown className="h-4 w-4" />
                <span>{getSortIcon('type')}</span>
              </div>
            </TableHead>
            <TableHead>
              <div 
                className="flex items-center space-x-1 cursor-pointer"
                onClick={() => onSort('contact')}
              >
                <span>Contact</span>
                <ArrowUpDown className="h-4 w-4" />
                <span>{getSortIcon('contact')}</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div 
                className="flex items-center space-x-1 justify-center cursor-pointer"
                onClick={() => onSort('policies')}
              >
                <span>Policies</span>
                <ArrowUpDown className="h-4 w-4" />
                <span>{getSortIcon('policies')}</span>
              </div>
            </TableHead>
            <TableHead>
              <div 
                className="flex items-center space-x-1 cursor-pointer"
                onClick={() => onSort('status')}
              >
                <span>Status</span>
                <ArrowUpDown className="h-4 w-4" />
                <span>{getSortIcon('status')}</span>
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow 
              key={client._id || client.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onViewClient(client._id || client.id)}
            >
              <TableCell className="font-mono text-sm text-gray-500">
                {client.clientId || "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getClientTypeIcon(client.type)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${client.type === 'Individual' ? 'bg-blue-100 text-blue-800' : 
                    client.type === 'Corporate' ? 'bg-purple-100 text-purple-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {client.type}
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {client.contact || client.phone}
                <div className="text-xs text-gray-400">{client.location || `${client.city || ''}, ${client.state || ''}`.trim()}</div>
              </TableCell>
              <TableCell className="text-center">
                {(client.policies || 0) > 0 ? (
                  <button 
                    onClick={(e) => viewClientPolicies(e, client._id || client.id)}
                    className="inline-flex items-center px-2 py-1 text-xs leading-5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    <Link className="h-3 w-3 mr-1" />
                    {client.policies} policies
                  </button>
                ) : (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 rounded-full bg-gray-100 text-gray-800">
                    0
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    client.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}>
                  {client.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onViewClient(client._id || client.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View client details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEditClient(client._id || client.id)}
                    className="text-yellow-600 hover:text-yellow-900"
                    title="Edit client"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDeleteClient(client._id || client.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete client"
                    disabled={isDeleting}
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="rounded-l-md"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-amba-blue text-white"
              >
                {currentPage}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="rounded-r-md"
              >
                Next
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTable;
