
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ClaimsMobileView from './ClaimsMobileView';

const ClaimsTable = ({ filterParams, setFilterParams }) => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // In a real app, this would fetch claims from API
    // For now, we'll use mock data
    const mockClaims = [
      {
        id: 1,
        claimNumber: 'AMB-CLM-2025-0001',
        insuranceCompanyClaimId: 'INS-CLM-78512',
        policyNumber: 'POL-2025-0125',
        insuranceCompanyPolicyNumber: 'INS-001-20250125-H',
        clientName: 'Vivek Patel',
        clientId: 'AMB-CLI-2025-0001',
        memberName: 'Vivek Patel',
        policyType: 'Health Insurance',
        dateOfIncident: '12 Apr 2025',
        dateOfFiling: '14 Apr 2025',
        claimAmount: 75000,
        approvedAmount: 68500,
        status: 'approved',
        documents: 8,
        hospitalName: 'Apollo Hospital',
        admissionDate: '12 Apr 2025',
        dischargeDate: '14 Apr 2025',
        diagnosis: 'Acute Appendicitis',
        treatment: 'Laparoscopic Appendectomy'
      },
      {
        id: 2,
        claimNumber: 'AMB-CLM-2025-0002',
        insuranceCompanyClaimId: 'STAR-CLM-12345',
        policyNumber: 'POL-2025-0156',
        insuranceCompanyPolicyNumber: 'STAR-H-A091238',
        clientName: 'Priya Desai',
        clientId: 'AMB-CLI-2025-0012',
        memberName: 'Rahul Desai',
        policyType: 'Health Insurance',
        dateOfIncident: '05 May 2025',
        dateOfFiling: '07 May 2025',
        claimAmount: 125000,
        approvedAmount: null,
        status: 'pending',
        documents: 6,
        hospitalName: 'Fortis Hospital',
        admissionDate: '05 May 2025',
        dischargeDate: '06 May 2025',
        diagnosis: 'Kidney Stone',
        treatment: 'Lithotripsy'
      },
      {
        id: 3,
        claimNumber: 'AMB-CLM-2025-0003',
        insuranceCompanyClaimId: 'BAJA-CLM-56789',
        policyNumber: 'POL-2025-0189',
        insuranceCompanyPolicyNumber: 'BAJA-P-112233',
        clientName: 'Tech Solutions Ltd',
        clientId: 'AMB-CLI-2025-0024',
        memberName: 'Property Insurance',
        policyType: 'Property Insurance',
        dateOfIncident: '18 Mar 2025',
        dateOfFiling: '20 Mar 2025',
        claimAmount: 950000,
        approvedAmount: 850000,
        status: 'settled',
        documents: 12,
        propertyAddress: '123 Tech Park, Mumbai',
        damageType: 'Fire Damage',
        affectedAreas: 'Server Room, 2nd Floor',
        surveyorName: 'Rajesh Gupta',
        surveyDate: '22 Mar 2025'
      },
      {
        id: 4,
        claimNumber: 'AMB-CLM-2025-0004',
        insuranceCompanyClaimId: null,
        policyNumber: 'POL-2025-0215',
        insuranceCompanyPolicyNumber: 'ICICI-L-332211',
        clientName: 'Arjun Singh',
        clientId: 'AMB-CLI-2025-0035',
        memberName: 'Arjun Singh',
        policyType: 'Term Insurance',
        dateOfIncident: '24 Apr 2025',
        dateOfFiling: '26 Apr 2025',
        claimAmount: 5000000,
        approvedAmount: null,
        status: 'review',
        documents: 10,
        deathDate: '24 Apr 2025',
        deathCause: 'Heart Attack',
        nomineeDetails: 'Kavita Singh (Wife)',
        nomineeContact: '+91 98765 43210'
      },
      {
        id: 5,
        claimNumber: 'AMB-CLM-2025-0005',
        insuranceCompanyClaimId: 'CARA-CLM-98765',
        policyNumber: 'POL-2025-0178',
        insuranceCompanyPolicyNumber: 'CARA-GH-09823',
        clientName: 'Tech Solutions Ltd',
        clientId: 'AMB-CLI-2025-0024',
        memberName: 'Kiran Shah',
        policyType: 'Health Insurance',
        dateOfIncident: '16 Mar 2025',
        dateOfFiling: '18 Mar 2025',
        claimAmount: 45000,
        approvedAmount: 0,
        status: 'rejected',
        documents: 5,
        hospitalName: 'City Hospital',
        admissionDate: '16 Mar 2025',
        dischargeDate: '17 Mar 2025',
        diagnosis: 'Viral Fever',
        treatment: 'Medication and IV Fluids',
        rejectionReason: 'Pre-existing condition not disclosed'
      }
    ];
    
    setTimeout(() => {
      setClaims(mockClaims);
      setLoading(false);
    }, 500);
  }, []);

  // Filter claims based on the filter parameters
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.claimNumber.toLowerCase().includes(filterParams.searchTerm.toLowerCase()) ||
      claim.clientName.toLowerCase().includes(filterParams.searchTerm.toLowerCase()) ||
      claim.memberName.toLowerCase().includes(filterParams.searchTerm.toLowerCase()) ||
      (claim.insuranceCompanyClaimId && claim.insuranceCompanyClaimId.toLowerCase().includes(filterParams.searchTerm.toLowerCase()));
    
    const matchesStatus = filterParams.status === 'all' || claim.status === filterParams.status;
    const matchesType = filterParams.policyType === 'all' || claim.policyType.includes(filterParams.policyType);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleRowClick = (claimId) => {
    navigate(`/claims/${claimId}`);
  };

  // Get appropriate status badge based on claim status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'review':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'settled':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Settled</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case 'withdrawn':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Withdrawn</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center">
          <div className="text-sm text-gray-500">
            Total Claims: {claims.length} | 
            Pending: {claims.filter(c => c.status === 'pending' || c.status === 'review').length} | 
            Approved: {claims.filter(c => c.status === 'approved' || c.status === 'settled').length} | 
            Rejected: {claims.filter(c => c.status === 'rejected').length}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search claims..."
              value={filterParams.searchTerm}
              onChange={(e) => setFilterParams({...filterParams, searchTerm: e.target.value})}
              className="pl-9 w-full"
            />
          </div>

          {/* Policy Type Filter */}
          <div className="flex items-center w-full sm:w-auto">
            <Filter size={16} className="mr-1 text-gray-500" />
            <Select
              value={filterParams.policyType}
              onValueChange={(value) => setFilterParams({...filterParams, policyType: value})}
            >
              <SelectTrigger className="w-full">
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
          <div className="flex items-center w-full sm:w-auto">
            <Filter size={16} className="mr-1 text-gray-500" />
            <Select
              value={filterParams.status}
              onValueChange={(value) => setFilterParams({...filterParams, status: value})}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Claims display - Table for desktop, Cards for mobile */}
      {isMobile ? (
        <ClaimsMobileView claims={claims} filterParams={filterParams} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Insurance Claim #</TableHead>
                  <TableHead>Policy Details</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Incident Date</TableHead>
                  <TableHead>Claim Amount</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="8" className="py-8 text-center text-gray-500">
                      No claims found matching your search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((claim) => (
                    <TableRow 
                      key={claim.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(claim.id)}
                    >
                      <TableCell>
                        <div className="font-medium">{claim.claimNumber}</div>
                        <div className="text-xs text-gray-500">{claim.policyType}</div>
                      </TableCell>
                      <TableCell>
                        {claim.insuranceCompanyClaimId ? (
                          <div className="font-mono text-blue-700">{claim.insuranceCompanyClaimId}</div>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Not Generated</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{claim.policyNumber}</div>
                        <div className="text-xs font-mono text-gray-500">{claim.insuranceCompanyPolicyNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{claim.clientName}</div>
                        <div className="text-xs text-gray-500">Member: {claim.memberName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          <span>{claim.dateOfIncident}</span>
                        </div>
                        <div className="text-xs text-gray-500">Filed: {claim.dateOfFiling}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{formatCurrency(claim.claimAmount)}</div>
                        {claim.approvedAmount !== null && (
                          <div className={`text-xs ${claim.approvedAmount === 0 ? 'text-red-500' : 'text-green-600'}`}>
                            Approved: {formatCurrency(claim.approvedAmount)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-blue-600">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>{claim.documents}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(claim.status)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsTable;
