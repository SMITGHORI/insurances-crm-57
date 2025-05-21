
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, User, Building } from 'lucide-react';

const AgentPoliciesTable = ({ policies, agentId }) => {
  const navigate = useNavigate();
  
  // In a real application, you would filter policies by agent ID
  // But for now, we'll just show the policies that were passed in
  
  const handleViewPolicy = (id) => {
    navigate(`/policies/${id}`);
  };
  
  // Utility function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Force':
        return 'amba-badge-green';
      case 'Proposal':
        return 'amba-badge-blue';
      case 'Grace':
        return 'amba-badge-yellow';
      case 'Lapsed':
      case 'Cancelled':
        return 'amba-badge-red';
      case 'Surrendered':
      case 'Matured':
        return 'amba-badge-purple';
      default:
        return 'amba-badge-blue';
    }
  };
  
  return (
    <div>
      {policies.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No policies sold by this agent yet.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy Number</TableHead>
              <TableHead>Insurance Co. Ref</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    {policy.policyNumber}
                  </div>
                </TableCell>
                <TableCell>
                  {policy.insurerPolicyNumber || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1 text-gray-500" />
                    {policy.insuranceCompany || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    {policy.client.name}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`amba-badge ${getStatusBadgeClass(policy.status)}`}>
                    {policy.status}
                  </span>
                </TableCell>
                <TableCell>₹{parseInt(policy.premium).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {new Date(policy.endDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  {policy.members?.length || 0}
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleViewPolicy(policy.id)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AgentPoliciesTable;
