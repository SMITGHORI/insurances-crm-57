
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Building, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  ExternalLink,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch client data
  useEffect(() => {
    // This would be an API call in a real application
    const fetchClientData = () => {
      // Sample data - in a real app, this would come from an API
      const clientsData = [
        {
          id: 1,
          clientId: 'AMB-CLI-20250520-0001',
          name: 'Rahul Sharma',
          type: 'Individual',
          contact: '+91 9876543210',
          email: 'rahul.sharma@example.com',
          location: 'Mumbai, Maharashtra',
          address: '123 Marine Drive, Colaba, Mumbai, Maharashtra 400001',
          dateOfBirth: '15/06/1985',
          gender: 'Male',
          occupation: 'Software Engineer',
          annualIncome: '₹1,500,000',
          panCard: 'ABCDE1234F',
          aadharCard: '1234 5678 9012',
          policies: [
            { 
              id: 101, 
              policyNumber: 'HL-20250520-001', 
              type: 'Health Insurance', 
              provider: 'Star Health', 
              plan: 'Family Floater', 
              premium: '₹25,000/year',
              coverAmount: '₹10,00,000',
              startDate: '01/01/2025',
              endDate: '31/12/2025',
              status: 'Active'
            },
            { 
              id: 102, 
              policyNumber: 'TL-20250520-002', 
              type: 'Term Insurance', 
              provider: 'HDFC Life',
              plan: 'Click 2 Protect', 
              premium: '₹12,000/year',
              coverAmount: '₹1,00,00,000',
              startDate: '01/02/2025',
              endDate: '31/01/2026',
              status: 'Active'
            }
          ],
          status: 'Active',
          assignedAgent: 'Amit Patel',
          kyc: 'Completed',
          remarks: 'Priority client, interested in investment-linked policies.'
        },
        {
          id: 2,
          clientId: 'AMB-CLI-20250519-0001',
          name: 'Tech Solutions Ltd',
          type: 'Corporate',
          contact: '+91 2234567890',
          email: 'info@techsolutions.com',
          location: 'Bangalore, Karnataka',
          address: '42 Tech Park, Whitefield, Bangalore, Karnataka 560066',
          dateOfIncorporation: '22/03/2010',
          gstNumber: '29AABCT1234A1Z5',
          panCard: 'AABCT1234A',
          industry: 'Information Technology',
          employees: 250,
          annualRevenue: '₹50,00,00,000',
          contactPerson: {
            name: 'Vijay Rao',
            designation: 'HR Manager',
            phone: '+91 9876543211',
            email: 'vijay.rao@techsolutions.com'
          },
          keyPersonnel: [
            {
              name: 'Sunita Kumar',
              designation: 'CEO',
              phone: '+91 9876543212',
              email: 'sunita.kumar@techsolutions.com'
            },
            {
              name: 'Anand Joshi',
              designation: 'CFO',
              phone: '+91 9876543213',
              email: 'anand.joshi@techsolutions.com'
            }
          ],
          policies: [
            { 
              id: 201, 
              policyNumber: 'GH-20250520-001', 
              type: 'Group Health Insurance', 
              provider: 'ICICI Lombard', 
              plan: 'Corporate Shield', 
              premium: '₹15,00,000/year',
              coverAmount: '₹5,00,000/employee',
              startDate: '01/04/2025',
              endDate: '31/03/2026',
              status: 'Active'
            },
            { 
              id: 202, 
              policyNumber: 'GL-20250520-002', 
              type: 'Group Life Insurance', 
              provider: 'LIC',
              plan: 'Group Term Plan', 
              premium: '₹8,00,000/year',
              coverAmount: '₹50,00,000/key person',
              startDate: '01/04/2025',
              endDate: '31/03/2026',
              status: 'Active'
            },
            { 
              id: 203, 
              policyNumber: 'PI-20250520-003', 
              type: 'Professional Indemnity', 
              provider: 'Bajaj Allianz',
              plan: 'IT Shield', 
              premium: '₹5,00,000/year',
              coverAmount: '₹10,00,00,000',
              startDate: '01/05/2025',
              endDate: '30/04/2026',
              status: 'Active'
            }
          ],
          status: 'Active',
          assignedAgent: 'Priya Singh',
          kycStatus: 'Completed',
          remarks: 'Long-term client since 2015. Planning to expand insurance coverage for international operations.'
        }
      ];

      const foundClient = clientsData.find(c => c.id === parseInt(id)) || null;
      setClient(foundClient);
      setLoading(false);
    };

    fetchClientData();
  }, [id]);

  const getClientTypeIcon = (type) => {
    switch (type) {
      case 'Individual':
        return <User className="h-10 w-10 text-blue-500" />;
      case 'Corporate':
        return <Building className="h-10 w-10 text-purple-500" />;
      case 'Group':
        return <Users className="h-10 w-10 text-green-500" />;
      default:
        return <User className="h-10 w-10 text-gray-500" />;
    }
  };

  const handleBackClick = () => {
    navigate('/clients');
  };

  const handleViewPolicy = (policyId) => {
    toast.info(`Redirecting to policy ${policyId}`);
    // In a real app, you would navigate to the policy details page
    // navigate(`/policies/${policyId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amba-blue"></div>
        <span className="ml-3 text-lg font-medium">Loading client details...</span>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Client Not Found</h2>
        <p className="text-gray-600 mb-6">Sorry, we couldn't find the client you're looking for.</p>
        <Button onClick={handleBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleBackClick}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Client Details</h1>
          <Badge variant={client.status === 'Active' ? 'success' : 'destructive'}>
            {client.status}
          </Badge>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate(`/clients/edit/${client.id}`)}>
            Edit Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center justify-center h-16 w-16 bg-gray-100 rounded-full">
                {getClientTypeIcon(client.type)}
              </div>
              <Badge className={`${client.type === 'Individual' ? 'bg-blue-100 text-blue-800' : 
                client.type === 'Corporate' ? 'bg-purple-100 text-purple-800' : 
                'bg-green-100 text-green-800'}`}>
                {client.type}
              </Badge>
            </div>
            <CardTitle className="mt-4">{client.name}</CardTitle>
            <CardDescription className="font-mono text-sm">{client.clientId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-3" />
                <span>{client.contact}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-3" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                <span>{client.location}</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-gray-500 mr-3" />
                <span>KYC: {client.kyc || client.kycStatus}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="text-sm font-semibold text-gray-600">Assigned Agent</div>
                <div className="mt-1">{client.assignedAgent}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <Card className="md:col-span-2">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {client.type !== 'Individual' && (
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                )}
                <TabsTrigger value="policies">Policies ({client.policies.length})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="overview" className="space-y-6">
              {client.type === 'Individual' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Full Address</div>
                    <div>{client.address}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                    <div>{client.dateOfBirth}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Gender</div>
                    <div>{client.gender}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Occupation</div>
                    <div>{client.occupation}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Annual Income</div>
                    <div>{client.annualIncome}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">PAN Card</div>
                    <div>{client.panCard}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Aadhar Card</div>
                    <div>{client.aadharCard}</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Full Address</div>
                    <div>{client.address}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">
                      {client.type === 'Corporate' ? 'Date of Incorporation' : 'Establishment Date'}
                    </div>
                    <div>{client.dateOfIncorporation}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">GST Number</div>
                    <div>{client.gstNumber}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">PAN Card</div>
                    <div>{client.panCard}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">
                      {client.type === 'Corporate' ? 'Industry' : 'Type'}
                    </div>
                    <div>{client.industry}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">
                      {client.type === 'Corporate' ? 'Number of Employees' : 'Number of Members'}
                    </div>
                    <div>{client.employees}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Annual Revenue</div>
                    <div>{client.annualRevenue}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Primary Contact Person</div>
                    <div>{client.contactPerson?.name} ({client.contactPerson?.designation})</div>
                  </div>
                </div>
              )}
              {client.remarks && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="font-medium text-amber-800 mb-1">Remarks</div>
                  <div className="text-amber-700">{client.remarks}</div>
                </div>
              )}
            </TabsContent>

            {client.type !== 'Individual' && (
              <TabsContent value="contacts" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Primary Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-500">Name</div>
                        <div>{client.contactPerson?.name}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-500">Designation</div>
                        <div>{client.contactPerson?.designation}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-500">Phone</div>
                        <div>{client.contactPerson?.phone}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-500">Email</div>
                        <div>{client.contactPerson?.email}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Key Personnel</h3>
                  {client.keyPersonnel?.map((person, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500">Name</div>
                            <div>{person.name}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500">Designation</div>
                            <div>{person.designation}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500">Phone</div>
                            <div>{person.phone}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500">Email</div>
                            <div>{person.email}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="policies">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-mono">{policy.policyNumber}</TableCell>
                      <TableCell>{policy.type}</TableCell>
                      <TableCell>{policy.provider}</TableCell>
                      <TableCell>{policy.plan}</TableCell>
                      <TableCell>{policy.premium}</TableCell>
                      <TableCell>
                        <Badge variant={policy.status === 'Active' ? 'success' : 'destructive'}>
                          {policy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewPolicy(policy.id)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetails;
