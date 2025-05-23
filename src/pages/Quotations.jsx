
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuotationsTable from '@/components/quotations/QuotationsTable';
import QuotationFilters from '@/components/quotations/QuotationFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const Quotations = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    insuranceType: 'all',
    dateRange: 'all',
    agentId: 'all',
    searchTerm: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdDate',
    direction: 'desc'
  });
  const [activeFilters, setActiveFilters] = useState({});

  const handleCreateQuotation = () => {
    navigate('/quotations/create');
  };
  
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  const updateActiveFilters = (filterName, value) => {
    setActiveFilters(prev => {
      if (!value) {
        const newFilters = { ...prev };
        delete newFilters[filterName];
        return newFilters;
      } else {
        return { ...prev, [filterName]: value };
      }
    });
  };
  
  const clearAllFilters = () => {
    setFilterParams({
      status: 'all',
      insuranceType: 'all',
      dateRange: 'all',
      agentId: 'all',
      searchTerm: ''
    });
    setActiveFilters({});
  };
  
  const handleExportQuotations = (quotations) => {
    // In a real app, this would generate a CSV/Excel file
    toast.success(`Exported ${quotations.length} quotations to CSV`);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Quotation Management</h1>
        <div className="flex gap-2">
          <Button onClick={handleCreateQuotation} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> {isMobile ? 'Create' : 'Create Quotation'}
          </Button>
        </div>
      </div>

      <Card className="mb-4 sm:mb-6 border-0 shadow-sm">
        <QuotationFilters 
          filterParams={filterParams} 
          setFilterParams={setFilterParams}
          activeFilters={activeFilters}
          updateActiveFilters={updateActiveFilters}
          clearAllFilters={clearAllFilters}
        />
      </Card>
      
      <div className="max-w-full overflow-x-hidden mb-20 sm:mb-0">
        <QuotationsTable 
          filterParams={filterParams} 
          sortConfig={sortConfig}
          handleSort={handleSort}
          handleExport={handleExportQuotations}
        />
      </div>
    </div>
  );
};

export default Quotations;
