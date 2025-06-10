
import React, { useState, useEffect } from 'react';
import { Calendar, Search, Download, Filter, DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';
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
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const AgentCommissions = ({ agentId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('6m');
  const [filterStatus, setFilterStatus] = useState('all');
  const [commissionHistory, setCommissionHistory] = useState([]);
  const [commissionSummary, setCommissionSummary] = useState({
    totalPaid: 0,
    totalPending: 0,
    monthlyAverage: 0,
    currentRate: '15-25%'
  });

  // Load commission data from localStorage
  useEffect(() => {
    loadCommissionData();
  }, [agentId]);

  const loadCommissionData = () => {
    try {
      const commissionsData = JSON.parse(localStorage.getItem('commissionsData') || '[]');
      const agentCommissions = commissionsData.filter(commission => 
        commission.agentId && commission.agentId.toString() === agentId.toString()
      );

      // If no commissions exist, generate sample data for the agent
      if (agentCommissions.length === 0) {
        const sampleCommissions = generateSampleCommissions(agentId);
        setCommissionHistory(sampleCommissions);
        calculateSummary(sampleCommissions);
      } else {
        setCommissionHistory(agentCommissions);
        calculateSummary(agentCommissions);
      }
    } catch (error) {
      console.error('Error loading commission data:', error);
      // Fallback to sample data
      const sampleCommissions = generateSampleCommissions(agentId);
      setCommissionHistory(sampleCommissions);
      calculateSummary(sampleCommissions);
    }
  };

  const generateSampleCommissions = (agentId) => {
    const sampleData = [
      {
        id: 'COM-25042501',
        invoiceId: 'INV-25042501',
        agentId: agentId,
        policyId: 'POL-2025-0125',
        commissionType: 'percentage',
        baseAmount: 25000,
        commissionRate: 15,
        commissionAmount: 3750,
        status: 'paid',
        calculatedDate: '2025-04-15',
        paidDate: '2025-04-20',
        policyType: 'Health Insurance',
        clientName: 'Vivek Patel',
        notes: 'Regular commission payment',
        createdBy: 'System'
      },
      {
        id: 'COM-25042502',
        invoiceId: 'INV-25042502',
        agentId: agentId,
        policyId: 'POL-2025-0132',
        commissionType: 'percentage',
        baseAmount: 20000,
        commissionRate: 20,
        commissionAmount: 4000,
        status: 'paid',
        calculatedDate: '2025-04-15',
        paidDate: '2025-04-18',
        policyType: 'Term Insurance',
        clientName: 'Vivek Patel',
        notes: 'Higher rate for term insurance',
        createdBy: 'System'
      },
      {
        id: 'COM-25042503',
        invoiceId: 'INV-25042503',
        agentId: agentId,
        policyId: 'POL-2025-0156',
        commissionType: 'percentage',
        baseAmount: 28500,
        commissionRate: 15,
        commissionAmount: 4275,
        status: 'paid',
        calculatedDate: '2025-04-12',
        paidDate: '2025-04-15',
        policyType: 'Health Insurance',
        clientName: 'Priya Desai',
        notes: 'New policy commission',
        createdBy: 'System'
      },
      {
        id: 'COM-25042504',
        invoiceId: 'INV-25042504',
        agentId: agentId,
        policyId: 'POL-2025-0178',
        commissionType: 'percentage',
        baseAmount: 85000,
        commissionRate: 15,
        commissionAmount: 12750,
        status: 'pending',
        calculatedDate: '2025-04-10',
        policyType: 'Group Health Insurance',
        clientName: 'Tech Solutions Ltd',
        notes: 'Corporate policy - pending approval',
        createdBy: 'System'
      },
      {
        id: 'COM-25042505',
        invoiceId: 'INV-25042505',
        agentId: agentId,
        policyId: 'POL-2025-0189',
        commissionType: 'percentage',
        baseAmount: 45000,
        commissionRate: 15,
        commissionAmount: 6750,
        status: 'pending',
        calculatedDate: '2025-04-08',
        policyType: 'Property Insurance',
        clientName: 'Tech Solutions Ltd',
        notes: 'Property insurance commission',
        createdBy: 'System'
      }
    ];

    // Store sample data
    const existingCommissions = JSON.parse(localStorage.getItem('commissionsData') || '[]');
    const updatedCommissions = [...existingCommissions, ...sampleData];
    localStorage.setItem('commissionsData', JSON.stringify(updatedCommissions));

    return sampleData;
  };

  const calculateSummary = (commissions) => {
    const paidCommissions = commissions.filter(c => c.status === 'paid');
    const pendingCommissions = commissions.filter(c => c.status === 'pending');

    const totalPaid = paidCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const totalPending = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    // Calculate monthly average (assuming data from last 6 months)
    const monthlyAverage = paidCommissions.length > 0 ? totalPaid / 6 : 0;

    setCommissionSummary({
      totalPaid,
      totalPending,
      monthlyAverage,
      currentRate: '15-25%'
    });
  };

  // Commission chart data
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

  // Filter commissions based on search and status
  const filteredCommissions = commissionHistory.filter(commission => {
    const matchesSearch = 
      commission.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.policyType?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || commission.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  const handleExportCommissions = () => {
    const csvContent = [
      ['Commission ID', 'Invoice ID', 'Date', 'Policy Type', 'Client', 'Base Amount', 'Rate (%)', 'Commission Amount', 'Status'],
      ...filteredCommissions.map(commission => [
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
  };

  const handleMarkAsPaid = (commissionId) => {
    const updatedCommissions = commissionHistory.map(commission => {
      if (commission.id === commissionId) {
        return {
          ...commission,
          status: 'paid',
          paidDate: new Date().toISOString().split('T')[0]
        };
      }
      return commission;
    });

    setCommissionHistory(updatedCommissions);
    
    // Update localStorage
    const allCommissions = JSON.parse(localStorage.getItem('commissionsData') || '[]');
    const updatedAllCommissions = allCommissions.map(commission => {
      if (commission.id === commissionId) {
        return {
          ...commission,
          status: 'paid',
          paidDate: new Date().toISOString().split('T')[0]
        };
      }
      return commission;
    });
    localStorage.setItem('commissionsData', JSON.stringify(updatedAllCommissions));
    
    calculateSummary(updatedCommissions);
    toast.success('Commission marked as paid');
  };

  return (
    <div className="space-y-6">
      {/* Commission Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Paid (MTD)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{formatCurrency(commissionSummary.totalPaid)}</div>
            <div className="text-xs text-gray-500 mt-1">Processed payments</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Pending Commission
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{formatCurrency(commissionSummary.totalPending)}</div>
            <div className="text-xs text-gray-500 mt-1">Awaiting processing</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Monthly Average
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{formatCurrency(commissionSummary.monthlyAverage)}</div>
            <div className="text-xs text-gray-500 mt-1">Last 6 months</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Commission Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{commissionSummary.currentRate}</div>
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
                placeholder="Search commissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full md:w-[200px]"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExportCommissions}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="amba-table">
            <thead>
              <tr>
                <th className="py-3 px-4 font-medium">Commission ID</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Invoice</th>
                <th className="py-3 px-4 font-medium">Policy Type</th>
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Base Amount</th>
                <th className="py-3 px-4 font-medium">Rate</th>
                <th className="py-3 px-4 font-medium">Commission</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-gray-500">
                    No commission records found matching your search criteria
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-500 font-mono text-sm">{commission.id}</td>
                    <td className="py-3 px-4 text-gray-500">{commission.calculatedDate}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-blue-600">{commission.invoiceId}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{commission.policyType || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">{commission.clientName || 'N/A'}</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(commission.baseAmount)}</td>
                    <td className="py-3 px-4 text-gray-600">{commission.commissionRate}%</td>
                    <td className="py-3 px-4 font-bold text-green-600">{formatCurrency(commission.commissionAmount)}</td>
                    <td className="py-3 px-4">{getStatusBadge(commission.status)}</td>
                    <td className="py-3 px-4">
                      {commission.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(commission.id)}
                          className="text-xs"
                        >
                          Mark Paid
                        </Button>
                      )}
                    </td>
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
