
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClaimForm from '../components/claims/ClaimForm';
import { toast } from 'sonner';

const ClaimEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Try to get claims from localStorage
    const storedClaimsData = localStorage.getItem('claimsData');
    let claimsList = [];
    
    if (storedClaimsData) {
      claimsList = JSON.parse(storedClaimsData);
    }
    
    // Find the claim by id
    const foundClaim = claimsList.find(c => c.id === parseInt(id));
    
    if (foundClaim) {
      setClaim(foundClaim);
    } else {
      toast.error(`Claim with ID ${id} not found`);
      navigate('/claims');
    }
    
    setLoading(false);
  }, [id, navigate]);

  const handleSaveClaim = (updatedClaim) => {
    // Get current claims from localStorage
    const storedClaimsData = localStorage.getItem('claimsData');
    let claimsList = [];
    
    if (storedClaimsData) {
      claimsList = JSON.parse(storedClaimsData);
    }
    
    // Find the index of the claim to update
    const claimIndex = claimsList.findIndex(c => c.id === updatedClaim.id);
    
    if (claimIndex !== -1) {
      // Add history entry for the update
      if (!updatedClaim.history) {
        updatedClaim.history = [];
      }
      
      updatedClaim.history.push({
        action: 'Updated',
        by: 'Admin',
        timestamp: new Date().toISOString(),
        details: 'Claim details updated'
      });
      
      // Update the claim in the array
      claimsList[claimIndex] = updatedClaim;
      
      // Save updated claims list back to localStorage
      localStorage.setItem('claimsData', JSON.stringify(claimsList));
      
      toast.success('Claim updated successfully');
      navigate(`/claims/${updatedClaim.id}`);
    } else {
      toast.error('Claim not found for update');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Edit Claim: {claim.claimId}
      </h1>
      <ClaimForm claim={claim} onSave={handleSaveClaim} />
    </div>
  );
};

export default ClaimEdit;
