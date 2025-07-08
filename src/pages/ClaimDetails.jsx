import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Edit, 
  Calendar, 
  Trash2,
  ArrowLeft,
  Building,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import ClaimDocuments from '@/components/claims/ClaimDocuments';
import ClaimTimeline from '@/components/claims/ClaimTimeline';
import ClaimNotes from '@/components/claims/ClaimNotes';
import { formatCurrency } from '@/lib/utils';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { claimsApi } from '@/services/api/claimsApi';

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchClaimDetails = async () => {
      if (!id) {
        toast.error("Claim ID is required");
        navigate('/claims');
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching claim details for ID:', id);
        
        // Fetch claim details from API
        const response = await claimsApi.getClaimById(id);
        if (response) {
          // Ensure documents and timeline arrays exist
          const claimWithDefaults = {
            ...response,
            documents: response.documents || [],
            timeline: response.timeline || [],
            notes: response.notes || []
          };
          setClaim(claimWithDefaults);
        } else {
          throw new Error('Claim not found');
        }
      } catch (error) {
        console.error('Error fetching claim details:', error);
        toast.error(`Failed to load claim details: ${error.message}`);
        // Navigate back to claims list if claim not found
        navigate('/claims');
      } finally {
        setLoading(false);
      }
    };

    fetchClaimDetails();
  }, [id, navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'review':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'settled':
        return <Badge className="bg-emerald-100 text-emerald-800">Settled</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'withdrawn':
        return <Badge className="bg-gray-100 text-gray-800">Withdrawn</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleEditClaim = () => {
    navigate(`/claims/edit/${id}`);
  };

  const handleDeleteClaim = () => {
    // In a real app, call API to delete claim
    toast.success(`Claim ${claim.claimNumber} deleted successfully`);
    navigate('/claims');
  };

  const handleBackToList = () => {
    navigate('/claims');
  };

  const handleClientClick = () => {
    navigate(`/clients/${claim.clientId}`);
  };

  const handlePolicyClick = () => {
    navigate(`/policies/${claim.policyId}`);
  };

  // Show professional loading skeleton
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={handleBackToList} className="p-0 h-8 hover:bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Claims
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {claim?.claimNumber || 'Unknown Claim'}
          </h1>
          <div className="text-gray-500">
            {claim?.policyType || 'Unknown Type'} Claim - Filed on {claim?.dateOfFiling || 'Unknown Date'}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEditClaim} variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Edit Claim
          </Button>
          <Button onClick={() => setShowDeleteDialog(true)} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Claim Status</CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusBadge(claim?.status)}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Claim Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(claim?.claimAmount || 0)}</div>
            {claim?.approvedAmount !== null && (
              <div className={`text-sm ${claim.approvedAmount === 0 ? 'text-red-500' : 'text-green-600'}`}>
                Approved: {formatCurrency(claim.approvedAmount || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base font-medium">
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600" 
                onClick={handlePolicyClick}
              >
                {claim?.policyNumber || 'Unknown Policy'}
              </Button>
            </div>
            <div className="text-sm text-gray-500 font-mono">{claim?.insuranceCompanyPolicyNumber || 'Unknown'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600" 
                onClick={handleClientClick}
              >
                {claim?.clientName || 'Unknown Client'}
              </Button>
            </div>
            {claim?.memberName && claim.memberName !== "N/A" && <div className="text-sm text-gray-500">Member: {claim.memberName}</div>}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Claim Summary</CardTitle>
          <CardDescription>Overview of the claim information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Claim Reason</h3>
              <p>{claim.claimReason}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Incident</h3>
              <p className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-600" /> {claim.dateOfIncident}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Insurance Company</h3>
              <p className="flex items-center gap-1">
                <Building className="h-4 w-4 text-blue-600" /> {claim.insuranceCompany}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Insurance Company Claim ID</h3>
              <p className="font-mono">
                {claim.insuranceCompanyClaimId || 
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Not Generated Yet</span>
                }
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Claim Handler</h3>
              <p>{claim.claimHandler}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Handler Contact</h3>
              <p>{claim.handlerContact}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type-specific details */}
      {claim.policyType === 'Health Insurance' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Medical Details</CardTitle>
            <CardDescription>Hospital and treatment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Hospital Name</h3>
                <p>{claim.details.hospitalName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Hospital Address</h3>
                <p>{claim.details.hospitalAddress}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Admission Date</h3>
                <p>{claim.details.admissionDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Discharge Date</h3>
                <p>{claim.details.dischargeDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Room Category</h3>
                <p>{claim.details.roomCategory}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Treatment Type</h3>
                <p>{claim.details.treatmentType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Diagnosis</h3>
                <p>{claim.details.diagnosis}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Treatment</h3>
                <p>{claim.details.treatment}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Doctor Name</h3>
                <p>{claim.details.doctorName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Doctor Speciality</h3>
                <p>{claim.details.doctorSpeciality}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Cashless Claim</h3>
                <p>{claim.details.cashless ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Pre-Authorization</h3>
                <p>{claim.details.preAuthApproved ? 
                    `Approved (${formatCurrency(claim.details.preAuthAmount)})` : 'Not Required'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Billed Amount</h3>
                <p>{formatCurrency(claim.details.billedAmount)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Co-payment Required</h3>
                <p>{claim.details.copaymentRequired ? 
                    `Yes (${formatCurrency(claim.details.copaymentAmount)})` : 'No'}</p>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Medical History</h3>
                <p>{claim.details.medicalHistory}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {claim.policyType === 'Property Insurance' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Property Damage Details</CardTitle>
            <CardDescription>Information about the property and damage assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Property Address</h3>
                <p>{claim.details.propertyAddress}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Property Type</h3>
                <p>{claim.details.propertyType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Property Size</h3>
                <p>{claim.details.propertySize}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Damage Type</h3>
                <p>{claim.details.damageType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Affected Areas</h3>
                <p>{claim.details.affectedAreas}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Damage Extent</h3>
                <p>{claim.details.damageExtent}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Surveyor Name</h3>
                <p>{claim.details.surveyorName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Surveyor Contact</h3>
                <p>{claim.details.surveyorContact}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Survey Date</h3>
                <p>{claim.details.surveyDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Repair Cost</h3>
                <p>{formatCurrency(claim.details.estimatedRepairCost)}</p>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Survey Report</h3>
                <p>{claim.details.surveyReport}</p>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Prevention Measures Taken</h3>
                <p>{claim.details.preventionMeasuresTaken}</p>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Occupancy Status</h3>
                <p>{claim.details.occupancyStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different sections */}
      <Tabs defaultValue="documents" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="documents" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <ClaimDocuments claim={claim} setClaim={setClaim} />
        </TabsContent>

        <TabsContent value="timeline">
          <ClaimTimeline claim={claim} />
        </TabsContent>

        <TabsContent value="notes">
          <ClaimNotes claim={claim} setClaim={setClaim} />
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this claim?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete claim <strong>{claim.claimNumber}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClaim} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClaimDetails;
