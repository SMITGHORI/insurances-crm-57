
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuotationsTable from '@/components/quotations/QuotationsTable';
import QuotationFilters from '@/components/quotations/QuotationFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';

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

  const handleCreateQuotation = () => {
    navigate('/quotations/create');
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Quotation Management</h1>
        <Button onClick={handleCreateQuotation} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> {isMobile ? 'Create' : 'Create Quotation'}
        </Button>
      </div>

      <Card className="mb-4 sm:mb-6 border-0 shadow-sm">
        <QuotationFilters filterParams={filterParams} setFilterParams={setFilterParams} />
      </Card>
      
      <div className="max-w-full overflow-x-hidden mb-20 sm:mb-0">
        <QuotationsTable filterParams={filterParams} />
      </div>
    </div>
  );
};

export default Quotations;
