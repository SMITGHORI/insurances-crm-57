
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClaimsTable from '@/components/claims/ClaimsTable';
import { useIsMobile } from '@/hooks/use-mobile';

const Claims = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    policyType: 'all',
    searchTerm: ''
  });

  const handleCreateClaim = () => {
    navigate('/claims/create');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Claims Management</h1>
        <Button onClick={handleCreateClaim} className={isMobile ? "w-full" : ""}>
          <Plus className="mr-2 h-4 w-4" /> Create Claim
        </Button>
      </div>

      <ClaimsTable filterParams={filterParams} setFilterParams={setFilterParams} />
    </div>
  );
};

export default Claims;
