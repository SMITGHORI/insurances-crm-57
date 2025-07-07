
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import PolicyTable from '../components/policies/PolicyTable';
import PolicyFilters from '../components/policies/PolicyFilters';
import PolicyStats from '../components/policies/PolicyStats';
import { 
  usePolicies, 
  useDeletePolicy, 
  useExportPolicies, 
  useBulkAssignPolicies 
} from '../hooks/usePolicies';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const Policies = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { getFilteredData } = usePermissions();
  
  // State for filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'All',
    page: 1,
    limit: 10,
    sortField: 'createdAt',
    sortDirection: 'desc'
  });
  
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch policies from MongoDB backend
  const { 
    data: policiesResponse, 
    isLoading, 
    error, 
    refetch 
  } = usePolicies(filters);
  
  const deletePolicy = useDeletePolicy();
  const exportPolicies = useExportPolicies();
  const bulkAssignPolicies = useBulkAssignPolicies();

  // Apply role-based filtering to the policies data
  const policies = policiesResponse?.data ? getFilteredData(policiesResponse.data, 'policies') : [];
  const totalPolicies = policiesResponse?.total || 0;
  const totalPages = policiesResponse?.totalPages || 1;

  console.log('Policies from MongoDB:', { policies, totalPolicies, isLoading, error });

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle sorting
  const handleSort = (sortField, sortDirection) => {
    setFilters(prev => ({
      ...prev,
      sortField,
      sortDirection
    }));
  };

  // Handle policy deletion
  const handleDeletePolicy = async (policyId) => {
    try {
      console.log('Deleting policy from MongoDB:', policyId);
      await deletePolicy.mutateAsync(policyId);
      refetch();
    } catch (error) {
      console.error('Error deleting policy from MongoDB:', error);
      toast.error('Failed to delete policy from database');
    }
  };

  // Handle bulk operations
  const handleBulkAssign = async (agentId) => {
    try {
      console.log('Bulk assigning policies in MongoDB:', { selectedPolicies, agentId });
      await bulkAssignPolicies.mutateAsync({
        policyIds: selectedPolicies,
        agentId
      });
      setSelectedPolicies([]);
      refetch();
    } catch (error) {
      console.error('Error bulk assigning policies in MongoDB:', error);
      toast.error('Failed to assign policies in database');
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      console.log('Exporting policies from MongoDB');
      await exportPolicies.mutateAsync(filters);
    } catch (error) {
      console.error('Error exporting policies from MongoDB:', error);
      toast.error('Failed to export policies from database');
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Policies</h2>
          <p className="text-gray-600 mb-4">Failed to load policies from database: {error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Policies</h1>
          <p className="text-sm text-gray-600 mt-1">
            Connected to MongoDB • {totalPolicies} policies found
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportPolicies.isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/policies/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <PolicyStats />

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search policies by number, client, or company..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <PolicyFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Bulk Actions */}
      {selectedPolicies.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedPolicies.length} policies selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedPolicies([])}
              >
                Clear Selection
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  // This would open a modal to select agent
                  toast.info('Bulk assign feature would open agent selection modal');
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Assign to Agent
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Table */}
      <PolicyTable
        policies={policies}
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSort={handleSort}
        onDelete={handleDeletePolicy}
        selectedPolicies={selectedPolicies}
        onSelectionChange={setSelectedPolicies}
        sortField={filters.sortField}
        sortDirection={filters.sortDirection}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Policies;
