
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Calendar, DollarSign, Shield, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency, formatDate } from '@/lib/utils';

const PolicyTable = ({
  policies = [],
  currentPage,
  totalPages,
  onPageChange,
  onSort,
  onDelete,
  selectedPolicies = [],
  onSelectionChange,
  sortField,
  sortDirection,
  isLoading
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  console.log('PolicyTable received policies from MongoDB:', policies);

  const getStatusBadge = (status) => {
    const statusColors = {
      'Active': 'bg-green-100 text-green-800 border-green-200',
      'Proposal': 'bg-blue-100 text-blue-800 border-blue-200',
      'Lapsed': 'bg-red-100 text-red-800 border-red-200',
      'Expired': 'bg-gray-100 text-gray-800 border-gray-200',
      'Cancelled': 'bg-orange-100 text-orange-800 border-orange-200',
      'Matured': 'bg-purple-100 text-purple-800 border-purple-200',
      'Suspended': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    return (
      <Badge className={`${statusColors[status] || statusColors.Active} border`}>
        {status}
      </Badge>
    );
  };

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(policies.map(policy => policy._id || policy.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectPolicy = (policyId, checked) => {
    if (checked) {
      onSelectionChange([...selectedPolicies, policyId]);
    } else {
      onSelectionChange(selectedPolicies.filter(id => id !== policyId));
    }
  };

  const isAllSelected = policies.length > 0 && selectedPolicies.length === policies.length;
  const isIndeterminate = selectedPolicies.length > 0 && selectedPolicies.length < policies.length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
          <p className="text-gray-500 mb-4">No policies match your current filters</p>
          <Button onClick={() => navigate('/policies/new')}>
            Create First Policy
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {policies.map((policy) => (
          <Card key={policy._id || policy.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedPolicies.includes(policy._id || policy.id)}
                    onCheckedChange={(checked) => handleSelectPolicy(policy._id || policy.id, checked)}
                  />
                  <div>
                    <h4 className="font-medium">{policy.policyNumber || `POL-${policy._id?.slice(-6)}`}</h4>
                    <p className="text-sm text-gray-500">{policy.clientId?.displayName || policy.client?.name || 'Unknown Client'}</p>
                  </div>
                </div>
                {getStatusBadge(policy.status)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="capitalize">{policy.type || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Premium:</span>
                  <span className="font-medium">{formatCurrency(policy.premium || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Sum Assured:</span>
                  <span>{formatCurrency(policy.sumAssured || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Expires:</span>
                  <span>{formatDate(policy.endDate)}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/policies/${policy._id || policy.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/policies/${policy._id || policy.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(policy._id || policy.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('policyNumber')}
              >
                Policy Number
                {sortField === 'policyNumber' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Client</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('type')}
              >
                Type
                {sortField === 'type' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('premium')}
              >
                Premium
                {sortField === 'premium' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Sum Assured</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('status')}
              >
                Status
                {sortField === 'status' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('endDate')}
              >
                Expires
                {sortField === 'endDate' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy._id || policy.id} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedPolicies.includes(policy._id || policy.id)}
                    onCheckedChange={(checked) => handleSelectPolicy(policy._id || policy.id, checked)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {policy.policyNumber || `POL-${policy._id?.slice(-6)}`}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {policy.clientId?.displayName || policy.client?.name || 'Unknown Client'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {policy.clientId?.email || policy.client?.email || ''}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{policy.type || 'Unknown'}</span>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(policy.premium || 0)}
                </TableCell>
                <TableCell>
                  {formatCurrency(policy.sumAssured || 0)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(policy.status)}
                </TableCell>
                <TableCell>
                  {formatDate(policy.endDate)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/policies/${policy._id || policy.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/policies/${policy._id || policy.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(policy._id || policy.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = currentPage - 2 + i;
              if (page < 1 || page > totalPages) return null;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyTable;
