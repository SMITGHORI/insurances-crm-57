
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
  Trash,
  Download,
  Plus,
  User,
  Info,
  StickyNote,
  Building,
  Lock,
  Percent,
  Link,
  Shield,
  Car,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';
import DocumentUpload from '../components/policies/DocumentUpload';
import RenewalHistory from '../components/policies/RenewalHistory';
import PaymentHistory from '../components/policies/PaymentHistory';
import EndorsementHistory from '../components/policies/EndorsementHistory';
import PolicyNotes from '../components/policies/PolicyNotes';
import PolicyHistory from '../components/policies/PolicyHistory';
import CommissionDetails from '../components/policies/CommissionDetails';
import PolicyMembers from '../components/policies/PolicyMembers';

const PolicyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

  useEffect(() => {
    setLoading(true);
    
    // Try to get policies from localStorage
    const storedPoliciesData = localStorage.getItem('policiesData');
    let policiesList = [];
    
    if (storedPoliciesData) {
      policiesList = JSON.parse(storedPoliciesData);
    }
    
    // Find the policy by id
    const foundPolicy = policiesList.find(p => p.id === parseInt(id));
    
    if (foundPolicy) {
      setPolicy(foundPolicy);
    } else {
      toast.error(`Policy with ID ${id} not found`);
      navigate('/policies');
    }
    
    setLoading(false);
  }, [id, navigate]);

  // Calculate days remaining until renewal
  const daysUntilRenewal = policy ? Math.floor(
    (new Date(policy.endDate) - new Date()) / (1000 * 60 * 60 * 24)
  ) : 0;

  // Calculate renewal progress
  const calculateRenewalProgress = () => {
    if (!policy) return 0;
    
    const startDate = new Date(policy.startDate);
    const endDate = new Date(policy.endDate);
    const today = new Date();
    
    const totalPeriodDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    const progress = (daysElapsed / totalPeriodDays) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handleEditPolicy = () => {
    navigate(`/policies/edit/${id}`);
  };

  // Get badge color based on policy status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Force':
        return 'bg-green-100 text-green-800';
      case 'Proposal':
        return 'bg-blue-100 text-blue-800';
      case 'Grace':
        return 'bg-yellow-100 text-yellow-800';
      case 'Lapsed':
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Surrendered':
      case 'Matured':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Render type-specific details
  const renderTypeSpecificDetails = () => {
    if (!policy?.typeSpecificDetails) return null;
    
    const details = policy.typeSpecificDetails;
    
    if (policy.type === 'Health Insurance') {
      return (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" /> Health Insurance Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Coverage Type</h3>
                <p>{details.coverageType || 'Individual'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Waiting Period</h3>
                <p>{details.waitingPeriod ? `${details.waitingPeriod} days` : 'None'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Room Rent Limit</h3>
                <p>{details.roomRentLimit || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Coverage Amount</h3>
                <p>{details.coverageAmount || 'Same as sum assured'}</p>
              </div>
              
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Pre-existing Diseases Covered</h3>
                <p className="whitespace-pre-wrap">{details.preExistingDiseases || 'None specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (policy.type === 'Life Insurance') {
      return (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" /> Term Insurance Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Maturity Age</h3>
                <p>{details.maturityAge ? `${details.maturityAge} years` : 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Death Benefit</h3>
                <p>{details.deathBenefit || 'Same as sum assured'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Critical Illness Cover</h3>
                <p>{details.criticalIllnessCover || 'Not included'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Accidental Death Benefit</h3>
                <p>{details.accidentalDeathBenefit || 'Not included'}</p>
              </div>
              
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Riders Included</h3>
                <p className="whitespace-pre-wrap">{details.ridersIncluded || 'None'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (policy.type === 'Motor Insurance') {
      return (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-amber-600" /> Vehicle Insurance Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Vehicle Type</h3>
                <p>{details.vehicleType || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Vehicle Model</h3>
                <p>{details.vehicleModel || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Registration Number</h3>
                <p className="font-semibold">{details.vehicleNumber || 'Not provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">IDV (Insured Declared Value)</h3>
                <p>{details.idv || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Engine Number</h3>
                <p className="font-mono">{details.engineNumber || 'Not provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Chassis Number</h3>
                <p className="font-mono">{details.chassisNumber || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  if (loading || !policy) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Header section with back button for mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-2 -ml-2 text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/policies')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to policies
            </Button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {isMobile ? `Policy: ${policy.policyNumber.slice(-6)}` : `Policy: ${policy.policyNumber}`}
          </h1>
          <div className="flex items-center text-gray-500 text-sm sm:text-base flex-wrap">
            {policy.type} - 
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary text-sm sm:text-base" 
              onClick={() => navigate(`/clients/${policy.client.id}`)}
            >
              <Link className="h-4 w-4 mx-1" /> {policy.client.name}
            </Button>
          </div>
        </div>
        <Button 
          onClick={handleEditPolicy}
          className="w-full sm:w-auto"
          size={isMobile ? "sm" : "default"}
        >
          <Edit className="mr-2 h-4 w-4" /> Edit Policy
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <Card>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Status</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <Badge className={getStatusBadgeClass(policy.status)}>
              {policy.status}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Sum Assured</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">₹{parseInt(policy.sumAssured).toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Premium</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">₹{parseInt(policy.premium).toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-gray-500">{policy.paymentFrequency}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Insurance Company</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 px-3 sm:px-6 pt-0">
            <Building className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
            <div className="font-medium text-sm sm:text-base truncate">{policy.insuranceCompany || 'Not specified'}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">Policy Timeline</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <div className="text-xs sm:text-sm text-gray-500">
              Start: {new Date(policy.startDate).toLocaleDateString()}
            </div>
            <Progress value={calculateRenewalProgress()} className="h-2 flex-1" />
            <div className="text-xs sm:text-sm text-gray-500">
              End: {new Date(policy.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm">
              Grace Period: <span className="font-semibold">{policy.gracePeriod} days</span>
            </div>
            <div className={`text-xs sm:text-sm font-semibold ${daysUntilRenewal <= 30 ? 'text-amber-600' : ''}`}>
              {daysUntilRenewal > 0 
                ? `${daysUntilRenewal} days until renewal` 
                : 'Renewal overdue!'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Policy Members component before type-specific details */}
      <PolicyMembers policy={policy} setPolicy={setPolicy} />

      {/* Type-specific details section - kept as is */}
      {renderTypeSpecificDetails && renderTypeSpecificDetails()}

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        {isMobile ? (
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">
              <Info className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="payments">
              <Clock className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="notes">
              <StickyNote className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        ) : (
          <TabsList className="grid grid-cols-8 mb-4">
            <TabsTrigger value="overview" className="flex items-center">
              <Info className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="renewals" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Renewals
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="endorsements" className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Endorsements
            </TabsTrigger>
            <TabsTrigger value="commission" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Commission
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
        )}

        <TabsContent value="overview">
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-base sm:text-lg">Policy Details</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Policy Number</h3>
                  <p className="text-sm sm:text-base">{policy.policyNumber}</p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Type</h3>
                  <p className="flex items-center gap-1 text-sm sm:text-base">
                    {policy.type === 'Health Insurance' && <Shield className="h-4 w-4 text-blue-600" />}
                    {policy.type === 'Life Insurance' && <Shield className="h-4 w-4 text-green-600" />}
                    {policy.type === 'Motor Insurance' && <Car className="h-4 w-4 text-amber-600" />}
                    {policy.type}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Client</h3>
                  <p className="cursor-pointer text-primary hover:underline text-sm sm:text-base" 
                     onClick={() => navigate(`/clients/${policy.client.id}`)}>
                    {policy.client.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <Badge className={getStatusBadgeClass(policy.status)}>
                    {policy.status}
                  </Badge>
                </div>
                
                {/* Continue with other details in the same pattern */}
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Insurance Company</h3>
                  <p className="flex items-center gap-1 text-sm sm:text-base">
                    <Building className="h-4 w-4 text-blue-600" />
                    {policy.insuranceCompany || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Plan Name</h3>
                  <p className="flex items-center gap-1 text-sm sm:text-base">
                    <FileText className="h-4 w-4 text-blue-600" />
                    {policy.planName || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                  <p className="text-sm sm:text-base">{new Date(policy.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">End Date</h3>
                  <p className="text-sm sm:text-base">{new Date(policy.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Sum Assured</h3>
                  <p className="text-sm sm:text-base">₹{parseInt(policy.sumAssured || 0).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Premium</h3>
                  <p className="text-sm sm:text-base">₹{parseInt(policy.premium || 0).toLocaleString()} ({policy.paymentFrequency})</p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Lock-in Period</h3>
                  <p className="flex items-center gap-1 text-sm sm:text-base">
                    <Lock className="h-4 w-4 text-blue-600" />
                    {policy.lockInPeriod ? `${policy.lockInPeriod} years` : 'None'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Grace Period</h3>
                  <p className="text-sm sm:text-base">{policy.gracePeriod} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentUpload policy={policy} setPolicy={setPolicy} />
        </TabsContent>

        <TabsContent value="renewals">
          <RenewalHistory policy={policy} setPolicy={setPolicy} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentHistory policy={policy} setPolicy={setPolicy} />
        </TabsContent>

        <TabsContent value="endorsements">
          <EndorsementHistory policy={policy} setPolicy={setPolicy} />
        </TabsContent>

        <TabsContent value="commission">
          <CommissionDetails policy={policy} setPolicy={setPolicy} />
        </TabsContent>

        <TabsContent value="history">
          <PolicyHistory policy={policy} />
        </TabsContent>

        <TabsContent value="notes">
          <PolicyNotes policy={policy} setPolicy={setPolicy} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PolicyDetails;
