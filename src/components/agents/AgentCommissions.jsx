
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Receipt, TrendingUp, DollarSign, Calendar, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAgentCommissions, useAgentCommissionSummary } from '@/hooks/useAgents';

const AgentCommissions = ({ agentId }) => {
  const [dateRange, setDateRange] = useState();
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch commission data from API
  const { data: commissionData = [], isLoading: commissionsLoading } = useAgentCommissions(agentId, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    dateRange: dateRange
  });
  
  const { data: monthlyCommissions = [], isLoading: summaryLoading } = useAgentCommissionSummary(agentId);

  const totalCommissions = commissionData.reduce((sum, item) => sum + (item.commissionAmount || 0), 0);
  const paidCommissions = commissionData
    .filter(item => item.status === 'paid')
    .reduce((sum, item) => sum + (item.commissionAmount || 0), 0);
  const pendingCommissions = commissionData
    .filter(item => item.status === 'pending')
    .reduce((sum, item) => sum + (item.commissionAmount || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const filteredCommissions = commissionData.filter(commission => {
    if (statusFilter !== 'all' && commission.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Commission Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {commissionsLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalCommissions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Commissions</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{paidCommissions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Received payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">₹{pendingCommissions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Commission Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Trends</CardTitle>
          <CardDescription>Monthly commission earnings vs payments</CardDescription>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyCommissions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="earned" stroke="#3b82f6" strokeWidth={2} name="Earned" />
                <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} name="Paid" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            placeholder="Select date range"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>

      {/* Commission History */}
      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>Detailed commission breakdown by policy</CardDescription>
        </CardHeader>
        <CardContent>
          {commissionsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                    <div className="mt-2 h-3 bg-gray-200 rounded animate-pulse w-64"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {filteredCommissions.map(commission => (
                  <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{commission.policyNumber}</h4>
                          <p className="text-sm text-gray-600">{commission.clientName}</p>
                        </div>
                        <Badge variant="outline">{commission.policyType}</Badge>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Premium: ₹{commission.premiumAmount?.toLocaleString() || 0} • 
                        Rate: {commission.commissionRate || 0}% • 
                        Created: {commission.createdAt || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">₹{commission.commissionAmount?.toLocaleString() || 0}</div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(commission.status)}
                        {commission.paidDate && (
                          <span className="text-xs text-gray-500">Paid: {commission.paidDate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCommissions.length === 0 && !commissionsLoading && (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No commissions found</h3>
                  <p className="text-gray-500">No commission records match your current filters</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentCommissions;
