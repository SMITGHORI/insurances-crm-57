
import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const AgentPolicies = ({ agentId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Sample data - in a real app, this would be fetched from an API based on agentId
  const policies = [
    {
      id: 1,
      policyId: 'POL-2025-0125',
      insuranceCompanyPolicyNumber: 'INS-001-20250125-H',
      policyType: 'Health Insurance',
      clientName: 'Vivek Patel',
      clientId: 'AMB-CLI-2025-0001',
      startDate: '15 Jan 2025',
      endDate: '14 Jan 2026',
      premium: '₹25,000',
      commissionEarned: '₹3,750',
      status: 'active'
    },
    {
      id: 2,
      policyId: 'POL-2025-0132',
      insuranceCompanyPolicyNumber: 'HDFC-TL-577123',
      policyType: 'Term Insurance',
      clientName: 'Vivek Patel',
      clientId: 'AMB-CLI-2025-0001',
      startDate: '22 Feb 2025',
      endDate: '21 Feb 2030',
      premium: '₹20,000',
      commissionEarned: '₹4,000',
      status: 'active'
    },
    {
      id: 3,
      policyId: 'POL-2025-0156',
      insuranceCompanyPolicyNumber: 'STAR-H-A091238',
      policyType: 'Health Insurance',
      clientName: 'Priya Desai',
      clientId: 'AMB-CLI-2025-0012',
      startDate: '05 Mar 2025',
      endDate: '04 Mar 2026',
      premium: '₹28,500',
      commissionEarned: '₹4,275',
      status: 'active'
    },
    {
      id: 4,
      policyId: 'POL-2025-0178',
      insuranceCompanyPolicyNumber: 'CARA-GH-09823',
      policyType: 'Group Health Insurance',
      clientName: 'Tech Solutions Ltd',
      clientId: 'AMB-CLI-2025-0024',
      startDate: '15 Mar 2025',
      endDate: '14 Mar 2026',
      premium: '₹85,000',
      commissionEarned: '₹12,750',
      status: 'active'
    },
    {
      id: 5,
      policyId: 'POL-2025-0189',
      insuranceCompanyPolicyNumber: 'BAJA-P-112233',
      policyType: 'Property Insurance',
      clientName: 'Tech Solutions Ltd',
      clientId: 'AMB-CLI-2025-0024',
      startDate: '22 Mar 2025',
      endDate: '21 Mar 2026',
      premium: '₹45,000',
      commissionEarned: '₹6,750',
      status: 'active'
    },
    {
      id: 6,
      policyId: 'POL-2025-0201',
      insuranceCompanyPolicyNumber: null,
      policyType: 'Vehicle Fleet Insurance',
      clientName: 'Tech Solutions Ltd',
      clientId: 'AMB-CLI-2025-0024',
      startDate: '02 Apr 2025',
      endDate: '01 Apr 2026',
      premium: '₹35,000',
      commissionEarned: '₹5,250',
      status: 'pending'
    },
    {
      id: 7,
      policyId: 'POL-2025-0215',
      insuranceCompanyPolicyNumber: 'ICICI-L-332211',
      policyType: 'Term Insurance',
      clientName: 'Arjun Singh',
      clientId: 'AMB-CLI-2025-0035',
      startDate: '12 Apr 2025',
      endDate: '11 Apr 2030',
      premium: '₹18,000',
      commissionEarned: '₹3,600',
      status: 'active'
    },
    {
      id: 8,
      policyId: 'POL-2025-0243',
      insuranceCompanyPolicyNumber: 'APOS-H-987654',
      policyType: 'Health Insurance',
      clientName: 'Arjun Singh',
      clientId: 'AMB-CLI-2025-0035',
      startDate: '28 Apr 2025',
      endDate: '27 Apr 2026',
      premium: '₹32,000',
      commissionEarned: '₹4,800',
      status: 'active'
    },
  ];

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.policyId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         policy.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (policy.insuranceCompanyPolicyNumber && policy.insuranceCompanyPolicyNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || policy.policyType.includes(filterType);
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Expired</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{status}</Badge>;
    }
  };

  const handleRowClick = (policyId) => {
    navigate(`/policies/${policyId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center">
          <div className="text-sm text-gray-500">
            Total Policies: {policies.length} | Active: {policies.filter(p => p.status === 'active').length}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full md:w-[250px]"
            />
          </div>

          {/* Policy Type Filter */}
          <div className="flex items-center">
            <Filter size={16} className="mr-1 text-gray-500" />
            <Select
              value={filterType}
              onValueChange={setFilterType}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Policy Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Health">Health Insurance</SelectItem>
                <SelectItem value="Term">Term Insurance</SelectItem>
                <SelectItem value="Vehicle">Vehicle Insurance</SelectItem>
                <SelectItem value="Property">Property Insurance</SelectItem>
                <SelectItem value="Group">Group Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center">
            <Filter size={16} className="mr-1 text-gray-500" />
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="amba-table">
            <thead>
              <tr>
                <th className="py-3 px-4 font-medium">Internal ID</th>
                <th className="py-3 px-4 font-medium">Insurance Policy #</th>
                <th className="py-3 px-4 font-medium">Policy Type</th>
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Period</th>
                <th className="py-3 px-4 font-medium">Premium</th>
                <th className="py-3 px-4 font-medium">Commission</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    No policies found matching your search criteria
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr 
                    key={policy.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(policy.id)}
                  >
                    <td className="py-3 px-4 text-gray-500">{policy.policyId}</td>
                    <td className="py-3 px-4 font-mono">
                      {policy.insuranceCompanyPolicyNumber || 
                        <span className="text-xs text-amber-600">Pending</span>}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{policy.policyType}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{policy.clientName}</div>
                      <div className="text-xs text-gray-500">{policy.clientId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-500">{policy.startDate}</div>
                      <div className="text-gray-500">to {policy.endDate}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{policy.premium}</td>
                    <td className="py-3 px-4 text-gray-500">{policy.commissionEarned}</td>
                    <td className="py-3 px-4">{getStatusBadge(policy.status)}</td>
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

export default AgentPolicies;
