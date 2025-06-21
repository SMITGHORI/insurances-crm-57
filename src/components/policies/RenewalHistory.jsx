
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useRenewPolicy, usePoliciesDueForRenewal } from '../../hooks/usePolicyFeatures';

const RenewalHistory = ({ policy, setPolicy }) => {
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [renewalData, setRenewalData] = useState({
    newEndDate: '',
    newPremium: policy.premium || '',
    notes: ''
  });

  const renewPolicyMutation = useRenewPolicy();
  const { data: dueForRenewal } = usePoliciesDueForRenewal(30);

  const handleRenewPolicy = async () => {
    if (!renewalData.newEndDate || !renewalData.newPremium) {
      toast.error('End date and premium are required');
      return;
    }

    try {
      await renewPolicyMutation.mutateAsync({
        policyId: policy.id,
        renewalData: {
          newEndDate: renewalData.newEndDate,
          newPremium: parseFloat(renewalData.newPremium),
          notes: renewalData.notes
        }
      });
      
      setRenewalData({
        newEndDate: '',
        newPremium: policy.premium || '',
        notes: ''
      });
      setShowRenewalForm(false);
    } catch (error) {
      console.error('Error renewing policy:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days until expiry
  const daysUntilExpiry = Math.floor(
    (new Date(policy.endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  // Mock renewal history - in real app this would come from backend
  const renewalHistory = policy.renewalHistory || [];

  return (
    <div className="space-y-6">
      {/* Renewal Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Policy Renewal Status
            <Dialog open={showRenewalForm} onOpenChange={setShowRenewalForm}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Renew Policy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Renew Policy</DialogTitle>
                  <DialogDescription>
                    Set new terms for policy renewal.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-end">Current End Date</Label>
                      <Input
                        id="current-end"
                        value={formatDate(policy.endDate)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-end">New End Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="new-end"
                          type="date"
                          className="pl-10"
                          value={renewalData.newEndDate}
                          onChange={(e) => setRenewalData({...renewalData, newEndDate: e.target.value})}
                          min={policy.endDate}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-premium">Current Premium</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">₹</span>
                        <Input
                          id="current-premium"
                          value={policy.premium}
                          disabled
                          className="pl-8 bg-gray-50"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-premium">New Premium *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">₹</span>
                        <Input
                          id="new-premium"
                          type="number"
                          step="0.01"
                          className="pl-8"
                          value={renewalData.newPremium}
                          onChange={(e) => setRenewalData({...renewalData, newPremium: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="renewal-notes">Renewal Notes</Label>
                    <Input
                      id="renewal-notes"
                      value={renewalData.notes}
                      onChange={(e) => setRenewalData({...renewalData, notes: e.target.value})}
                      placeholder="Optional renewal notes"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRenewalForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleRenewPolicy}
                    disabled={renewPolicyMutation.isLoading}
                  >
                    {renewPolicyMutation.isLoading ? 'Renewing...' : 'Renew Policy'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{daysUntilExpiry}</div>
              <div className="text-sm text-gray-600">Days until expiry</div>
              {isExpired && (
                <Badge variant="destructive" className="mt-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expired
                </Badge>
              )}
              {isExpiringSoon && !isExpired && (
                <Badge variant="destructive" className="mt-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expiring Soon
                </Badge>
              )}
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatDate(policy.endDate)}
              </div>
              <div className="text-sm text-gray-600">Current end date</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                ₹{policy.premium?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Current premium</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renewal History */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal History</CardTitle>
        </CardHeader>
        <CardContent>
          {renewalHistory && renewalHistory.length > 0 ? (
            <div className="space-y-4">
              {renewalHistory.map((renewal, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        Renewed on {formatDate(renewal.renewalDate)}
                      </span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Previous End:</span><br />
                      {formatDate(renewal.previousEndDate)}
                    </div>
                    <div>
                      <span className="font-medium">New End:</span><br />
                      {formatDate(renewal.newEndDate)}
                    </div>
                    <div>
                      <span className="font-medium">Previous Premium:</span><br />
                      ₹{renewal.previousPremium?.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">New Premium:</span><br />
                      ₹{renewal.newPremium?.toLocaleString()}
                    </div>
                    {renewal.notes && (
                      <div className="col-span-2 md:col-span-4">
                        <span className="font-medium">Notes:</span> {renewal.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <RotateCcw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No renewal history found</p>
              <p className="text-sm">This policy hasn't been renewed yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RenewalHistory;
