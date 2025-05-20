
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download, Trash } from 'lucide-react';
import { toast } from 'sonner';

const PaymentHistory = ({ policy, setPolicy }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    receiptNumber: '',
    amount: policy.premium,
    date: new Date().toISOString().split('T')[0],
    mode: 'Online',
    reference: '',
    receipt: null
  });

  const handleAddPayment = () => {
    // Validation
    if (!newPayment.receiptNumber || !newPayment.amount || !newPayment.date || !newPayment.mode) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedPolicy = { ...policy };
    
    if (!updatedPolicy.payments) {
      updatedPolicy.payments = [];
    }
    
    // Add the new payment
    updatedPolicy.payments.push({
      ...newPayment,
      id: Date.now() // Simple ID for the payment entry
    });
    
    // Add history entry
    if (!updatedPolicy.history) {
      updatedPolicy.history = [];
    }
    
    updatedPolicy.history.push({
      action: 'Payment Recorded',
      by: 'Admin',
      timestamp: new Date().toISOString(),
      details: `Payment of ₹${newPayment.amount} recorded with receipt number ${newPayment.receiptNumber}`
    });
    
    // Update last premium paid date
    updatedPolicy.lastPremiumPaid = newPayment.date;
    
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
    setNewPayment({
      receiptNumber: '',
      amount: policy.premium,
      date: new Date().toISOString().split('T')[0],
      mode: 'Online',
      reference: '',
      receipt: null
    });
    
    toast.success('Payment recorded successfully');
  };

  const handleDeletePayment = (paymentId) => {
    const updatedPolicy = { ...policy };
    
    // Filter out the payment to delete
    updatedPolicy.payments = updatedPolicy.payments.filter(p => p.id !== paymentId);
    
    // Add history entry
    if (!updatedPolicy.history) {
      updatedPolicy.history = [];
    }
    
    updatedPolicy.history.push({
      action: 'Payment Deleted',
      by: 'Admin',
      timestamp: new Date().toISOString(),
      details: `Payment record deleted`
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
    toast.success('Payment deleted successfully');
  };

  const handleReceiptUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewPayment({
        ...newPayment,
        receipt: {
          name: file.name,
          type: file.type,
          size: file.size,
          url: event.target.result,
          uploadDate: new Date().toISOString()
        }
      });
      toast.success('Receipt uploaded');
    };
    
    reader.onerror = () => {
      toast.error('Failed to process receipt');
    };
    
    reader.readAsDataURL(file);
  };

  const handleDownload = (payment) => {
    if (!payment.receipt || !payment.receipt.url) {
      toast.error('Receipt not available for download');
      return;
    }
    
    const link = payment.receipt.url;
    const fileName = payment.receipt.name || `receipt-${payment.receiptNumber}.${payment.receipt.type.split('/')[1]}`;
    
    const a = document.createElement('a');
    a.href = link;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment & Receipt Tracking</CardTitle>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
        >
          <Plus size={16} className="mr-2" /> New Payment
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-6 border rounded-md p-4">
            <h3 className="font-medium mb-4">Record New Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="receipt-number">Receipt Number</Label>
                <Input 
                  id="receipt-number"
                  value={newPayment.receiptNumber} 
                  onChange={(e) => setNewPayment({...newPayment, receiptNumber: e.target.value})}
                  placeholder="e.g. REC-12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-date">Payment Date</Label>
                <Input 
                  id="payment-date"
                  type="date" 
                  value={newPayment.date} 
                  onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">₹</span>
                  <Input 
                    id="payment-amount"
                    type="number"
                    className="pl-8"
                    value={newPayment.amount} 
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-mode">Payment Mode</Label>
                <Select 
                  onValueChange={(value) => setNewPayment({...newPayment, mode: value})} 
                  defaultValue={newPayment.mode}
                >
                  <SelectTrigger id="payment-mode">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-reference">Reference/Transaction ID</Label>
                <Input 
                  id="payment-reference"
                  value={newPayment.reference} 
                  onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})}
                  placeholder="e.g. NEFT123456 or UPI ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt-upload">Upload Receipt (optional)</Label>
                <div className="flex items-center">
                  <Input 
                    id="receipt-upload"
                    type="file" 
                    onChange={(e) => handleReceiptUpload(e.target.files[0])} 
                    accept="application/pdf,image/*"
                  />
                </div>
                {newPayment.receipt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {newPayment.receipt.name} ({Math.round(newPayment.receipt.size/1024)} KB)
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddPayment}>
                Save Payment
              </Button>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-medium mb-3">Payment Timeline</h3>
          
          {policy.payments && policy.payments.length > 0 ? (
            <div>
              <p className="mb-4 text-sm">
                <strong>Last Premium Paid:</strong> {policy.lastPremiumPaid ? new Date(policy.lastPremiumPaid).toLocaleDateString() : 'Not recorded'}
              </p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Receipt No.</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policy.payments.map((payment) => (
                    <TableRow key={payment.id || payment.receiptNumber}>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>{payment.receiptNumber}</TableCell>
                      <TableCell>₹{parseInt(payment.amount).toLocaleString()}</TableCell>
                      <TableCell>{payment.mode}</TableCell>
                      <TableCell>{payment.reference}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {payment.receipt && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDownload(payment)}
                            >
                              <Download size={16} />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500" 
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payment records found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
