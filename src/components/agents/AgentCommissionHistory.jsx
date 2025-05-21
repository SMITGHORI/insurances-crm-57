
import React, { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Download, CheckCircle, Clock } from 'lucide-react';

const AgentCommissionHistory = ({ agentId }) => {
  // In a real application, you would fetch commission history from an API
  // For now we'll generate some sample data
  
  const currentDate = new Date();
  
  const generateCommissionData = (agentId) => {
    const baseAmount = (agentId % 3 === 0) ? 8500 : 12000;
    const commissions = [];
    
    // Generate commission entries for the last few months
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      
      // Generate random variance in commission amount
      const variance = Math.random() * 5000 - 2500;
      
      commissions.push({
        id: `COMM-${date.getFullYear()}-${date.getMonth() + 1}-${agentId}`,
        policyNumber: `AMB-POL-${date.getFullYear()}-${1000 + i + (agentId * 10)}`,
        date: date.toISOString(),
        amount: Math.max(1000, Math.round(baseAmount + variance)),
        status: i === 0 ? 'Pending' : (Math.random() > 0.2 ? 'Paid' : 'Processing'),
        paymentDate: i === 0 ? null : new Date(date.getTime() + (Math.random() * 10 * 24 * 60 * 60 * 1000)).toISOString(),
        type: Math.random() > 0.7 ? 'Renewal' : 'New Policy',
        tds: Math.round((baseAmount + variance) * 0.1) // 10% TDS
      });
    }
    
    return commissions;
  };
  
  const [commissions] = useState(generateCommissionData(agentId));
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'amba-badge-green';
      case 'Processing':
        return 'amba-badge-yellow';
      case 'Pending':
        return 'amba-badge-blue';
      case 'Failed':
        return 'amba-badge-red';
      default:
        return 'amba-badge-gray';
    }
  };

  const getTotalCommission = (status = null) => {
    return commissions
      .filter(comm => status === null || comm.status === status)
      .reduce((sum, comm) => sum + comm.amount, 0);
  };
  
  const downloadCommissionStatement = () => {
    // This would generate a CSV or PDF in a real application
    // For now, we'll just show an alert
    alert('Commission statement download started');
  };
  
  return (
    <div>
      {/* Commission Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Total Commission</h3>
          <p className="text-2xl font-bold text-blue-700">₹{getTotalCommission().toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">All time</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Paid Commission</h3>
          <p className="text-2xl font-bold text-green-700">₹{getTotalCommission('Paid').toLocaleString()}</p>
          <div className="flex items-center text-xs text-green-600 mt-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>Processed</span>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">Pending Commission</h3>
          <p className="text-2xl font-bold text-yellow-700">₹{(getTotalCommission('Pending') + getTotalCommission('Processing')).toLocaleString()}</p>
          <div className="flex items-center text-xs text-yellow-600 mt-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>Awaiting processing</span>
          </div>
        </div>
      </div>

      {/* Commission Download Button */}
      <div className="flex justify-end p-5 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={downloadCommissionStatement}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Statement
        </Button>
      </div>

      {/* Commission History Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Commission ID</TableHead>
            <TableHead>Policy</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>TDS</TableHead>
            <TableHead>Net Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No commission history available.
              </TableCell>
            </TableRow>
          ) : (
            commissions.map((comm) => (
              <TableRow key={comm.id}>
                <TableCell>{comm.id}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    {comm.policyNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`amba-badge ${comm.type === 'Renewal' ? 'amba-badge-purple' : 'amba-badge-blue'}`}>
                    {comm.type}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {new Date(comm.date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="font-medium">₹{comm.amount.toLocaleString()}</TableCell>
                <TableCell className="text-gray-600">₹{comm.tds.toLocaleString()}</TableCell>
                <TableCell className="font-medium">₹{(comm.amount - comm.tds).toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`amba-badge ${getStatusBadgeClass(comm.status)}`}>
                    {comm.status}
                  </span>
                </TableCell>
                <TableCell>
                  {comm.paymentDate ? new Date(comm.paymentDate).toLocaleDateString() : '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AgentCommissionHistory;
