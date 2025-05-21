
import React, { useState } from 'react';
import { Calendar, Search, Download, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

const AgentCommissions = ({ agentId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('6m');

  // Sample data - in a real app, this would be fetched from an API based on agentId
  const commissionData = [
    { month: 'Jan', commission: 32000 },
    { month: 'Feb', commission: 36000 },
    { month: 'Mar', commission: 40000 },
    { month: 'Apr', commission: 38000 },
    { month: 'May', commission: 42000 },
    { month: 'Jun', commission: 45000 },
    { month: 'Jul', commission: 50000 },
    { month: 'Aug', commission: 48000 },
    { month: 'Sep', commission: 52000 },
    { month: 'Oct', commission: 55000 },
    { month: 'Nov', commission: 58000 },
    { month: 'Dec', commission: 62000 },
  ];

  const commissionHistory = [
    {
      id: 'TRX-25042501',
      policyId: 'POL-2025-0125',
      policyType: 'Health Insurance',
      clientName: 'Vivek Patel',
      date: '15 Apr 2025',
      amount: '₹3,750',
      type: 'New Policy',
      status: 'paid'
    },
    {
      id: 'TRX-25042502',
      policyId: 'POL-2025-0132',
      policyType: 'Term Insurance',
      clientName: 'Vivek Patel',
      date: '15 Apr 2025',
      amount: '₹4,000',
      type: 'New Policy',
      status: 'paid'
    },
    {
      id: 'TRX-25042503',
      policyId: 'POL-2025-0156',
      policyType: 'Health Insurance',
      clientName: 'Priya Desai',
      date: '12 Apr 2025',
      amount: '₹4,275',
      type: 'New Policy',
      status: 'paid'
    },
    {
      id: 'TRX-25042504',
      policyId: 'POL-2025-0178',
      policyType: 'Group Health Insurance',
      clientName: 'Tech Solutions Ltd',
      date: '10 Apr 2025',
      amount: '₹12,750',
      type: 'New Policy',
      status: 'pending'
    },
    {
      id: 'TRX-25042505',
      policyId: 'POL-2025-0189',
      policyType: 'Property Insurance',
      clientName: 'Tech Solutions Ltd',
      date: '08 Apr 2025',
      amount: '₹6,750',
      type: 'New Policy',
      status: 'pending'
    },
    {
      id: 'TRX-25042506',
      policyId: 'POL-2024-0543',
      policyType: 'Health Insurance',
      clientName: 'Rajesh Kumar',
      date: '05 Apr 2025',
      amount: '₹3,250',
      type: 'Renewal',
      status: 'paid'
    },
  ];

  // Filter commissions based on search term
  const filteredCommissions = commissionHistory.filter(commission => 
    commission.policyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commission.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commission.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter chart data based on selected period
  const filteredChartData = () => {
    switch (filterPeriod) {
      case '3m':
        return commissionData.slice(-3);
      case '6m':
        return commissionData.slice(-6);
      case '1y':
        return commissionData;
      default:
        return commissionData;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  // Calculate total commission
  const totalCommission = commissionHistory
    .filter(c => c.status === 'paid')
    .reduce((sum, current) => {
      const amount = parseFloat(current.amount.replace('₹', '').replace(',', ''));
      return sum + amount;
    }, 0);

  const pendingCommission = commissionHistory
    .filter(c => c.status === 'pending')
    .reduce((sum, current) => {
      const amount = parseFloat(current.amount.replace('₹', '').replace(',', ''));
      return sum + amount;
    }, 0);

  return (
    <div className="space-y-6">
      {/* Commission Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Total Commission (MTD)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">₹{totalCommission.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Last updated: Today</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Commission</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">₹{pendingCommission.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Awaiting processing</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Commission Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">15% - 25%</div>
            <div className="text-xs text-gray-500 mt-1">Based on policy type</div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Chart */}
      <Card>
        <CardHeader className="py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Commission Trend</CardTitle>
          <Select
            value={filterPeriod}
            onValueChange={setFilterPeriod}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last 1 year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredChartData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Commission']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#1b365d"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="Commission"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Commission History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-semibold text-gray-800">Commission History</h3>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full md:w-[250px]"
              />
            </div>
            <Button variant="outline" size="icon" className="border-gray-300">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="border-gray-300">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="amba-table">
            <thead>
              <tr>
                <th className="py-3 px-4 font-medium">Transaction ID</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Policy</th>
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No commission records found matching your search criteria
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="border-b hover:bg-gray-50 cursor-pointer">
                    <td className="py-3 px-4 text-gray-500">{commission.id}</td>
                    <td className="py-3 px-4 text-gray-500">{commission.date}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{commission.policyType}</div>
                      <div className="text-xs text-gray-500">{commission.policyId}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{commission.clientName}</td>
                    <td className="py-3 px-4 text-gray-500">{commission.type}</td>
                    <td className="py-3 px-4 font-medium">{commission.amount}</td>
                    <td className="py-3 px-4">{getStatusBadge(commission.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentCommissions;
