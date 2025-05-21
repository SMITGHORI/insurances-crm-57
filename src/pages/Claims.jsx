
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Calendar, 
  Bell, 
  Plus, 
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Link,
  FileSearch
} from 'lucide-react';
import { toast } from 'sonner';

const Claims = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Get the claims data from localStorage or use the sample data
  useEffect(() => {
    setLoading(true);
    
    // Try to get claims from localStorage
    const storedClaimsData = localStorage.getItem('claimsData');
    let claimsList = [];
    
    if (storedClaimsData) {
      claimsList = JSON.parse(storedClaimsData);
    } else {
      // Sample claims data
      claimsList = [
        {
          id: 1,
          claimId: 'AMB-CLM-2025-0001',
          type: 'Health Insurance',
          status: 'Under Review',
          policy: {
            id: 1,
            policyNumber: 'AMB-POL-2025-0001',
            insurerPolicyNumber: 'STAR-H-12345678',
            insuranceCompany: 'Star Health',
            planName: 'Family Health Optima'
          },
          client: {
            id: 1,
            name: 'Rahul Sharma',
            contact: '9876543210'
          },
          member: {
            id: 1,
            memberId: 'MBR-AMB-POL-2025-0001-01',
            name: 'Rahul Sharma',
            relation: 'Self'
          },
          dateOfIncident: '2025-03-15',
          dateOfFiling: '2025-03-20',
          amountClaimed: '125000',
          amountApproved: null,
          reason: 'Hospitalization due to fever and pneumonia',
          hospitalName: 'Apollo Hospitals',
          hospitalizationPeriod: '7 days',
          diagnosis: 'Acute pneumonia',
          treatingDoctor: 'Dr. Anil Kumar',
          documents: [
            { type: 'Hospital Bills', status: 'Uploaded', file: null, comments: null },
            { type: 'Medical Reports', status: 'Uploaded', file: null, comments: null },
            { type: 'Prescription', status: 'Uploaded', file: null, comments: null },
            { type: 'Discharge Summary', status: 'Uploaded', file: null, comments: null }
          ],
          history: [
            {
              action: 'Claim Filed',
              by: 'Admin',
              timestamp: '2025-03-20T10:00:00',
              details: 'Initial claim submission'
            },
            {
              action: 'Documents Validated',
              by: 'Admin',
              timestamp: '2025-03-22T14:30:00',
              details: 'All required documents received and validated'
            },
            {
              action: 'Sent to Insurance Company',
              by: 'Admin',
              timestamp: '2025-03-23T09:15:00',
              details: 'Claim forwarded to Star Health for processing'
            }
          ],
          notes: [
            {
              text: 'Called Star Health to check claim status - they confirmed receipt',
              by: 'Admin',
              timestamp: '2025-03-25T11:20:00'
            }
          ],
          expectedResolutionDate: '2025-04-10'
        },
        {
          id: 2,
          claimId: 'AMB-CLM-2025-0002',
          type: 'Motor Insurance',
          status: 'Approved',
          policy: {
            id: 2,
            policyNumber: 'AMB-POL-2025-0002',
            insurerPolicyNumber: 'ICICI-M-87654321',
            insuranceCompany: 'ICICI Lombard',
            planName: 'Commercial Vehicle Insurance'
          },
          client: {
            id: 2,
            name: 'Tech Solutions Ltd',
            contact: '9876543211'
          },
          member: null, // No member for vehicle insurance
          dateOfIncident: '2025-02-10',
          dateOfFiling: '2025-02-12',
          amountClaimed: '45000',
          amountApproved: '42000',
          reason: 'Minor accident resulting in front bumper damage',
          accidentLocation: 'MG Road, Bangalore',
          policeReportFiled: 'Yes',
          policeReportNumber: 'FIR-2025-1234',
          vehicleDetails: {
            registrationNumber: 'KA-01-AB-1234',
            model: 'Toyota Innova',
            damageDetails: 'Front bumper and headlight damage'
          },
          repairWorkshop: 'Toyota Authorized Workshop, Bangalore',
          documents: [
            { type: 'Accident Photos', status: 'Uploaded', file: null, comments: null },
            { type: 'Police Report', status: 'Uploaded', file: null, comments: null },
            { type: 'Repair Estimate', status: 'Uploaded', file: null, comments: null },
            { type: 'Driving License', status: 'Uploaded', file: null, comments: null }
          ],
          history: [
            {
              action: 'Claim Filed',
              by: 'Admin',
              timestamp: '2025-02-12T15:30:00',
              details: 'Initial claim submission'
            },
            {
              action: 'Surveyor Appointed',
              by: 'ICICI Lombard',
              timestamp: '2025-02-14T10:45:00',
              details: 'Mr. Suresh appointed as surveyor'
            },
            {
              action: 'Survey Completed',
              by: 'Surveyor',
              timestamp: '2025-02-16T11:00:00',
              details: 'Damage assessment completed'
            },
            {
              action: 'Claim Approved',
              by: 'ICICI Lombard',
              timestamp: '2025-02-25T14:15:00',
              details: 'Claim approved for ₹42,000'
            }
          ],
          notes: [
            {
              text: 'Informed client about claim approval and next steps',
              by: 'Admin',
              timestamp: '2025-02-26T09:30:00'
            }
          ],
          expectedResolutionDate: '2025-03-05',
          paymentDate: '2025-02-28',
          paymentMethod: 'Bank Transfer',
          paymentReference: 'ICICI-PAY-12345'
        },
        {
          id: 3,
          claimId: 'AMB-CLM-2025-0003',
          type: 'Life Insurance',
          status: 'In Progress',
          policy: {
            id: 3,
            policyNumber: 'AMB-POL-2025-0003',
            insurerPolicyNumber: 'LIC-L-56781234',
            insuranceCompany: 'LIC',
            planName: 'Jeevan Anand'
          },
          client: {
            id: 1,
            name: 'Rahul Sharma',
            contact: '9876543210'
          },
          member: null, // Self policy
          dateOfIncident: '2025-01-20', // Diagnosis date
          dateOfFiling: '2025-01-25',
          amountClaimed: '500000',
          amountApproved: null,
          reason: 'Critical Illness Benefit claim - Early stage cancer diagnosis',
          diagnosis: 'Stage 1 Colon Cancer',
          treatingDoctor: 'Dr. Priya Mehta',
          hospitalName: 'Max Healthcare',
          documents: [
            { type: 'Medical Reports', status: 'Uploaded', file: null, comments: null },
            { type: 'Doctor Certificate', status: 'Uploaded', file: null, comments: null },
            { type: 'Policy Document', status: 'Uploaded', file: null, comments: null },
            { type: 'Pathology Reports', status: 'Uploaded', file: null, comments: null }
          ],
          history: [
            {
              action: 'Claim Filed',
              by: 'Admin',
              timestamp: '2025-01-25T16:20:00',
              details: 'Critical illness claim submission'
            },
            {
              action: 'Documents Verified',
              by: 'Admin',
              timestamp: '2025-01-30T11:40:00',
              details: 'All documents verified and found complete'
            },
            {
              action: 'Medical Board Review',
              by: 'LIC',
              timestamp: '2025-02-15T09:30:00',
              details: 'Case forwarded to medical board for review'
            }
          ],
          notes: [
            {
              text: 'Client called to inquire about timeframe - advised typically 30-45 days for critical illness claims',
              by: 'Admin',
              timestamp: '2025-02-05T14:10:00'
            }
          ],
          expectedResolutionDate: '2025-03-15'
        }
      ];
      
      // Save sample data to localStorage
      localStorage.setItem('claimsData', JSON.stringify(claimsList));
    }
    
    setClaims(claimsList);
    setLoading(false);
  }, []);

  // Filter claims based on search query and active tab
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      (claim.claimId?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (claim.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (claim.policy?.policyNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (claim.policy?.insurerPolicyNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (claim.type?.toLowerCase().includes(searchQuery.toLowerCase()) || '');
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && (claim.status === 'Pending' || claim.status === 'Under Review' || claim.status === 'In Progress');
    if (activeTab === 'approved') return matchesSearch && claim.status === 'Approved';
    if (activeTab === 'rejected') return matchesSearch && claim.status === 'Rejected';
    
    return matchesSearch;
  });

  const handleCreateClaim = () => {
    navigate('/claims/create');
  };

  const handleViewClaim = (id) => {
    navigate(`/claims/${id}`);
  };

  // Get badge color based on claim status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Under Review':
      case 'In Progress':
        return <FileSearch className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleViewPolicy = (e, policyId) => {
    e.stopPropagation(); // Prevent triggering the row click
    navigate(`/policies/${policyId}`);
  };

  const handleViewClient = (e, clientId) => {
    e.stopPropagation(); // Prevent triggering the row click
    navigate(`/clients/${clientId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Claims Management</h1>
        <Button 
          onClick={handleCreateClaim}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="mr-1 h-4 w-4" /> New Claim
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search claims by ID, client name, policy number..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              All Claims
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center">
              <XCircle className="mr-2 h-4 w-4" />
              Rejected
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Policy Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Filing Date</TableHead>
                <TableHead>Amount Claimed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected Resolution</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.length > 0 ? (
                filteredClaims.map((claim) => (
                  <TableRow 
                    key={claim.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewClaim(claim.id)}
                  >
                    <TableCell className="font-medium">{claim.claimId}</TableCell>
                    <TableCell>
                      <div 
                        className="flex items-center text-primary hover:underline cursor-pointer"
                        onClick={(e) => handleViewClient(e, claim.client.id)}
                      >
                        <Link className="h-4 w-4 mr-1" />
                        {claim.client.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="flex items-center text-primary hover:underline cursor-pointer"
                        onClick={(e) => handleViewPolicy(e, claim.policy.id)}
                      >
                        <Link className="h-4 w-4 mr-1" />
                        {claim.policy.policyNumber}
                      </div>
                    </TableCell>
                    <TableCell>{claim.type}</TableCell>
                    <TableCell>{new Date(claim.dateOfFiling).toLocaleDateString()}</TableCell>
                    <TableCell>₹{parseInt(claim.amountClaimed).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(claim.status)}
                        <Badge className={getStatusBadgeClass(claim.status)}>
                          {claim.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {claim.expectedResolutionDate ? 
                        new Date(claim.expectedResolutionDate).toLocaleDateString() : 
                        'Not set'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/claims/edit/${claim.id}`);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No claims found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Claims;
