
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Upload,
  Clock,
  Calendar,
  Edit,
  Download,
  Link,
  User,
  Info,
  StickyNote,
  Building,
  FileSearch,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ClaimDocuments from '../components/claims/ClaimDocuments';
import ClaimHistory from '../components/claims/ClaimHistory';
import ClaimNotes from '../components/claims/ClaimNotes';

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setLoading(true);
    
    // Try to get claims from localStorage
    const storedClaimsData = localStorage.getItem('claimsData');
    let claimsList = [];
    
    if (storedClaimsData) {
      claimsList = JSON.parse(storedClaimsData);
    }
    
    // Find the claim by id
    const foundClaim = claimsList.find(c => c.id === parseInt(id));
    
    if (foundClaim) {
      setClaim(foundClaim);
    } else {
      toast.error(`Claim with ID ${id} not found`);
      navigate('/claims');
    }
    
    setLoading(false);
  }, [id, navigate]);

  const handleEditClaim = () => {
    navigate(`/claims/edit/${id}`);
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
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'Under Review':
      case 'In Progress':
        return <FileSearch className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderTypeSpecificDetails = () => {
    if (!claim) return null;
    
    if (claim.type === 'Health Insurance') {
      return (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" /> Health Insurance Claim Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Hospital Name</h3>
                <p>{claim.hospitalName || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Hospitalization Period</h3>
                <p>{claim.hospitalizationPeriod || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Diagnosis</h3>
                <p>{claim.diagnosis || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Treating Doctor</h3>
                <p>{claim.treatingDoctor || 'Not specified'}</p>
              </div>
              {claim.member && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Member</h3>
                  <p>{claim.member.name} ({claim.member.relation})</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Pre-existing Condition</h3>
                <p>{claim.preExistingCondition ? 'Yes' : 'No'}</p>
              </div>
              {claim.cashless !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Cashless/Reimbursement</h3>
                  <p>{claim.cashless ? 'Cashless' : 'Reimbursement'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    } else if (claim.type === 'Motor Insurance') {
      return (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-amber-600" /> Motor Insurance Claim Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Accident Location</h3>
                <p>{claim.accidentLocation || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Police Report Filed</h3>
                <p>{claim.policeReportFiled || 'No'}</p>
              </div>
              {claim.policeReportNumber && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Police Report Number</h3>
                  <p>{claim.policeReportNumber}</p>
                </div>
              )}
              {claim.vehicleDetails && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Registration Number</h3>
                    <p>{claim.vehicleDetails.registrationNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Vehicle Model</h3>
                    <p>{claim.vehicleDetails.model || 'Not specified'}</p>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Damage Details</h3>
                    <p>{claim.vehicleDetails.damageDetails || 'Not specified'}</p>
                  </div>
                </>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Repair Workshop</h3>
                <p>{claim.repairWorkshop || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Surveyor Name</h3>
                <p>{claim.surveyorName || 'Not assigned yet'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (claim.type === 'Life Insurance') {
      return (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" /> Life Insurance Claim Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nature of Claim</h3>
                <p>{claim.claimNature || 'Critical Illness'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Diagnosis</h3>
                <p>{claim.diagnosis || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Treating Doctor</h3>
                <p>{claim.treatingDoctor || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Hospital Name</h3>
                <p>{claim.hospitalName || 'Not applicable'}</p>
              </div>
              {claim.disabilityPercentage && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Disability Percentage</h3>
                  <p>{claim.disabilityPercentage}%</p>
                </div>
              )}
              {claim.claimNature === 'Death' && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Death</h3>
                    <p>{new Date(claim.dateOfDeath).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Cause of Death</h3>
                    <p>{claim.causeOfDeath}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  if (loading || !claim) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Claim: {claim.claimId}
          </h1>
          <div className="flex items-center text-gray-500 gap-1">
            {claim.type} - 
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600 px-1" 
              onClick={() => navigate(`/policies/${claim.policy.id}`)}
            >
              <Link className="h-4 w-4 mr-1" /> {claim.policy.policyNumber}
            </Button>
            -
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600" 
              onClick={() => navigate(`/clients/${claim.client.id}`)}
            >
              <User className="h-4 w-4 mr-1" /> {claim.client.name}
            </Button>
          </div>
        </div>
        <Button onClick={handleEditClaim}>
          <Edit className="mr-2 h-4 w-4" /> Edit Claim
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-500">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(claim.status)}
              <Badge className={getStatusBadgeClass(claim.status)}>
                {claim.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Amount Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{parseInt(claim.amountClaimed).toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {claim.status === 'Approved' ? 'Amount Approved' : 'Expected Resolution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {claim.status === 'Approved' && claim.amountApproved ? (
              <div className="text-2xl font-bold">₹{parseInt(claim.amountApproved).toLocaleString()}</div>
            ) : (
              <div className="text-lg">
                {claim.expectedResolutionDate ? 
                  new Date(claim.expectedResolutionDate).toLocaleDateString() : 
                  'Not specified'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Type-specific details section */}
      {renderTypeSpecificDetails()}

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Claim Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Incident</h3>
              <p>{new Date(claim.dateOfIncident).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Filing</h3>
              <p>{new Date(claim.dateOfFiling).toLocaleDateString()}</p>
            </div>
            {claim.status === 'Approved' && claim.paymentDate && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Date</h3>
                  <p>{new Date(claim.paymentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
                  <p>{claim.paymentMethod}</p>
                </div>
                {claim.paymentReference && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Reference</h3>
                    <p>{claim.paymentReference}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="flex items-center">
            <Info className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center">
            <StickyNote className="mr-2 h-4 w-4" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Claim Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Claim ID</h3>
                  <p>{claim.claimId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Claim Type</h3>
                  <p>{claim.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Insurance Company</h3>
                  <p className="flex items-center gap-1">
                    <Building className="h-4 w-4 text-blue-600" />
                    {claim.policy.insuranceCompany}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Policy Number (Insurer)</h3>
                  <p className="font-semibold">{claim.policy.insurerPolicyNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Plan Name</h3>
                  <p>{claim.policy.planName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                  <p className="cursor-pointer text-primary hover:underline flex items-center gap-1" 
                     onClick={() => navigate(`/clients/${claim.client.id}`)}>
                    <User className="h-4 w-4" />
                    {claim.client.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Client Contact</h3>
                  <p>{claim.client.contact}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(claim.status)}
                    <Badge className={getStatusBadgeClass(claim.status)}>
                      {claim.status}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Reason for Claim</h3>
                  <p className="whitespace-pre-wrap">{claim.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <ClaimDocuments claim={claim} setClaim={setClaim} />
        </TabsContent>

        <TabsContent value="history">
          <ClaimHistory claim={claim} />
        </TabsContent>

        <TabsContent value="notes">
          <ClaimNotes claim={claim} setClaim={setClaim} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimDetails;
