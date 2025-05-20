
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Edit, 
  Download, 
  User, 
  Building, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  FileText,
  Activity,
  Clock,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { generateClientId } from '../utils/idGenerator';

const ClientDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Dummy client data - in a real app, this would be fetched from API
  const clients = [
    {
      id: 1,
      clientId: 'AMB-CLI-2025-0001',
      name: 'Rahul Sharma',
      type: 'Individual',
      contact: '+91 9876543210',
      email: 'rahul.sharma@example.com',
      location: 'Mumbai, Maharashtra',
      policies: 3,
      status: 'Active',
      createdAt: '2025-01-15',
      dob: '1985-06-22',
      panNumber: 'ABCPD1234R',
      gender: 'Male',
      occupation: 'Software Engineer',
      notes: 'Prefers communication via email',
      assignedAgent: 'Amit Kumar',
    },
    {
      id: 2,
      clientId: 'AMB-CLI-2025-0002',
      name: 'Tech Solutions Ltd',
      type: 'Corporate',
      contact: '+91 2234567890',
      email: 'info@techsolutions.com',
      location: 'Bangalore, Karnataka',
      policies: 8,
      status: 'Active',
      createdAt: '2025-01-20',
      registrationNo: 'U12345KA2015PTC123456',
      gstNumber: '29AABCT1234A1Z5',
      industry: 'Information Technology',
      employeeCount: 150,
      contactPerson: 'Vikram Mehta',
      contactPersonDesignation: 'HR Manager',
      notes: 'Handles group health insurance for employees',
      assignedAgent: 'Priya Sharma',
    },
  ];

  // Fetch client data
  useEffect(() => {
    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      const foundClient = clients.find(c => c.id === parseInt(id)) || 
        { 
          id: parseInt(id), 
          clientId: generateClientId([]),
          name: `Client #${id}`,
          type: 'Individual',
          email: 'client@example.com',
          contact: '+91 9999999999',
          location: 'New Delhi, Delhi',
          status: 'Active',
          policies: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
      
      setClient(foundClient);
      setLoading(false);
    }, 500);
  }, [id]);

  const getClientTypeIcon = () => {
    if (!client) return <User className="h-8 w-8 text-gray-400" />;
    
    switch (client.type) {
      case 'Individual':
        return <User className="h-8 w-8 text-blue-500" />;
      case 'Corporate':
        return <Building className="h-8 w-8 text-purple-500" />;
      case 'Group':
        return <Users className="h-8 w-8 text-green-500" />;
      default:
        return <User className="h-8 w-8 text-gray-400" />;
    }
  };

  const handleEditClient = () => {
    navigate(`/clients/edit/${id}`);
  };

  // Dummy data for policy list
  const policies = client?.type === 'Individual' ? [
    { id: 101, policyNumber: 'POL-2025-00123', type: 'Health Insurance', startDate: '2025-01-20', endDate: '2026-01-19', premium: '₹15,000', status: 'Active' },
    { id: 102, policyNumber: 'POL-2025-00456', type: 'Motor Insurance', startDate: '2025-02-10', endDate: '2026-02-09', premium: '₹8,500', status: 'Active' },
    { id: 103, policyNumber: 'POL-2025-00789', type: 'Term Life Insurance', startDate: '2025-03-05', endDate: '2026-03-04', premium: '₹12,000', status: 'Active' }
  ] : client?.type === 'Corporate' ? [
    { id: 201, policyNumber: 'POL-2025-01001', type: 'Group Health Insurance', startDate: '2025-01-15', endDate: '2026-01-14', premium: '₹1,25,000', status: 'Active' },
    { id: 202, policyNumber: 'POL-2025-01002', type: 'Group Term Life', startDate: '2025-01-15', endDate: '2026-01-14', premium: '₹75,000', status: 'Active' },
    { id: 203, policyNumber: 'POL-2025-01003', type: 'Fire Insurance', startDate: '2025-02-01', endDate: '2026-01-31', premium: '₹50,000', status: 'Active' },
    { id: 204, policyNumber: 'POL-2025-01004', type: 'Professional Indemnity', startDate: '2025-02-10', endDate: '2026-02-09', premium: '₹35,000', status: 'Active' }
  ] : [];

  // Dummy data for claims
  const claims = client?.type === 'Individual' ? [
    { id: 301, claimNumber: 'CLM-2025-00234', policyNumber: 'POL-2025-00123', date: '2025-03-15', amount: '₹35,000', status: 'Approved', type: 'Hospitalization' },
  ] : client?.type === 'Corporate' ? [
    { id: 401, claimNumber: 'CLM-2025-00567', policyNumber: 'POL-2025-01001', date: '2025-02-22', amount: '₹45,000', status: 'Approved', type: 'Hospitalization' },
    { id: 402, claimNumber: 'CLM-2025-00568', policyNumber: 'POL-2025-01001', date: '2025-03-10', amount: '₹28,000', status: 'Pending', type: 'Hospitalization' },
    { id: 403, claimNumber: 'CLM-2025-00575', policyNumber: 'POL-2025-01003', date: '2025-03-18', amount: '₹120,000', status: 'Under Review', type: 'Property Damage' },
  ] : [];

  // Dummy data for documents
  const documents = [
    { id: 501, name: 'ID Proof', type: 'PDF', uploadDate: '2025-01-15', size: '1.2 MB' },
    { id: 502, name: 'Address Proof', type: 'PDF', uploadDate: '2025-01-15', size: '0.8 MB' },
    { id: 503, name: 'Income Proof', type: 'PDF', uploadDate: '2025-01-16', size: '1.5 MB' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
      </div>
    );
  }

  // If client not found
  if (!client) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl text-gray-700">Client not found</h2>
        <Button className="mt-4" onClick={() => navigate('/clients')}>
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clients')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Clients
          </Button>
          <h1 className="text-xl font-semibold">Client Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Client details exported successfully")}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            className="bg-amba-blue hover:bg-amba-blue/90"
            onClick={handleEditClient}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Client
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              {getClientTypeIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{client.name}</h2>
              <div className="flex items-center gap-4 mt-1">
                <div className="text-sm text-gray-500 font-mono">{client.clientId}</div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${client.type === 'Individual' ? 'bg-blue-100 text-blue-800' : 
                    client.type === 'Corporate' ? 'bg-purple-100 text-purple-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {client.type}
                </span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {client.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="flex h-10 items-center px-6 -mb-px overflow-x-auto no-scrollbar">
              <TabsTrigger 
                value="overview" 
                className="py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="policies"
                className="py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap"
              >
                Policies ({policies.length})
              </TabsTrigger>
              <TabsTrigger 
                value="claims"
                className="py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap"
              >
                Claims ({claims.length})
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap"
              >
                Activity Log
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="text-md font-semibold text-gray-700">Contact Information</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{client.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{client.location}</span>
                  </div>
                </div>
              </div>

              {/* Client Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="text-md font-semibold text-gray-700">Client Details</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {client.type === 'Individual' && (
                    <>
                      {client.dob && (
                        <div className="text-sm">
                          <span className="text-gray-500">Date of Birth:</span><br />
                          <span>{client.dob}</span>
                        </div>
                      )}
                      {client.gender && (
                        <div className="text-sm">
                          <span className="text-gray-500">Gender:</span><br />
                          <span>{client.gender}</span>
                        </div>
                      )}
                      {client.panNumber && (
                        <div className="text-sm">
                          <span className="text-gray-500">PAN:</span><br />
                          <span>{client.panNumber}</span>
                        </div>
                      )}
                      {client.occupation && (
                        <div className="text-sm">
                          <span className="text-gray-500">Occupation:</span><br />
                          <span>{client.occupation}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {client.type === 'Corporate' && (
                    <>
                      {client.registrationNo && (
                        <div className="text-sm">
                          <span className="text-gray-500">Registration No:</span><br />
                          <span>{client.registrationNo}</span>
                        </div>
                      )}
                      {client.gstNumber && (
                        <div className="text-sm">
                          <span className="text-gray-500">GST Number:</span><br />
                          <span>{client.gstNumber}</span>
                        </div>
                      )}
                      {client.industry && (
                        <div className="text-sm">
                          <span className="text-gray-500">Industry:</span><br />
                          <span>{client.industry}</span>
                        </div>
                      )}
                      {client.employeeCount && (
                        <div className="text-sm">
                          <span className="text-gray-500">Employees:</span><br />
                          <span>{client.employeeCount}</span>
                        </div>
                      )}
                      {client.contactPerson && (
                        <div className="text-sm">
                          <span className="text-gray-500">Contact Person:</span><br />
                          <span>{client.contactPerson}</span>
                        </div>
                      )}
                      {client.contactPersonDesignation && (
                        <div className="text-sm">
                          <span className="text-gray-500">Designation:</span><br />
                          <span>{client.contactPersonDesignation}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="text-sm">
                    <span className="text-gray-500">Created On:</span><br />
                    <span>{client.createdAt}</span>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-500">Assigned Agent:</span><br />
                    <span>{client.assignedAgent || 'Not assigned'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {client.notes && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Notes</h3>
                <p className="text-sm text-gray-600">{client.notes}</p>
              </div>
            )}

            {/* Policy Overview */}
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4">Policy Overview</h3>
              
              {policies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy Number</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {policies.slice(0, 3).map((policy) => (
                        <tr key={policy.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{policy.policyNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{policy.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.startDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.endDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{policy.premium}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {policy.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No policies found for this client</p>
                  <Button className="mt-4">Add New Policy</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="policies" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Policies</h3>
              <Button>Add New Policy</Button>
            </div>
            
            {policies.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy Number</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {policies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{policy.policyNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{policy.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.startDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.endDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{policy.premium}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {policy.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          <div className="flex justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">View</button>
                            <button className="text-yellow-600 hover:text-yellow-900">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No Policies Found</h3>
                <p className="text-gray-500 mb-4">This client doesn't have any policies yet</p>
                <Button>Add New Policy</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="claims" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Claims</h3>
              <Button>Create New Claim</Button>
            </div>
            
            {claims.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim Number</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy Number</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{claim.claimNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{claim.policyNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{claim.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{claim.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${claim.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                              claim.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          <div className="flex justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">View</button>
                            <button className="text-yellow-600 hover:text-yellow-900">Track</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No Claims Found</h3>
                <p className="text-gray-500 mb-4">This client doesn't have any claims yet</p>
                <Button>Create New Claim</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Documents</h3>
              <Button>Upload Document</Button>
            </div>
            
            <div className="overflow-x-auto bg-white rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{document.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{document.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.uploadDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{document.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">View</button>
                          <button className="text-green-600 hover:text-green-900">Download</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="p-6">
            <h3 className="text-lg font-medium mb-4">Activity Log</h3>
            
            <div className="space-y-4">
              {/* Activity items */}
              <div className="flex gap-4 border-l-2 border-blue-500 pl-4 py-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Client updated</span> by Amit Kumar
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2025-05-15 14:23</p>
                </div>
              </div>
              
              <div className="flex gap-4 border-l-2 border-purple-500 pl-4 py-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">New policy added</span>: Health Insurance (POL-2025-00123)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2025-04-28 10:15</p>
                </div>
              </div>
              
              <div className="flex gap-4 border-l-2 border-green-500 pl-4 py-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Client onboarded</span> by Priya Sharma
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2025-01-15 09:42</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDetailsView;
