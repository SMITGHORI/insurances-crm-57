
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CreditCard,
  Plus,
  Calendar
} from 'lucide-react';
import { useClaimFinancialsBackend, useProcessClaimPaymentBackend } from '../../hooks/useClaimsBackend';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const ClaimFinancials = ({ claimId }) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'bank_transfer',
    description: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const { data: financials, isLoading, refetch } = useClaimFinancialsBackend(claimId);
  const processPaymentMutation = useProcessClaimPaymentBackend();

  const handlePaymentSubmit = async () => {
    try {
      await processPaymentMutation.mutateAsync({
        claimId,
        paymentData: {
          ...paymentData,
          amount: parseFloat(paymentData.amount)
        }
      });
      setShowPaymentDialog(false);
      setPaymentData({
        amount: '',
        paymentMethod: 'bank_transfer',
        description: '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
      refetch();
    } catch (error) {
      console.error('Payment processing error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claim Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financials?.claimAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Original claim amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financials?.approvedAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financials?.approvedAmount && financials?.claimAmount 
                ? `${((financials.approvedAmount / financials.claimAmount) * 100).toFixed(1)}% of claim`
                : 'Pending approval'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financials?.financial?.totalPaid || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financials?.financial?.paymentCount || 0} payments made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financials?.outstandingAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Remaining to pay</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Financial Breakdown</CardTitle>
          <Badge className={getStatusColor(financials?.financial?.status)}>
            {financials?.financial?.status || 'pending'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Deductible</Label>
              <p className="text-lg font-semibold">
                {formatCurrency(financials?.deductible || 0)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Coverage Limit</Label>
              <p className="text-lg font-semibold">
                {formatCurrency(financials?.financial?.coverageLimit || 0)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Reserves</Label>
              <p className="text-lg font-semibold">
                {formatCurrency(financials?.financial?.reserves || 0)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Adjustments</Label>
              <p className="text-lg font-semibold">
                {formatCurrency(financials?.financial?.adjustments || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Payment</DialogTitle>
                <DialogDescription>
                  Record a new payment for this claim.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Payment Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({...prev, amount: e.target.value}))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-date">Payment Date</Label>
                    <Input
                      id="payment-date"
                      type="date"
                      value={paymentData.paymentDate}
                      onChange={(e) => setPaymentData(prev => ({...prev, paymentDate: e.target.value}))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <select
                    id="payment-method"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData(prev => ({...prev, paymentMethod: e.target.value}))}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={paymentData.description}
                    onChange={(e) => setPaymentData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Payment description..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePaymentSubmit}
                  disabled={!paymentData.amount || processPaymentMutation.isLoading}
                >
                  {processPaymentMutation.isLoading ? 'Processing...' : 'Process Payment'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {financials?.financial?.payments?.length > 0 ? (
            <div className="space-y-3">
              {financials.financial.payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-500">
                        {payment.paymentMethod} - {payment.date}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payments recorded</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by adding the first payment for this claim.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimFinancials;
