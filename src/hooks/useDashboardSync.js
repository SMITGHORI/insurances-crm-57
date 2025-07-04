
import { useCallback } from 'react';

/**
 * Hook for syncing dashboard data when other modules are updated
 * This ensures real-time updates across the application
 */
export const useDashboardSync = () => {
  const triggerDashboardUpdate = useCallback((eventType, data = {}) => {
    console.log(`Triggering dashboard update: ${eventType}`, data);
    
    // Dispatch custom event for dashboard to listen to
    window.dispatchEvent(new CustomEvent(eventType, { 
      detail: data 
    }));
  }, []);

  // Specific trigger functions for different modules
  const triggerClientUpdate = useCallback((action, clientData) => {
    triggerDashboardUpdate(`client-${action}`, clientData);
  }, [triggerDashboardUpdate]);

  const triggerPolicyUpdate = useCallback((action, policyData) => {
    triggerDashboardUpdate(`policy-${action}`, policyData);
  }, [triggerDashboardUpdate]);

  const triggerClaimUpdate = useCallback((action, claimData) => {
    triggerDashboardUpdate(`claim-${action}`, claimData);
  }, [triggerDashboardUpdate]);

  const triggerLeadUpdate = useCallback((action, leadData) => {
    triggerDashboardUpdate(`lead-${action}`, leadData);
  }, [triggerDashboardUpdate]);

  const triggerQuotationUpdate = useCallback((action, quotationData) => {
    triggerDashboardUpdate(`quotation-${action}`, quotationData);
  }, [triggerDashboardUpdate]);

  const triggerOfferUpdate = useCallback((action, offerData) => {
    triggerDashboardUpdate(`offer-${action}`, offerData);
  }, [triggerDashboardUpdate]);

  const triggerBroadcastUpdate = useCallback((action, broadcastData) => {
    triggerDashboardUpdate(`broadcast-${action}`, broadcastData);
  }, [triggerDashboardUpdate]);

  return {
    triggerDashboardUpdate,
    triggerClientUpdate,
    triggerPolicyUpdate,
    triggerClaimUpdate,
    triggerLeadUpdate,
    triggerQuotationUpdate,
    triggerOfferUpdate,
    triggerBroadcastUpdate
  };
};

export default useDashboardSync;
