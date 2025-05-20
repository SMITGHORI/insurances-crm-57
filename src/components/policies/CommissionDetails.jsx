
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

const CommissionDetails = ({ policy, setPolicy }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [commissionData, setCommissionData] = useState({
    percentage: policy.commission?.percentage || 0,
    amount: policy.commission?.amount || '0',
    payoutStatus: policy.commission?.payoutStatus || 'Pending',
    tdsDeducted: policy.commission?.tdsDeducted || '0',
    paymentDate: policy.commission?.paymentDate || ''
  });

  const handleSaveCommission = () => {
    const updatedPolicy = { ...policy };
    
    // Update commission data
    updatedPolicy.commission = commissionData;
    
    // Add history entry
    if (!updatedPolicy.history) {
      updatedPolicy.history = [];
    }
    
    updatedPolicy.history.push({
      action: 'Commission Updated',
      by: 'Admin',
      timestamp: new Date().toISOString(),
      details: `Commission details updated: ${commissionData.percentage}%, ₹${commissionData.amount}`
    });
    
    // Save to localStorage
    const storedPoliciesData = localStorage.getItem('policiesData');
    if (storedPoliciesData) {
      const policiesList = JSON.parse(storedPoliciesData);
      const policyIndex = policiesList.findIndex(p => p.id === policy.id);
      
      if (policyIndex !== -1) {
        policiesList[policyIndex] = updatedPolicy;
        localStorage.setItem('policiesData', JSON.stringify(policiesList));
      }
    }
    
    // Update state
    setPolicy(updatedPolicy);
    setIsEditing(false);
    toast.success('Commission details updated successfully');
  };

  const calculateCommissionAmount = () => {
    const premium = parseFloat(policy.premium) || 0;
    const percentage = parseFloat(commissionData.percentage) || 0;
    const amount = (premium * percentage / 100).toFixed(2);
    setCommissionData({...commissionData, amount});
  };

  const calculateTDS = () => {
    const amount = parseFloat(commissionData.amount) || 0;
    const tds = (amount * 0.1).toFixed(2); // Assuming 10% TDS
    setCommissionData({...commissionData, tdsDeducted: tds});
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agent Commission Data</CardTitle>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Commission
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission-percentage">Commission Percentage</Label>
                <div className="relative">
                  <Input 
                    id="commission-percentage"
                    type="number"
                    step="0.01"
                    className="pr-8"
                    value={commissionData.percentage} 
                    onChange={(e) => setCommissionData({...commissionData, percentage: e.target.value})}
                    onBlur={calculateCommissionAmount}
                  />
                  <span className="absolute right-3 top-2.5">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission-amount">Commission Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">₹</span>
                  <Input 
                    id="commission-amount"
                    type="number"
                    step="0.01"
                    className="pl-8"
                    value={commissionData.amount} 
                    onChange={(e) => setCommissionData({...commissionData, amount: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payout-status">Payout Status</Label>
                <Select 
                  onValueChange={(value) => setCommissionData({...commissionData, payoutStatus: value})}
                  defaultValue={commissionData.payoutStatus}
                >
                  <SelectTrigger id="payout-status">
                    <SelectValue placeholder="Select payout status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tds-deducted">TDS Deducted</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5">₹</span>
                    <Input 
                      id="tds-deducted"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={commissionData.tdsDeducted} 
                      onChange={(e) => setCommissionData({...commissionData, tdsDeducted: e.target.value})}
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={calculateTDS}
                  >
                    Auto-calculate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-date">Payment Date</Label>
                <Input 
                  id="payment-date"
                  type="date"
                  value={commissionData.paymentDate || ''} 
                  onChange={(e) => setCommissionData({...commissionData, paymentDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCommission}>
                Save Commission Data
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Commission Percentage</h3>
              <p>{policy.commission?.percentage || 0}%</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Commission Amount</h3>
              <p>₹{parseFloat(policy.commission?.amount || 0).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Payout Status</h3>
              <p>{policy.commission?.payoutStatus || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">TDS Deducted</h3>
              <p>₹{parseFloat(policy.commission?.tdsDeducted || 0).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Date</h3>
              <p>{policy.commission?.paymentDate ? new Date(policy.commission.paymentDate).toLocaleDateString() : 'Not paid'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Net Commission</h3>
              <p>₹{(parseFloat(policy.commission?.amount || 0) - parseFloat(policy.commission?.tdsDeducted || 0)).toLocaleString()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommissionDetails;
