
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClaimsTable from '@/components/claims/ClaimsTable';
import { useIsMobile } from '@/hooks/use-mobile';
import ClaimFilters from '@/components/claims/ClaimFilters';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const Claims = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    policyType: 'all',
    searchTerm: ''
  });
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeFilters, setActiveFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demonstration
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateClaim = () => {
    navigate('/claims/create');
  };

  const handleExport = async (claims) => {
    try {
      // Format claims data for export
      const exportData = claims.map(claim => ({
        'Claim Number': claim.claimNumber,
        'Insurance ID': claim.insuranceCompanyClaimId || 'Not Generated',
        'Client': claim.clientName,
        'Member': claim.memberName,
        'Policy Type': claim.policyType,
        'Policy Number': claim.policyNumber,
        'Incident Date': claim.dateOfIncident,
        'Filing Date': claim.dateOfFiling,
        'Claim Amount': claim.claimAmount,
        'Approved Amount': claim.approvedAmount !== null ? claim.approvedAmount : 'Pending',
        'Status': claim.status.charAt(0).toUpperCase() + claim.status.slice(1)
      }));
      
      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Claims');
      
      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `Claims_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Claims data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export claims data');
    }
  };

  const filterOptions = ['all', 'Health', 'Property', 'Term', 'Vehicle', 'Group'];

  const setSelectedFilter = (value) => {
    setFilterParams({...filterParams, policyType: value});
    updateActiveFilters('Policy Type', value === 'all' ? null : value);
  };

  const updateActiveFilters = (name, value) => {
    if (value === null) {
      setActiveFilters(activeFilters.filter(filter => filter.name !== name));
      return;
    }
    
    const existingFilterIndex = activeFilters.findIndex(filter => filter.name === name);
    if (existingFilterIndex !== -1) {
      const updatedFilters = [...activeFilters];
      updatedFilters[existingFilterIndex] = { name, value };
      setActiveFilters(updatedFilters);
    } else {
      setActiveFilters([...activeFilters, { name, value }]);
    }
  };

  const removeFilter = (filterName) => {
    if (filterName === 'Policy Type') {
      setFilterParams({...filterParams, policyType: 'all'});
    } else if (filterName === 'Status') {
      setFilterParams({...filterParams, status: 'all'});
    }
    setActiveFilters(activeFilters.filter(filter => filter.name !== filterName));
  };

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Claims Management</h1>
        <Button onClick={handleCreateClaim} className={isMobile ? "w-full" : ""}>
          <Plus className="mr-2 h-4 w-4" /> Create Claim
        </Button>
      </div>

      <div className="mb-6">
        <ClaimFilters
          searchTerm={filterParams.searchTerm}
          setSearchTerm={(value) => setFilterParams({...filterParams, searchTerm: value})}
          selectedFilter={filterParams.policyType}
          setSelectedFilter={setSelectedFilter}
          filterOptions={filterOptions}
          handleExport={(claims) => handleExport(claims)}
          sortField={sortField}
          sortDirection={sortDirection}
          setSortField={setSortField}
          setSortDirection={setSortDirection}
          activeFilters={activeFilters}
          removeFilter={removeFilter}
        />
      </div>

      <ClaimsTable 
        filterParams={filterParams} 
        setFilterParams={setFilterParams} 
        sortField={sortField}
        sortDirection={sortDirection}
        handleExport={handleExport}
        updateActiveFilters={updateActiveFilters}
      />
    </div>
  );
};

export default Claims;
