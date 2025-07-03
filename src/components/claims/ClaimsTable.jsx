
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye, 
  Edit, 
  Calendar,
  MapPin,
  Phone,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency, formatDate } from '../../lib/utils';

const ClaimsTable = ({
  claims = [],
  pagination = {},
  isLoading,
  filterParams,
  setFilterParams,
  selectedClaims = [],
  onClaimSelection
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getStatusBadge = (status) => {
    const statusColors = {
      'Reported': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'Pending': 'bg-orange-100 text-orange-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Settled': 'bg-purple-100 text-purple-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Urgent': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={priorityColors[priority] || 'bg-gray-100 text-gray-800'}>
        {priority}
      </Badge>
    );
  };

  const handleClaimSelect = (claimId, checked) => {
    onClaimSelection?.(claimId, checked);
  };

  const handleViewClaim = (claimId) => {
    navigate(`/claims/${claimId}`);
  };

  const handleEditClaim = (claimId) => {
    navigate(`/claims/${claimId}/edit`);
  };

  const handlePageChange = (newPage) => {
    setFilterParams(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!claims.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Found</h3>
          <p className="text-gray-600">No claims match your current search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {claims.map((claim) => (
          <Card key={claim._id || claim.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedClaims.includes(claim._id || claim.id)}
                  onCheckedChange={(checked) => 
                    handleClaimSelect(claim._id || claim.id, checked)
                  }
                />
                <h3 className="font-semibold text-sm">
                  {claim.claimNumber}
                </h3>
              </div>
              <div className="flex space-x-1">
                {getStatusBadge(claim.status)}
                {getPriorityBadge(claim.priority)}
              </div>
            </div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(claim.incidentDate)}
              </div>
              {claim.contactDetails?.primaryContact && (
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {claim.contactDetails.primaryContact}
                </div>
              )}
              <div className="flex items-center">
                <span className="font-medium">Amount: </span>
                {formatCurrency(claim.claimAmount)}
              </div>
              {claim.approvedAmount && (
                <div className="flex items-center">
                  <span className="font-medium">Approved: </span>
                  {formatCurrency(claim.approvedAmount)}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleViewClaim(claim._id || claim.id)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditClaim(claim._id || claim.id)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          </Card>
        ))}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Previous
            </Button>
            <span className="px-3 py-2 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Claim #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Incident Date</TableHead>
              <TableHead>Claim Amount</TableHead>
              <TableHead>Approved Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim._id || claim.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedClaims.includes(claim._id || claim.id)}
                    onCheckedChange={(checked) => 
                      handleClaimSelect(claim._id || claim.id, checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {claim.claimNumber}
                </TableCell>
                <TableCell>
                  {claim.clientId?.firstName && claim.clientId?.lastName 
                    ? `${claim.clientId.firstName} ${claim.clientId.lastName}`
                    : 'Unknown Client'
                  }
                </TableCell>
                <TableCell>{claim.claimType}</TableCell>
                <TableCell>{getStatusBadge(claim.status)}</TableCell>
                <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                <TableCell>{formatDate(claim.incidentDate)}</TableCell>
                <TableCell>{formatCurrency(claim.claimAmount)}</TableCell>
                <TableCell>
                  {claim.approvedAmount ? formatCurrency(claim.approvedAmount) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewClaim(claim._id || claim.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClaim(claim._id || claim.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimsTable;
