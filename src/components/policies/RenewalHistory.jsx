
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const RenewalHistory = ({ policy, setPolicy }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRenewal, setNewRenewal] = useState({
    date: new Date().toISOString().split('T')[0],
    premium: policy.premium,
    renewedBy: 'Admin',
    remarks: ''
  });
  
  const [reminderSettings, setReminderSettings] = useState({
    days30: policy.reminderSettings?.days30 ?? true,
    days14: policy.reminderSettings?.days14 ?? true,
    days7: policy.reminderSettings?.days7 ?? true,
    days1: policy.reminderSettings?.days1 ?? true,
    emailNotification: policy.reminderSettings?.emailNotification ?? false,
    smsNotification: policy.reminderSettings?.smsNotification ?? false,
    whatsappNotification: policy.reminderSettings?.whatsappNotification ?? false
  });

  const handleAddRenewal = () => {
    // Validation
    if (!newRenewal.date || !newRenewal.premium || !newRenewal.renewedBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedPolicy = { ...policy };
    
    if (!updatedPolicy.renewals) {
      updatedPolicy.renewals = [];
    }
    
    // Add the new renewal
    updatedPolicy.renewals.push({
      ...newRenewal,
      id: Date.now() // Simple ID for the renewal entry
    });
    
    // Add history entry
    if (!updatedPolicy.history) {
      updatedPolicy.history = [];
    }
    
    updatedPolicy.history.push({
      action: 'Renewal Added',
      by: 'Admin',
      timestamp: new Date().toISOString(),
      details: `Policy renewed on ${new Date(newRenewal.date).toLocaleDateString()}`
    });
    
    // Update the premium if it changed
    if (newRenewal.premium !== policy.premium) {
      updatedPolicy.premium = newRenewal.premium;
      updatedPolicy.history.push({
        action: 'Premium Updated',
        by: 'Admin',
        timestamp: new Date().toISOString(),
        details: `Premium updated to ₹${newRenewal.premium}`
      });
    }
    
    // Update end date (add 1 year to current end date)
    const currentEndDate = new Date(updatedPolicy.endDate);
    const newEndDate = new Date(currentEndDate.setFullYear(currentEndDate.getFullYear() + 1));
    updatedPolicy.endDate = newEndDate.toISOString().split('T')[0];
    
    // Update reminder settings
    updatedPolicy.reminderSettings = reminderSettings;
    
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
    setShowAddForm(false);
    setNewRenewal({
      date: new Date().toISOString().split('T')[0],
      premium: updatedPolicy.premium,
      renewedBy: 'Admin',
      remarks: ''
    });
    
    toast.success('Renewal added successfully');
  };
  
  const handleSaveReminderSettings = () => {
    const updatedPolicy = {
      ...policy,
      reminderSettings
    };
    
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
    toast.success('Reminder settings saved');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Renewal History</CardTitle>
        </CardHeader>
        <CardContent>
          {policy.renewals && policy.renewals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Renewed By</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policy.renewals.map((renewal, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(renewal.date).toLocaleDateString()}</TableCell>
                    <TableCell>₹{parseInt(renewal.premium).toLocaleString()}</TableCell>
                    <TableCell>{renewal.renewedBy}</TableCell>
                    <TableCell>{renewal.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No renewal history found
            </div>
          )}

          {!showAddForm ? (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="mt-4"
            >
              <Plus size={16} className="mr-2" /> Add Renewal
            </Button>
          ) : (
            <div className="mt-6 border rounded-md p-4">
              <h3 className="font-medium mb-4">Add Renewal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="renewal-date">Renewal Date</Label>
                  <Input 
                    id="renewal-date"
                    type="date" 
                    value={newRenewal.date} 
                    onChange={(e) => setNewRenewal({...newRenewal, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewal-premium">Premium</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">₹</span>
                    <Input 
                      id="renewal-premium"
                      type="number"
                      className="pl-8"
                      value={newRenewal.premium} 
                      onChange={(e) => setNewRenewal({...newRenewal, premium: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewal-by">Renewed By</Label>
                  <Input 
                    id="renewal-by"
                    value={newRenewal.renewedBy} 
                    onChange={(e) => setNewRenewal({...newRenewal, renewedBy: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewal-remarks">Remarks</Label>
                  <Input 
                    id="renewal-remarks"
                    value={newRenewal.remarks} 
                    onChange={(e) => setNewRenewal({...newRenewal, remarks: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddRenewal}>
                  Save Renewal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Renewal Reminder Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Reminder Schedule</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="days30"
                    checked={reminderSettings.days30}
                    onChange={(e) => setReminderSettings({...reminderSettings, days30: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="days30">30 days before</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="days14"
                    checked={reminderSettings.days14}
                    onChange={(e) => setReminderSettings({...reminderSettings, days14: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="days14">14 days before</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="days7"
                    checked={reminderSettings.days7}
                    onChange={(e) => setReminderSettings({...reminderSettings, days7: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="days7">7 days before</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="days1"
                    checked={reminderSettings.days1}
                    onChange={(e) => setReminderSettings({...reminderSettings, days1: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="days1">1 day before</Label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Notification Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="email"
                    checked={reminderSettings.emailNotification}
                    onChange={(e) => setReminderSettings({...reminderSettings, emailNotification: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sms"
                    checked={reminderSettings.smsNotification}
                    onChange={(e) => setReminderSettings({...reminderSettings, smsNotification: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="sms">SMS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="whatsapp"
                    checked={reminderSettings.whatsappNotification}
                    onChange={(e) => setReminderSettings({...reminderSettings, whatsappNotification: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveReminderSettings}>
                Save Reminder Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RenewalHistory;
