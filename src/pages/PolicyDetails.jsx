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
  Clock as ClockIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import DocumentUpload from '../components/policies/DocumentUpload';
import RenewalHistory from '../components/policies/RenewalHistory';
import PaymentHistory from '../components/policies/PaymentHistory';
import EndorsementHistory from '../components/policies/EndorsementHistory';
import PolicyNotes from '../components/policies/PolicyNotes';
import PolicyHistory from '../components/policies/PolicyHistory';
import CommissionDetails from '../components/policies/CommissionDetails';

const PolicyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  if (loading || !policy) {
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
            Policy: {policy.policyNumber}
          </h1>
          <div className="text-gray-500">
            {policy.type} - {policy.client.name}
          </div>
        </div>
        <Button onClick={handleEditPolicy}>
          <Edit className="mr-2 h-4 w-4" /> Edit Policy
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusBadgeClass(policy.status)}>
              {policy.status}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Sum Assured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{parseInt(policy.sumAssured).toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{parseInt(policy.premium).toLocaleString()}</div>
            <div className="text-sm text-gray-500">{policy.paymentFrequency}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Policy Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm text-gray-500">
              Start: {new Date(policy.startDate).toLocaleDateString()}
            </div>
            <Progress value={calculateRenewalProgress()} className="h-2 flex-1" />
            <div className="text-sm text-gray-500">
              End: {new Date(policy.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm">
              Grace Period: <span className="font-semibold">{policy.gracePeriod} days</span>
            </div>
            <div className={`text-sm font-semibold ${daysUntilRenewal <= 30 ? 'text-amber-600' : ''}`}>
              {daysUntilRenewal > 0 
                ? `${daysUntilRenewal} days until renewal` 
                : 'Renewal overdue!'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
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
            <ClockIcon className="mr-2 h-4 w-4" />
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
              <CardTitle>Policy Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Policy Number</h3>
                  <p>{policy.policyNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
                  <p>{policy.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                  <p className="cursor-pointer text-primary hover:underline" 
                     onClick={() => navigate(`/clients/${policy.client.id}`)}>
                    {policy.client.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <Badge className={getStatusBadgeClass(policy.status)}>
                    {policy.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                  <p>{new Date(policy.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                  <p>{new Date(policy.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Sum Assured</h3>
                  <p>₹{parseInt(policy.sumAssured).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Premium</h3>
                  <p>₹{parseInt(policy.premium).toLocaleString()} ({policy.paymentFrequency})</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Grace Period</h3>
                  <p>{policy.gracePeriod} days</p>
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
