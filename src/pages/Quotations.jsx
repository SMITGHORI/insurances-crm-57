
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuotationsTable from '@/components/quotations/QuotationsTable';
import QuotationFilters from '@/components/quotations/QuotationFilters';

const Quotations = () => {
  const navigate = useNavigate();
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
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quotation Management</h1>
        <Button onClick={handleCreateQuotation}>
          <Plus className="mr-2 h-4 w-4" /> Create Quotation
        </Button>
      </div>

      <QuotationFilters filterParams={filterParams} setFilterParams={setFilterParams} />
      <QuotationsTable filterParams={filterParams} />
    </div>
  );
};

export default Quotations;
