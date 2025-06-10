
import { toast } from 'sonner';

/**
 * Commission Service
 * Handles all commission-related calculations and management
 * Separated from invoice logic for back-office optimization
 */

class CommissionService {
  constructor() {
    this.storageKey = 'commissionsData';
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
   * Store commission record
   */
  storeCommission(commissionData) {
    try {
      const existingCommissions = this.getAllCommissions();
      existingCommissions.push(commissionData);
      localStorage.setItem(this.storageKey, JSON.stringify(existingCommissions));
      
      console.log('Commission stored successfully:', commissionData.id);
      return commissionData;
    } catch (error) {
      console.error('Error storing commission:', error);
      throw new Error('Failed to store commission');
    }
  }

  /**
   * Get all commissions
   */
  getAllCommissions() {
    try {
      const commissionsData = localStorage.getItem(this.storageKey);
      return commissionsData ? JSON.parse(commissionsData) : [];
    } catch (error) {
      console.error('Error loading commissions:', error);
      return [];
    }
  }

  /**
   * Get commissions for specific agent
   */
  getAgentCommissions(agentId, filters = {}) {
    try {
      const allCommissions = this.getAllCommissions();
      let agentCommissions = allCommissions.filter(commission => 
        commission.agentId && commission.agentId.toString() === agentId.toString()
      );

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        agentCommissions = agentCommissions.filter(c => c.status === filters.status);
      }

      if (filters.startDate && filters.endDate) {
        agentCommissions = agentCommissions.filter(c => 
          c.calculatedDate >= filters.startDate && c.calculatedDate <= filters.endDate
        );
      }

      return agentCommissions;
    } catch (error) {
      console.error('Error loading agent commissions:', error);
      return [];
    }
  }

  /**
   * Update commission status
   */
  updateCommissionStatus(commissionId, newStatus, notes = '') {
    try {
      const allCommissions = this.getAllCommissions();
      const updatedCommissions = allCommissions.map(commission => {
        if (commission.id === commissionId) {
          return {
            ...commission,
            status: newStatus,
            ...(newStatus === 'paid' && { paidDate: new Date().toISOString().split('T')[0] }),
            ...(notes && { notes: `${commission.notes}. ${notes}` }),
            updatedAt: new Date().toISOString()
          };
        }
        return commission;
      });

      localStorage.setItem(this.storageKey, JSON.stringify(updatedCommissions));
      
      const statusMessages = {
        'paid': 'Commission marked as paid',
        'rejected': 'Commission rejected',
        'pending': 'Commission status updated to pending'
      };
      
      toast.success(statusMessages[newStatus] || 'Commission status updated');
      return true;
    } catch (error) {
      console.error('Error updating commission status:', error);
      toast.error('Failed to update commission status');
      return false;
    }
  }

  /**
   * Bulk process commissions
   */
  bulkProcessCommissions(commissionIds, action) {
    try {
      const allCommissions = this.getAllCommissions();
      let processedCount = 0;

      const updatedCommissions = allCommissions.map(commission => {
        if (commissionIds.includes(commission.id)) {
          processedCount++;
          return {
            ...commission,
            status: action === 'approve' ? 'paid' : 'rejected',
            ...(action === 'approve' && { paidDate: new Date().toISOString().split('T')[0] }),
            updatedAt: new Date().toISOString(),
            notes: `${commission.notes}. Bulk ${action}d on ${new Date().toISOString().split('T')[0]}`
          };
        }
        return commission;
      });

      localStorage.setItem(this.storageKey, JSON.stringify(updatedCommissions));
      
      toast.success(`${processedCount} commissions ${action}d successfully`);
      return processedCount;
    } catch (error) {
      console.error('Error bulk processing commissions:', error);
      toast.error('Failed to process commissions');
      return 0;
    }
  }

  /**
   * Get commission summary for agent
   */
  getCommissionSummary(agentId, period = '6m') {
    try {
      const agentCommissions = this.getAgentCommissions(agentId);
      
      const paidCommissions = agentCommissions.filter(c => c.status === 'paid');
      const pendingCommissions = agentCommissions.filter(c => c.status === 'pending');
      
      const totalPaid = paidCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
      const totalPending = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
      
      // Calculate period-based metrics
      const periodMonths = period === '3m' ? 3 : period === '6m' ? 6 : 12;
      const monthlyAverage = paidCommissions.length > 0 ? totalPaid / periodMonths : 0;
      
      return {
        totalPaid,
        totalPending,
        monthlyAverage,
        totalCommissions: agentCommissions.length,
        averageRate: this.calculateAverageRate(agentCommissions)
      };
    } catch (error) {
      console.error('Error calculating commission summary:', error);
      return {
        totalPaid: 0,
        totalPending: 0,
        monthlyAverage: 0,
        totalCommissions: 0,
        averageRate: 0
      };
    }
  }

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
