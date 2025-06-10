
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Send, Download, Copy, CheckCircle, XCircle, Eye, File, Mail, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import QuotationComparison from '@/components/quotations/QuotationComparison';
import QuotationHistory from '@/components/quotations/QuotationHistory';
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
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const QuotationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('details');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  // Sample data - in a real app, this would be fetched from an API based on id
  const quotation = {
    id: parseInt(id),
    quoteId: `QT-2025-000${id}`,
    clientName: 'Vivek Patel',
    clientId: 'CLI-2025-0001',
    clientEmail: 'vivek.patel@example.com',
    clientPhone: '+91 98765 43210',
    clientAge: 35,
    clientGender: 'Male',
    insuranceType: 'Health Insurance',
    insuranceCompany: 'Star Health',
    products: [
      {
        name: 'Family Floater Plan',
        description: 'Comprehensive health coverage for the entire family',
        sumInsured: 500000,
        premium: 22000
      },
      {
        name: 'Critical Illness Add-on',
        description: 'Additional coverage for 20 critical illnesses',
        sumInsured: 500000,
        premium: 3000
      }
    ],
    familyMembers: [
      { relationship: 'Self', age: 35, gender: 'Male', preExistingConditions: 'None' },
      { relationship: 'Spouse', age: 32, gender: 'Female', preExistingConditions: 'None' },
      { relationship: 'Son', age: 8, gender: 'Male', preExistingConditions: 'None' },
      { relationship: 'Daughter', age: 5, gender: 'Female', preExistingConditions: 'None' }
    ],
    sumInsured: 500000,
    premium: 25000,
    agentName: 'Rajiv Kumar',
    agentId: 'agent1',
    agentEmail: 'rajiv.kumar@amba-insurance.com',
    createdDate: '18 May 2025',
    validUntil: '18 Jun 2025',
    status: 'draft',
    emailSent: false,
    viewedAt: null,
    notes: 'Client requested quotes for family of 4 with no pre-existing conditions. Looking for comprehensive coverage with maternity benefits.',
    pincode: '400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    occupation: 'Software Engineer',
    annualIncome: '₹15,00,000 - ₹20,00,000',
    smoking: 'No',
    alcoholConsumption: 'Occasional',
    paymentFrequency: 'Annual',
    policyTerm: '1 year',
    comparisons: [
      { 
        company: 'Star Health', 
        product: 'Family Health Optima',
        premium: 25000, 
        sumInsured: 500000,
        copay: '0%',
        roomRent: 'No limit',
        preExistingWaitingPeriod: '3 years',
        maternity: 'Covered after 2 years'
      },
      { 
        company: 'HDFC ERGO', 
        product: 'My Health Suraksha',
        premium: 27500, 
        sumInsured: 500000,
        copay: '10%',
        roomRent: 'Single private room',
        preExistingWaitingPeriod: '3 years',
        maternity: 'Not covered'
      },
      { 
        company: 'Max Bupa', 
        product: 'Health Companion',
        premium: 28000, 
        sumInsured: 500000,
        copay: '0%',
        roomRent: 'Single private room',
        preExistingWaitingPeriod: '2 years',
        maternity: 'Covered after 3 years'
      }
    ],
    history: [
      { 
        date: '18 May 2025 10:30 AM', 
        action: 'Created', 
        user: 'Rajiv Kumar',
        details: 'Initial quotation created' 
      },
      { 
        date: '18 May 2025 11:45 AM', 
        action: 'Updated', 
        user: 'Rajiv Kumar',
        details: 'Added critical illness add-on' 
      }
    ]
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Sent</Badge>;
      case 'viewed':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Viewed</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case 'expired':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleGoBack = () => {
    navigate('/quotations');
  };

  const handleEdit = () => {
    navigate(`/quotations/edit/${id}`);
  };

  const handleSend = () => {
    toast.success(`Quotation sent to ${quotation.clientEmail}`);
  };

  const handleDownload = () => {
    toast.success('Quotation PDF generated and downloading');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(quotation.quoteId);
    toast.success('Quotation ID copied to clipboard');
  };
  
  const handleDelete = () => {
    setDeleteDialogOpen(false);
    toast.success('Quotation deleted successfully');
    navigate('/quotations');
  };

  const handleConvert = () => {
    toast.success('Converting quotation to policy...');
    navigate('/policies/create', { state: { fromQuotation: quotation.id } });
  };

  // Show professional loading skeleton
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete Quotation {quotation.quoteId}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                Quotation {quotation.quoteId}
                <button onClick={handleCopy} className="ml-2 text-gray-400 hover:text-gray-600">
                  <Copy size={16} />
                </button>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(quotation.status)}
                <span className="text-sm text-gray-500">Created on {quotation.createdDate}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {quotation.status === 'draft' && (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="default" onClick={handleSend}>
                  <Send className="mr-2 h-4 w-4" /> Send
                </Button>
              </>
            )}
            
            {['sent', 'viewed'].includes(quotation.status) && (
              <Button variant="outline" onClick={handleSend}>
                <Mail className="mr-2 h-4 w-4" /> Resend
              </Button>
            )}
            
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            
            {['viewed', 'accepted'].includes(quotation.status) && (
              <Button variant="default" onClick={handleConvert}>
                <File className="mr-2 h-4 w-4" /> Convert to Policy
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                  <CardDescription>Client details and contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{quotation.clientName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{quotation.clientName}</div>
                        <div className="text-sm text-gray-500">{quotation.clientId}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm">
                        <div className="font-medium">Age</div>
                        <div>{quotation.clientAge} years</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Gender</div>
                        <div>{quotation.clientGender}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Email</div>
                        <div>{quotation.clientEmail}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Phone</div>
                        <div>{quotation.clientPhone}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Location</div>
                        <div>{quotation.city}, {quotation.state}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Pincode</div>
                        <div>{quotation.pincode}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Occupation</div>
                        <div>{quotation.occupation}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Annual Income</div>
                        <div>{quotation.annualIncome}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={() => navigate(`/clients/${quotation.clientId}`)} size="sm">
                    View Client Profile
                  </Button>
                </CardFooter>
              </Card>

              {/* Quote Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Quote Details</CardTitle>
                  <CardDescription>Insurance and policy information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm">
                        <div className="font-medium">Type</div>
                        <div>{quotation.insuranceType}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Insurer</div>
                        <div>{quotation.insuranceCompany}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Sum Insured</div>
                        <div>{formatCurrency(quotation.sumInsured)}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Premium</div>
                        <div>{formatCurrency(quotation.premium)}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Payment Frequency</div>
                        <div>{quotation.paymentFrequency}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Policy Term</div>
                        <div>{quotation.policyTerm}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Valid Until</div>
                        <div>{quotation.validUntil}</div>
                      </div>
                    </div>
                    
                    {/* Products */}
                    <div className="mt-4">
                      <div className="font-medium">Products</div>
                      <div className="mt-2 space-y-2">
                        {quotation.products.map((product, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded-md">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                            <div className="flex justify-between mt-1 text-sm">
                              <span>Sum Insured: {formatCurrency(product.sumInsured)}</span>
                              <span>Premium: {formatCurrency(product.premium)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agent & Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Agent & Status</CardTitle>
                  <CardDescription>Quote handling information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{quotation.agentName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{quotation.agentName}</div>
                          <div className="text-sm text-gray-500">{quotation.agentEmail}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="font-medium">Quote Status</div>
                        <div className="flex items-center gap-2 mt-1">
                          {quotation.status === 'draft' && (
                            <span className="flex items-center">
                              <Edit size={14} className="mr-1 text-gray-500" /> Draft - Not yet sent to client
                            </span>
                          )}
                          {quotation.status === 'sent' && (
                            <span className="flex items-center">
                              <Send size={14} className="mr-1 text-blue-500" /> Sent - Waiting for client review
                            </span>
                          )}
                          {quotation.status === 'viewed' && (
                            <span className="flex items-center">
                              <Eye size={14} className="mr-1 text-purple-500" /> Viewed by client
                            </span>
                          )}
                          {quotation.status === 'accepted' && (
                            <span className="flex items-center">
                              <CheckCircle size={14} className="mr-1 text-green-500" /> Accepted by client
                            </span>
                          )}
                          {quotation.status === 'rejected' && (
                            <span className="flex items-center">
                              <XCircle size={14} className="mr-1 text-red-500" /> Rejected by client
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {quotation.status !== 'draft' && (
                        <div className="text-sm">
                          <div className="font-medium">Email Status</div>
                          <div>{quotation.emailSent ? 'Sent' : 'Not sent'}</div>
                        </div>
                      )}
                      
                      {quotation.viewedAt && (
                        <div className="text-sm">
                          <div className="font-medium">Viewed At</div>
                          <div>{quotation.viewedAt}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm">
                      <div className="font-medium">Notes</div>
                      <div className="mt-1 text-gray-600">{quotation.notes}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Family Members Section */}
            {quotation.insuranceType === 'Health Insurance' && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Family Members</CardTitle>
                  <CardDescription>Insured members under this policy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium">Relationship</th>
                          <th className="pb-2 font-medium">Age</th>
                          <th className="pb-2 font-medium">Gender</th>
                          <th className="pb-2 font-medium">Pre-existing Conditions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotation.familyMembers.map((member, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3">{member.relationship}</td>
                            <td className="py-3">{member.age}</td>
                            <td className="py-3">{member.gender}</td>
                            <td className="py-3">{member.preExistingConditions || 'None'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comparison">
            <QuotationComparison comparisons={quotation.comparisons} />
          </TabsContent>

          <TabsContent value="history">
            <QuotationHistory history={quotation.history} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuotationDetails;
