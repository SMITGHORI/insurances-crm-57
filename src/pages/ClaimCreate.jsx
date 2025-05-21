
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClaimForm from '../components/claims/ClaimForm';
import { toast } from 'sonner';

const ClaimCreate = () => {
  const navigate = useNavigate();

  const handleSaveClaim = (claimData) => {
    // Get current claims from localStorage
    const storedClaimsData = localStorage.getItem('claimsData');
    let claimsList = [];
    
    if (storedClaimsData) {
      claimsList = JSON.parse(storedClaimsData);
    }
    
    // Generate a new ID for the claim
    const newClaimId = claimsList.length > 0 
      ? Math.max(...claimsList.map(claim => claim.id)) + 1 
      : 1;
    
    claimData.id = newClaimId;
    
    // Add the new claim to the list
    claimsList.push(claimData);
    
    // Save updated claims list back to localStorage
    localStorage.setItem('claimsData', JSON.stringify(claimsList));
    
    toast.success('Claim created successfully');
    navigate(`/claims/${newClaimId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Create New Claim
      </h1>
      <ClaimForm onSave={handleSaveClaim} />
    </div>
  );
};

export default ClaimCreate;
