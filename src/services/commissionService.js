
import { toast } from 'sonner';

/**
 * Commission Service
 * Handles commission-related calculations
 * Note: Commission storage and management is now handled through the API
 * This service focuses on calculation logic only
 */

class CommissionService {
  constructor() {
    this.defaultRates = {
      'Health Insurance': 0.15,
      'Life Insurance': 0.20,
      'Motor Insurance': 0.12,
      'Travel Insurance': 0.18,
      'Home Insurance': 0.15,
      'Business Insurance': 0.15,
      'default': 0.15
    };
  }

  /**
   * Calculate commission for an invoice
   */
  calculateCommission(invoiceData, agentData, policyData) {
    try {
      const baseAmount = invoiceData.subtotal || 0;
      const policyType = policyData?.type || invoiceData.policyType || 'default';
      
      // Get commission rate (priority: agent specific -> policy specific -> default)
      let commissionRate = this.getCommissionRate(agentData, policyType);
      
      const commissionAmount = baseAmount * commissionRate;
      
      return {
        id: this.generateCommissionId(),
        invoiceId: invoiceData.id,
        agentId: agentData.id,
        policyId: policyData?.id,
        commissionType: 'percentage',
        baseAmount: baseAmount,
        commissionRate: commissionRate * 100, // Store as percentage
        commissionAmount: commissionAmount,
        status: 'pending',
        calculatedDate: new Date().toISOString().split('T')[0],
        policyType: policyType,
        clientName: invoiceData.clientName,
        notes: `Auto-calculated commission for invoice ${invoiceData.invoiceNumber}`,
        createdBy: 'System',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating commission:', error);
      throw new Error('Failed to calculate commission');
    }
  }

  /**
   * Get commission rate for agent and policy type
   */
  getCommissionRate(agentData, policyType) {
    // Check agent-specific rates first
    if (agentData.commissionRates && agentData.commissionRates[policyType]) {
      return agentData.commissionRates[policyType] / 100;
    }
    
    // Check agent default rate
    if (agentData.defaultCommissionRate) {
      return agentData.defaultCommissionRate;
    }
    
    // Use system default rates
    return this.defaultRates[policyType] || this.defaultRates.default;
  }

  /**
   * Note: Commission storage and management methods have been removed
   * as they are now handled through the API via useAgentCommissions hook.
   * Use the following hooks for commission data:
   * - useAgentCommissions(agentId, params) for fetching commission data
   * - Commission updates should be handled through dedicated API endpoints
   */

  /**
   * Calculate average commission rate for agent
   */
  calculateAverageRate(commissions) {
    if (commissions.length === 0) return 0;
    
    const totalRate = commissions.reduce((sum, c) => sum + c.commissionRate, 0);
    return totalRate / commissions.length;
  }

  /**
   * Generate unique commission ID
   */
  generateCommissionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `COM_${timestamp}_${random}`;
  }

  /**
   * Export commission data
   */
  exportCommissionData(agentId, format = 'csv') {
    try {
      const commissions = this.getAgentCommissions(agentId);
      
      if (format === 'csv') {
        const csvContent = [
          ['Commission ID', 'Invoice ID', 'Date', 'Policy Type', 'Client', 'Base Amount', 'Rate (%)', 'Commission Amount', 'Status'],
          ...commissions.map(commission => [
            commission.id,
            commission.invoiceId,
            commission.calculatedDate,
            commission.policyType || 'N/A',
            commission.clientName || 'N/A',
            commission.baseAmount,
            commission.commissionRate,
            commission.commissionAmount,
            commission.status
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agent_${agentId}_commissions.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Commission report exported successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error exporting commission data:', error);
      toast.error('Failed to export commission data');
      return false;
    }
  }
}

// Export singleton instance
export const commissionService = new CommissionService();
export default commissionService;
