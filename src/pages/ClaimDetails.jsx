
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
  Check,
  X,
  Clock,
  BarChart,
  MessageCircle,
  Upload,
  Download,
  User,
  Clipboard,
  Building,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import ClaimDocuments from '@/components/claims/ClaimDocuments';
import ClaimTimeline from '@/components/claims/ClaimTimeline';
import ClaimNotes from '@/components/claims/ClaimNotes';
import { formatCurrency } from '@/lib/utils';

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    setLoading(true);
    
    // In a real app, fetch from API
    // Mock data for now based on ID
    const mockClaim = {
      id: parseInt(id),
      claimNumber: `AMB-CLM-2025-000${id}`,
      insuranceCompanyClaimId: id === '2' ? null : `INS-CLM-78${id}12`,
      policyId: id === '1' ? 1 : (id === '2' ? 3 : 5),
      policyNumber: id === '1' ? 'POL-2025-0125' : (id === '2' ? 'POL-2025-0156' : 'POL-2025-0189'),
      insuranceCompanyPolicyNumber: id === '1' ? 'INS-001-20250125-H' : (id === '2' ? 'STAR-H-A091238' : 'BAJA-P-112233'),
      clientId: id === '1' ? 'AMB-CLI-2025-0001' : (id === '2' ? 'AMB-CLI-2025-0012' : 'AMB-CLI-2025-0024'),
      clientName: id === '1' ? 'Vivek Patel' : (id === '2' ? 'Priya Desai' : 'Tech Solutions Ltd'),
      memberName: id === '1' ? 'Vivek Patel' : (id === '2' ? 'Rahul Desai' : 'N/A'),
      policyType: id === '1' || id === '2' ? 'Health Insurance' : 'Property Insurance',
      dateOfIncident: id === '1' ? '12 Apr 2025' : (id === '2' ? '05 May 2025' : '18 Mar 2025'),
      dateOfFiling: id === '1' ? '14 Apr 2025' : (id === '2' ? '07 May 2025' : '20 Mar 2025'),
      claimAmount: id === '1' ? 75000 : (id === '2' ? 125000 : 950000),
      approvedAmount: id === '1' ? 68500 : (id === '2' ? null : 850000),
      status: id === '1' ? 'approved' : (id === '2' ? 'pending' : 'settled'),
      
      // Common fields
      claimReason: id === '1' ? 'Medical Emergency - Appendicitis' : 
                  (id === '2' ? 'Medical Treatment - Kidney Stone' : 'Property Damage - Fire'),
      insuranceCompany: id === '1' ? 'HDFC ERGO Health Insurance' : 
                       (id === '2' ? 'Star Health Insurance' : 'Bajaj Allianz General Insurance'),
      claimHandler: id === '1' ? 'Anjali Sharma' : 
                   (id === '2' ? 'Pending Assignment' : 'Rakesh Khanna'),
      handlerContact: id === '1' ? '+91 98765 43210' : 
                     (id === '2' ? 'N/A' : '+91 87654 32109'),
      
      // Type-specific details
      details: id === '1' || id === '2' ? {
        // Health Insurance specific
        hospitalName: id === '1' ? 'Apollo Hospital' : 'Fortis Hospital',
        hospitalAddress: id === '1' ? '123 Health Avenue, Mumbai' : '456 Medical Park, Pune',
        hospitalContact: id === '1' ? '+91 22 2234 5678' : '+91 20 2567 8901',
        admissionDate: id === '1' ? '12 Apr 2025' : '05 May 2025',
        dischargeDate: id === '1' ? '14 Apr 2025' : '06 May 2025',
        roomCategory: id === '1' ? 'Semi-Private' : 'Private',
        diagnosis: id === '1' ? 'Acute Appendicitis' : 'Kidney Stone',
        treatment: id === '1' ? 'Laparoscopic Appendectomy' : 'Lithotripsy',
        treatmentType: id === '1' ? 'Surgical' : 'Medical',
        cashless: id === '1',
        preAuthApproved: id === '1',
        preAuthAmount: id === '1' ? 70000 : 0,
        billedAmount: id === '1' ? 75000 : 125000,
        copaymentRequired: false,
        copaymentAmount: 0,
        doctorName: id === '1' ? 'Dr. Suresh Patel' : 'Dr. Amir Khan',
        doctorSpeciality: id === '1' ? 'General Surgeon' : 'Urologist',
        medicalHistory: id === '1' ? 'No significant medical history' : 'History of kidney stones in 2023',
      } : {
        // Property Insurance specific
        propertyAddress: '123 Tech Park, Mumbai',
        propertyType: 'Commercial Office Space',
        propertySize: '10,000 sq ft',
        damageType: 'Fire Damage',
        affectedAreas: 'Server Room, 2nd Floor',
        damageExtent: 'Partial (30% of office space)',
        surveyorName: 'Rajesh Gupta',
        surveyorContact: '+91 98765 43210',
        surveyDate: '22 Mar 2025',
        surveyReport: 'Approved - Fire caused by electrical short circuit',
        estimatedRepairCost: 920000,
        preventionMeasuresTaken: 'Installed fire sprinklers, smoke detectors, and regular electrical maintenance',
        occupancyStatus: 'Partially occupied with temporary workspace arrangements',
      },
      
      // Documents
      documents: [
        {
          id: 1,
          name: id === '1' || id === '2' ? 'Medical Report.pdf' : 'Property Damage Report.pdf',
          type: 'report',
          size: '2.4 MB',
          uploadedBy: 'Admin User',
          uploadDate: id === '1' ? '14 Apr 2025' : (id === '2' ? '07 May 2025' : '20 Mar 2025'),
          status: 'verified'
        },
        {
          id: 2,
          name: id === '1' || id === '2' ? 'Hospital Bill.pdf' : 'Repair Estimate.pdf',
          type: 'bill',
          size: '1.8 MB',
          uploadedBy: 'Admin User',
          uploadDate: id === '1' ? '14 Apr 2025' : (id === '2' ? '07 May 2025' : '20 Mar 2025'),
          status: 'verified'
        },
        {
          id: 3,
          name: id === '1' || id === '2' ? 'Doctor Prescription.pdf' : 'Surveyor Report.pdf',
          type: 'prescription',
          size: '1.1 MB',
          uploadedBy: 'Admin User',
          uploadDate: id === '1' ? '14 Apr 2025' : (id === '2' ? '07 May 2025' : '22 Mar 2025'),
          status: 'verified'
        },
        {
          id: 4,
          name: 'Insurance Claim Form.pdf',
          type: 'form',
          size: '0.9 MB',
          uploadedBy: 'Admin User',
          uploadDate: id === '1' ? '14 Apr 2025' : (id === '2' ? '07 May 2025' : '20 Mar 2025'),
          status: 'verified'
        },
        {
          id: 5,
          name: 'ID Proof.pdf',
          type: 'identity',
          size: '0.7 MB',
          uploadedBy: 'Admin User',
          uploadDate: id === '1' ? '14 Apr 2025' : (id === '2' ? '07 May 2025' : '20 Mar 2025'),
          status: 'verified'
        }
      ],
      
      // Timeline
      timeline: [
        {
          id: 1,
          date: id === '1' ? '12 Apr 2025' : (id === '2' ? '05 May 2025' : '18 Mar 2025'),
          time: id === '1' ? '09:30 AM' : (id === '2' ? '11:15 AM' : '02:30 PM'),
          event: 'Incident Occurred',
          description: id === '1' ? 'Patient was admitted to Apollo Hospital with acute appendicitis' : 
                      (id === '2' ? 'Patient was admitted to Fortis Hospital with kidney stone' : 'Fire broke out in server room due to electrical short circuit'),
          status: 'incident'
        },
        {
          id: 2,
          date: id === '1' ? '14 Apr 2025' : (id === '2' ? '07 May 2025' : '20 Mar 2025'),
          time: id === '1' ? '10:15 AM' : (id === '2' ? '02:30 PM' : '11:45 AM'),
          event: 'Claim Filed',
          description: 'Client submitted all the required documents for claim processing',
          status: 'filed'
        },
        {
          id: 3,
          date: id === '1' ? '15 Apr 2025' : (id === '2' ? '08 May 2025' : '22 Mar 2025'),
          time: id === '1' ? '11:30 AM' : (id === '2' ? '09:45 AM' : '03:15 PM'),
          event: 'Initial Assessment',
          description: id === '1' ? 'Claim documents verified and assigned to claim handler' : 
                      (id === '2' ? 'Initial verification of documents completed' : 'Surveyor visited property for damage assessment'),
          status: 'processing'
        },
        {
          id: 4,
          date: id === '1' ? '17 Apr 2025' : (id === '3' ? '24 Mar 2025' : null),
          time: id === '1' ? '02:45 PM' : (id === '3' ? '10:30 AM' : null),
          event: 'Claim Approved',
          description: id === '1' ? 'Claim approved for ₹68,500' : 'Claim approved for ₹850,000',
          status: id === '1' || id === '3' ? 'approved' : null
        },
        {
          id: 5,
          date: id === '1' ? '19 Apr 2025' : (id === '3' ? '28 Mar 2025' : null),
          time: id === '1' ? '11:00 AM' : (id === '3' ? '04:15 PM' : null),
          event: 'Payment Processed',
          description: id === '1' ? 'Payment of ₹68,500 processed to hospital' : 'Payment of ₹850,000 transferred to client account',
          status: id === '1' || id === '3' ? 'settled' : null
        }
      ],
      
      // Notes
      notes: [
        {
          id: 1,
          author: 'Admin User',
          date: id === '1' ? '14 Apr 2025' : (id === '2' ? '07 May 2025' : '20 Mar 2025'),
          time: id === '1' ? '10:45 AM' : (id === '2' ? '03:00 PM' : '12:15 PM'),
          content: 'Claim filed with all required documents. Initial verification complete.',
          isInternal: true
        },
        {
          id: 2,
          author: 'Admin User',
          date: id === '1' ? '15 Apr 2025' : (id === '2' ? '08 May 2025' : '22 Mar 2025'),
          time: id === '1' ? '12:00 PM' : (id === '2' ? '10:15 AM' : '04:00 PM'),
          content: id === '1' ? 'Contacted insurance company. Claim assigned to Anjali Sharma.' : 
                  (id === '2' ? 'Insurance company acknowledged receipt of claim documents.' : 'Surveyor report received. Damage assessment aligns with claim amount.'),
          isInternal: true
        }
      ]
    };
    
    // Simulate API delay
    setTimeout(() => {
      setClaim(mockClaim);
      setLoading(false);
    }, 500);
  }, [id]);

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
            {claim.claimNumber}
          </h1>
          <div className="text-gray-500">
            {claim.policyType} Claim - Filed on {claim.dateOfFiling}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEditClaim}>
            <Edit className="mr-2 h-4 w-4" /> Edit Claim
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Claim Status</CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusBadge(claim.status)}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Claim Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(claim.claimAmount)}</div>
            {claim.approvedAmount !== null && (
              <div className={`text-sm ${claim.approvedAmount === 0 ? 'text-red-500' : 'text-green-600'}`}>
                Approved: {formatCurrency(claim.approvedAmount)}
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
                onClick={() => navigate(`/policies/${claim.policyId}`)}
              >
                {claim.policyNumber}
              </Button>
            </div>
            <div className="text-sm text-gray-500 font-mono">{claim.insuranceCompanyPolicyNumber}</div>
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
                onClick={() => navigate(`/clients/${claim.clientId}`)}
              >
                {claim.clientName}
              </Button>
            </div>
            {claim.memberName !== "N/A" && <div className="text-sm text-gray-500">Member: {claim.memberName}</div>}
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
            <Clock className="mr-2 h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center">
            <MessageCircle className="mr-2 h-4 w-4" />
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
    </div>
  );
};

export default ClaimDetails;
