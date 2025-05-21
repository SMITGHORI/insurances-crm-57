import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  FileText, 
  Users,
  Edit,
  Award,
  Briefcase,
  Clock,
  AlertCircle,
  BadgeCheck,
  Building,
  FileCheck,
  Wallet
} from 'lucide-react';
import AgentCommissionHistory from '../components/agents/AgentCommissionHistory';
import AgentPerformanceChart from '../components/agents/AgentPerformanceChart';
import AgentClientsTable from '../components/agents/AgentClientsTable';
import AgentPoliciesTable from '../components/agents/AgentPoliciesTable';
import AgentDocuments from '../components/agents/AgentDocuments';
import AgentForm from '../components/agents/AgentForm';

const AgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [clients, setClients] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    // Load agent data
    const storedAgentsData = localStorage.getItem('agentsData');
    if (storedAgentsData) {
      const agentsList = JSON.parse(storedAgentsData);
      const foundAgent = agentsList.find(a => a.id === parseInt(id));
      
      if (foundAgent) {
        setAgent(foundAgent);
      } else {
        toast.error(`Agent with ID ${id} not found`);
        navigate('/agents');
      }
    }
    
    // Load clients data to find this agent's clients
    const storedClientsData = localStorage.getItem('clientsData');
    if (storedClientsData) {
      const clientsList = JSON.parse(storedClientsData);
      // For now, simulate that some clients are assigned to this agent
      // In a real system, you'd have an agentId field in clients data
      const agentClients = clientsList.slice(0, 5); // Just take first 5 clients as a sample
      setClients(agentClients);
    }
    
    // Load policies data to find this agent's policies
    const storedPoliciesData = localStorage.getItem('policiesData');
    if (storedPoliciesData) {
      const policiesList = JSON.parse(storedPoliciesData);
      // For now, simulate that some policies are assigned to this agent
      // In a real system, you'd have an agentId field in policy data
      const agentPolicies = policiesList.slice(0, 8); // Just take first 8 policies as a sample
      setPolicies(agentPolicies);
    }
    
    setLoading(false);
  }, [id, navigate]);

  const handleEditAgent = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedAgentData) => {
    // Load all agents
    const storedAgentsData = localStorage.getItem('agentsData');
    if (storedAgentsData) {
      const agentsList = JSON.parse(storedAgentsData);
      const agentIndex = agentsList.findIndex(a => a.id === parseInt(id));
      
      if (agentIndex !== -1) {
        // Merge the updated data with existing data that shouldn't be overwritten
        const currentAgent = agentsList[agentIndex];
        const mergedAgent = {
          ...currentAgent,
          ...updatedAgentData,
          // Keep certain fields that shouldn't be overwritten by the form
          agentId: currentAgent.agentId,
          clients: currentAgent.clients,
          policies: currentAgent.policies,
          commission: currentAgent.commission,
          performance: currentAgent.performance,
          id: currentAgent.id
        };
        
        // Update the agent in the list
        agentsList[agentIndex] = mergedAgent;
        
        // Update localStorage
        localStorage.setItem('agentsData', JSON.stringify(agentsList));
        
        // Update local state
        setAgent(mergedAgent);
        
        toast.success(`Agent ${mergedAgent.name} updated successfully`);
        setShowEditModal(false);
      }
    }
  };

  const calculateProgressPercentage = (achieved, target) => {
    if (!target || target === 0) return 0;
    const percentage = (achieved / target) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'amba-badge-green';
      case 'Probation':
        return 'amba-badge-yellow';
      case 'Inactive':
        return 'amba-badge-red';
      case 'Suspended':
        return 'amba-badge-gray';
      default:
        return 'amba-badge-blue';
    }
  };

  const getLicenseStatusBadgeClass = (status) => {
    switch (status) {
      case 'Valid':
        return 'amba-badge-green';
      case 'Expiring Soon':
        return 'amba-badge-yellow';
      case 'Expired':
        return 'amba-badge-red';
      case 'Suspended':
        return 'amba-badge-gray';
      default:
        return 'amba-badge-blue';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Agent Not Found</h2>
          <p className="text-gray-600 mb-6">The agent you're looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate('/agents')} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Agents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-4"
            onClick={() => navigate('/agents')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{agent.name}</h1>
            <div className="flex items-center mt-1">
              <span className="text-gray-500 text-sm">{agent.agentId}</span>
              <span className={`ml-3 amba-badge ${getStatusBadgeClass(agent.status)}`}>
                {agent.status}
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={handleEditAgent}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Agent
        </Button>
      </div>

      {/* Agent Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview" className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="commission" className="flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            Commission
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center">
            <FileCheck className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Agent Content */}
      <TabsContent value="overview" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Agent Info Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Agent Information</h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Email</span>
                    <span className="block text-gray-900">{agent.email}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Phone</span>
                    <span className="block text-gray-900">{agent.phone}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Address</span>
                    <span className="block text-gray-900">{agent.address}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Join Date</span>
                    <span className="block text-gray-900">{new Date(agent.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Manager</span>
                    <span className="block text-gray-900">{agent.manager}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Territory</span>
                    <span className="block text-gray-900">{agent.territory}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Performance Metrics</h2>
            </div>
            <div className="p-5">
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Monthly Target Achievement</span>
                  <span className="text-sm font-medium text-gray-700">
                    ₹{parseInt(agent.targets?.achieved || 0).toLocaleString()} / ₹{parseInt(agent.targets?.monthly || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-amba-blue h-2.5 rounded-full" 
                    style={{ width: `${calculateProgressPercentage(agent.targets?.achieved || 0, agent.targets?.monthly || 0)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <span className="text-sm text-gray-500 block">Last Month</span>
                  <div className="flex items-center">
                    <span className="text-xl font-semibold">{agent.performance?.lastMonth || 0}%</span>
                  </div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <span className="text-sm text-gray-500 block">Last Quarter</span>
                  <div className="flex items-center">
                    <span className="text-xl font-semibold">{agent.performance?.lastQuarter || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Specialization</h3>
                <div className="flex flex-wrap gap-2">
                  {agent.specialization?.map((specialty, index) => (
                    <span key={index} className="amba-badge amba-badge-blue">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* License & Commission Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">License Information</h2>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BadgeCheck className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <span className="block text-sm font-medium text-gray-500">License Number</span>
                      <span className="block text-gray-900">{agent.license?.number}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <span className="block text-sm font-medium text-gray-500">Issue Date</span>
                      <span className="block text-gray-900">{new Date(agent.license?.issueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <span className="block text-sm font-medium text-gray-500">Expiry Date</span>
                      <span className="block text-gray-900">{new Date(agent.license?.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <span className="block text-sm font-medium text-gray-500">Status</span>
                      <span className={`amba-badge ${getLicenseStatusBadgeClass(agent.license?.status)}`}>
                        {agent.license?.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Commission Summary</h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 block">This Month</span>
                    <span className="text-xl font-semibold text-gray-900">₹{parseInt(agent.commission?.thisMonth || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Pending</span>
                    <span className="text-xl font-semibold text-gray-900">₹{parseInt(agent.commission?.pending || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-500 block">Total Paid (All Time)</span>
                  <span className="text-xl font-semibold text-gray-900">₹{parseInt(agent.commission?.paid || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Performance Trend</h2>
          </div>
          <div className="p-5">
            <AgentPerformanceChart agentId={agent.id} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Clients</h3>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-amba-blue mr-2" />
              <span className="text-2xl font-bold text-gray-900">{agent.clients}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Policies</h3>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-amba-blue mr-2" />
              <span className="text-2xl font-bold text-gray-900">{agent.policies}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Overall Performance</h3>
            <div className="flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{agent.performance?.overall || 0}%</span>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="clients" className="mt-0">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Agent's Clients</h2>
          </div>
          <AgentClientsTable clients={clients} agentId={agent.id} />
        </div>
      </TabsContent>

      <TabsContent value="policies" className="mt-0">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Agent's Policies</h2>
          </div>
          <AgentPoliciesTable policies={policies} agentId={agent.id} />
        </div>
      </TabsContent>

      <TabsContent value="commission" className="mt-0">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Commission History</h2>
          </div>
          <AgentCommissionHistory agentId={agent.id} />
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Bank Details</h2>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-500">Account Holder</span>
                  <span className="block text-gray-900">{agent.bankDetails?.accountHolder}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Account Number</span>
                  <span className="block text-gray-900">{agent.bankDetails?.accountNumber}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-500">Bank Name</span>
                  <span className="block text-gray-900">{agent.bankDetails?.bankName}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">IFSC Code</span>
                  <span className="block text-gray-900">{agent.bankDetails?.ifscCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="documents" className="mt-0">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Agent Documents</h2>
          </div>
          <AgentDocuments agentId={agent.id} agent={agent} />
        </div>
      </TabsContent>

      {/* Edit Agent Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Agent</h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setShowEditModal(false)}
                  >
                    <span className="sr-only">Close</span>
                    <span className="text-xl font-medium">&times;</span>
                  </button>
                </div>
                <AgentForm 
                  onClose={() => setShowEditModal(false)}
                  onSuccess={handleEditSuccess}
                  existingData={agent}
                  isEdit={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDetails;
