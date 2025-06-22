import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Edit, Trash2, FileText, Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ClaimsMobileView from './ClaimsMobileView';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useClaims, useDeleteClaim } from '@/hooks/useClaims';
import { toast } from 'sonner';
import { TableSkeleton, CardSkeleton } from '@/components/ui/professional-skeleton';

const ClaimsTable = ({
  filterParams,
  setFilterParams,
  sortField,
  sortDirection,
  handleExport,
  updateActiveFilters,
  selectedClaims = [],
  onClaimSelection
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Use the new React Query hook
  const {
    data: claimsResponse,
    isLoading,
    error,
    refetch
  } = useClaims({
    ...filterParams,
    sortField,
    sortDirection,
    page: currentPage,
    limit: itemsPerPage
  });
  
  const deleteClaimMutation = useDeleteClaim();

  // Handle loading state with professional skeleton
  if (isLoading) {
    return isMobile ? <CardSkeleton /> : <TableSkeleton />;
  }

  // Handle error state
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load claims: {error.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const claims = claimsResponse?.data || [];
  const totalItems = claimsResponse?.total || 0;
  const totalPages = claimsResponse?.totalPages || 1;

  // Get appropriate status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'review':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'settled':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Settled</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case 'withdrawn':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Withdrawn</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  const handleView = (claimId) => {
    navigate(`/claims/${claimId}`);
  };

  const handleEdit = (claimId) => {
    navigate(`/claims/${claimId}/edit`);
  };

  const handleDelete = async (claimId) => {
    try {
      await deleteClaimMutation.mutateAsync(claimId);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleStatusFilterChange = (status) => {
    setFilterParams({
      ...filterParams,
      status
    });
    updateActiveFilters('Status', status === 'all' ? null : status);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSelectAll = () => {
    if (selectedClaims.length === claims.length) {
      claims.forEach(claim => onClaimSelection(claim._id, false));
    } else {
      claims.forEach(claim => {
        if (!selectedClaims.includes(claim._id)) {
          onClaimSelection(claim._id, true);
        }
      });
    }
  };

  const handleSelectClaim = (claimId) => {
    const isSelected = selectedClaims.includes(claimId);
    onClaimSelection(claimId, !isSelected);
  };

  // Render mobile view
  if (isMobile) {
    return (
      <ClaimsMobileView 
        claims={claims} 
        filterParams={filterParams} 
        handleExport={() => handleExport(claims)} 
      />
    );
  }

  // Desktop view
  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedClaims.length === claims.length && claims.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client & Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr 
                    key={claim._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleView(claim._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedClaims.includes(claim._id)}
                        onChange={() => handleSelectClaim(claim._id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-blue-700">
                          {claim.claimNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {claim.insuranceCompanyClaimId || 'Not Generated'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Filed: {claim.dateOfFiling}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {claim.clientName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Member: {claim.memberName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{claim.policyNumber}</div>
                        <div className="text-xs text-gray-500">{claim.policyType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(claim.claimAmount)}
                        </div>
                        {claim.approvedAmount !== null && (
                          <div className={`text-xs ${claim.approvedAmount === 0 ? 'text-red-500' : 'text-green-600'}`}>
                            Approved: {formatCurrency(claim.approvedAmount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusFilterChange(claim.status);
                        }} 
                        className="inline-block"
                      >
                        {getStatusBadge(claim.status)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(claim._id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Claim</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete claim {claim.claimNumber}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(claim._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {claims.length === 0 && <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No claims match your current search criteria.
              </p>
            </div>}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
              Previous
            </Button>
            {[...Array(totalPages)].map((_, i) => <Button key={i + 1} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" onClick={() => handlePageChange(i + 1)}>
                {i + 1}
              </Button>)}
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
              Next
            </Button>
          </div>
        </div>}

      {/* Export button for desktop */}
      <div className="flex justify-end">
        
      </div>
    </div>
  );
};

export default ClaimsTable;
