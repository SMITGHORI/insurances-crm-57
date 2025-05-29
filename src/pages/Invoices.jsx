
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvoicesTable from '@/components/invoices/InvoicesTable';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const Invoices = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    dateRange: 'all',
    clientId: 'all',
    searchTerm: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdDate',
    direction: 'desc'
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demonstration
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateInvoice = () => {
    navigate('/invoices/create');
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
      dateRange: 'all',
      clientId: 'all',
      searchTerm: ''
    });
    setActiveFilters({});
  };
  
  const handleExportInvoices = (invoices) => {
    // In a real app, this would generate a CSV/Excel file
    toast.success(`Exported ${invoices.length} invoices to CSV`);
  };

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Invoice Management</h1>
        <div className="flex gap-2">
          <Button onClick={handleCreateInvoice} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> {isMobile ? 'Create' : 'Create Invoice'}
          </Button>
        </div>
      </div>

      <Card className="mb-4 sm:mb-6 border-0 shadow-sm">
        <InvoiceFilters 
          filterParams={filterParams} 
          setFilterParams={setFilterParams}
          activeFilters={activeFilters}
          updateActiveFilters={updateActiveFilters}
          clearAllFilters={clearAllFilters}
        />
      </Card>
      
      <div className="max-w-full overflow-x-hidden mb-20 sm:mb-0">
        <InvoicesTable 
          filterParams={filterParams} 
          sortConfig={sortConfig}
          handleSort={handleSort}
          handleExport={handleExportInvoices}
        />
      </div>
    </div>
  );
};

export default Invoices;
