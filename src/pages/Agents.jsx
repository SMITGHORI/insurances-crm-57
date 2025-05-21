
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Download, 
  Filter,
  Users,
  UserCheck,
  Star,
  ArrowUpDown,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateAgentId } from '../utils/idGenerator';
import AgentForm from '../components/agents/AgentForm';
import AgentPerformanceIndicator from '../components/agents/AgentPerformanceIndicator';

const Agents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [agentTypeFilter, setAgentTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Try to get agents from localStorage
    const storedAgentsData = localStorage.getItem('agentsData');
    let agentsList = [];
    
    if (storedAgentsData) {
      agentsList = JSON.parse(storedAgentsData);
    } else {
      // Sample agents data as fallback
      agentsList = [
        {
          id: 1,
          agentId: 'AMB-AGT-2025-0001',
          name: 'Priya Sharma',
          type: 'Full-Time',
          email: 'priya.sharma@ambains.com',
          phone: '+91 9876543210',
          address: 'Mumbai, Maharashtra',
          joinDate: '2023-01-15',
          status: 'Active',
          clients: 12,
          policies: 18,
          commission: {
            pending: 45000,
            paid: 120000,
            thisMonth: 15000
          },
          specialization: ['Health', 'Life'],
          targets: {
            monthly: 500000,
            achieved: 320000,
          },
          license: {
            number: 'IRDA-AG-12345',
            expiryDate: '2026-03-01',
            issueDate: '2023-03-01',
            status: 'Valid'
          },
          bankDetails: {
            accountNumber: 'XXXX4567',
            bankName: 'HDFC Bank',
            ifscCode: 'HDFC0001234',
            accountHolder: 'Priya Sharma'
          },
          documents: {
            idProof: null,
            addressProof: null,
            licenseDocument: null,
            agreementCopy: null
          },
          manager: 'Rajesh Kumar',
          territory: 'Mumbai North',
          performance: {
            lastMonth: 92,
            lastQuarter: 88,
            overall: 90
          }
        },
        {
          id: 2,
          agentId: 'AMB-AGT-2025-0002',
          name: 'Vikram Singh',
          type: 'Part-Time',
          email: 'vikram.singh@ambains.com',
          phone: '+91 8765432109',
          address: 'Delhi, Delhi',
          joinDate: '2024-02-20',
          status: 'Active',
          clients: 8,
          policies: 10,
          commission: {
            pending: 25000,
            paid: 60000,
            thisMonth: 8000
          },
          specialization: ['Motor', 'Property'],
          targets: {
            monthly: 300000,
            achieved: 150000,
          },
          license: {
            number: 'IRDA-AG-23456',
            expiryDate: '2026-05-15',
            issueDate: '2024-02-15',
            status: 'Valid'
          },
          bankDetails: {
            accountNumber: 'XXXX7890',
            bankName: 'ICICI Bank',
            ifscCode: 'ICIC0002345',
            accountHolder: 'Vikram Singh'
          },
          documents: {
            idProof: null,
            addressProof: null,
            licenseDocument: null,
            agreementCopy: null
          },
          manager: 'Rajesh Kumar',
          territory: 'Delhi South',
          performance: {
            lastMonth: 75,
            lastQuarter: 70,
            overall: 72
          }
        },
        {
          id: 3,
          agentId: 'AMB-AGT-2025-0003',
          name: 'Ananya Patel',
          type: 'Full-Time',
          email: 'ananya.patel@ambains.com',
          phone: '+91 7654321098',
          address: 'Bangalore, Karnataka',
          joinDate: '2022-08-10',
          status: 'Active',
          clients: 25,
          policies: 42,
          commission: {
            pending: 80000,
            paid: 250000,
            thisMonth: 22000
          },
          specialization: ['Health', 'Life', 'Group'],
          targets: {
            monthly: 800000,
            achieved: 760000,
          },
          license: {
            number: 'IRDA-AG-34567',
            expiryDate: '2025-11-05',
            issueDate: '2022-08-05',
            status: 'Valid'
          },
          bankDetails: {
            accountNumber: 'XXXX1234',
            bankName: 'SBI',
            ifscCode: 'SBIN0003456',
            accountHolder: 'Ananya Patel'
          },
          documents: {
            idProof: null,
            addressProof: null,
            licenseDocument: null,
            agreementCopy: null
          },
          manager: 'Meera Shah',
          territory: 'Bangalore Central',
          performance: {
            lastMonth: 95,
            lastQuarter: 93,
            overall: 94
          }
        },
        {
          id: 4,
          agentId: 'AMB-AGT-2025-0004',
          name: 'Rahul Mehta',
          type: 'Full-Time',
          email: 'rahul.mehta@ambains.com',
          phone: '+91 9876543211',
          address: 'Chennai, Tamil Nadu',
          joinDate: '2024-01-05',
          status: 'Probation',
          clients: 5,
          policies: 7,
          commission: {
            pending: 15000,
            paid: 10000,
            thisMonth: 5000
          },
          specialization: ['Motor'],
          targets: {
            monthly: 200000,
            achieved: 120000,
          },
          license: {
            number: 'IRDA-AG-45678',
            expiryDate: '2027-01-01',
            issueDate: '2024-01-01',
            status: 'Valid'
          },
          bankDetails: {
            accountNumber: 'XXXX5678',
            bankName: 'Axis Bank',
            ifscCode: 'UTIB0004567',
            accountHolder: 'Rahul Mehta'
          },
          documents: {
            idProof: null,
            addressProof: null,
            licenseDocument: null,
            agreementCopy: null
          },
          manager: 'Meera Shah',
          territory: 'Chennai North',
          performance: {
            lastMonth: 68,
            lastQuarter: 0, // New agent
            overall: 68
          }
        },
        {
          id: 5,
          agentId: 'AMB-AGT-2025-0005',
          name: 'Sarita Jain',
          type: 'Part-Time',
          email: 'sarita.jain@ambains.com',
          phone: '+91 8765432108',
          address: 'Pune, Maharashtra',
          joinDate: '2023-06-22',
          status: 'Inactive',
          clients: 10,
          policies: 15,
          commission: {
            pending: 0,
            paid: 85000,
            thisMonth: 0
          },
          specialization: ['Life', 'Investment'],
          targets: {
            monthly: 400000,
            achieved: 0, // Inactive
          },
          license: {
            number: 'IRDA-AG-56789',
            expiryDate: '2026-06-15',
            issueDate: '2023-06-15',
            status: 'Valid'
          },
          bankDetails: {
            accountNumber: 'XXXX9012',
            bankName: 'Kotak Mahindra Bank',
            ifscCode: 'KKBK0005678',
            accountHolder: 'Sarita Jain'
          },
          documents: {
            idProof: null,
            addressProof: null,
            licenseDocument: null,
            agreementCopy: null
          },
          manager: 'Rajesh Kumar',
          territory: 'Pune East',
          performance: {
            lastMonth: 0, // Inactive
            lastQuarter: 65,
            overall: 72
          }
        }
      ];
      
      // Save sample data to localStorage
      localStorage.setItem('agentsData', JSON.stringify(agentsList));
    }
    
    setAgents(agentsList);
    setLoading(false);
  }, []);

  // Filter options
  const statusOptions = ['All', 'Active', 'Probation', 'Inactive', 'Suspended'];

  // Filtered agents based on search term, status filter, and agent type filter
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.phone?.includes(searchTerm) ||
      (agent.agentId && agent.agentId.includes(searchTerm)) ||
      (agent.territory && agent.territory.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatusFilter = statusFilter === 'All' || 
      agent.status === statusFilter;
    
    const matchesTypeFilter = agentTypeFilter === 'all' || 
      agent.type?.toLowerCase().replace('-', '') === agentTypeFilter.toLowerCase();
    
    return matchesSearch && matchesStatusFilter && matchesTypeFilter;
  });

  // Sort the filtered agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle nested properties like commission.pending
    if (sortField === 'commission') {
      aValue = a.commission?.thisMonth || 0;
      bValue = b.commission?.thisMonth || 0;
    } else if (sortField === 'performance') {
      aValue = a.performance?.overall || 0;
      bValue = b.performance?.overall || 0;
    }
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddAgent = () => {
    setShowAddModal(true);
  };

  const handleAgentFormSuccess = (agentData) => {
    // Generate a unique agent ID
    const newAgentId = generateAgentId();
    
    // Create new agent with ID
    const newAgent = {
      id: agents.length > 0 ? Math.max(...agents.map(a => a.id)) + 1 : 1,
      agentId: newAgentId,
      ...agentData,
      clients: 0,
      policies: 0,
      commission: {
        pending: 0,
        paid: 0,
        thisMonth: 0
      },
      targets: {
        monthly: agentData.targets?.monthly || 0,
        achieved: 0,
      },
      documents: {
        idProof: null,
        addressProof: null,
        licenseDocument: null,
        agreementCopy: null
      },
      performance: {
        lastMonth: 0,
        lastQuarter: 0,
        overall: 0
      }
    };
    
    // Add to agents list
    const updatedAgents = [...agents, newAgent];
    setAgents(updatedAgents);
    
    // Update localStorage
    localStorage.setItem('agentsData', JSON.stringify(updatedAgents));
    
    toast.success(`Agent ${agentData.name} added successfully with ID: ${newAgentId}`);
    setShowAddModal(false);
  };

  const handleViewAgent = (id) => {
    navigate(`/agents/${id}`);
  };

  const handleExport = () => {
    // Create a CSV string
    const headers = [
      'ID', 'Agent ID', 'Name', 'Type', 'Email', 'Phone', 
      'Status', 'Join Date', 'Clients', 'Policies', 
      'Commission (Pending)', 'Commission (Paid)', 'Territory'
    ];
    
    const rows = filteredAgents.map(agent => [
      agent.id,
      agent.agentId || '',
      agent.name || '',
      agent.type || '',
      agent.email || '',
      agent.phone || '',
      agent.status || '',
      agent.joinDate || '',
      agent.clients || 0,
      agent.policies || 0,
      agent.commission?.pending || 0,
      agent.commission?.paid || 0,
      agent.territory || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `agents_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Agents exported successfully');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Agent Management</h1>
        <Button 
          onClick={handleAddAgent}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="mr-1 h-4 w-4" /> New Agent
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4 bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search agents by name, email, ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-amba-blue focus:border-amba-blue sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        <Tabs 
          value={agentTypeFilter} 
          onValueChange={setAgentTypeFilter} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              All Agents
            </TabsTrigger>
            <TabsTrigger value="fulltime" className="flex items-center">
              <UserCheck className="mr-2 h-4 w-4" />
              Full-Time
            </TabsTrigger>
            <TabsTrigger value="parttime" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Part-Time
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
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Agent Name
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Agent ID</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Territory</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('clients')}
                >
                  <div className="flex items-center">
                    Clients
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('commission')}
                >
                  <div className="flex items-center">
                    Commission (This Month)
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('performance')}
                >
                  <div className="flex items-center">
                    Performance
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAgents.length > 0 ? (
                sortedAgents.map((agent) => (
                  <TableRow 
                    key={agent.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewAgent(agent.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-amba-blue" />
                        {agent.name}
                      </div>
                    </TableCell>
                    <TableCell>{agent.agentId}</TableCell>
                    <TableCell>
                      <span className={`amba-badge ${agent.type === 'Full-Time' ? 'amba-badge-blue' : 'amba-badge-purple'}`}>
                        {agent.type}
                      </span>
                    </TableCell>
                    <TableCell>{agent.territory}</TableCell>
                    <TableCell>
                      <span className={`amba-badge ${
                        agent.status === 'Active' ? 'amba-badge-green' : 
                        agent.status === 'Probation' ? 'amba-badge-yellow' :
                        agent.status === 'Inactive' ? 'amba-badge-red' :
                        'amba-badge-gray'
                      }`}>
                        {agent.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {agent.clients}
                        <span className="text-gray-400 ml-1">({agent.policies} policies)</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ₹{parseInt(agent.commission?.thisMonth || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Pending: ₹{parseInt(agent.commission?.pending || 0).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <AgentPerformanceIndicator score={agent.performance?.overall || 0} />
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAgent(agent.id);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No agents found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Agent</h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setShowAddModal(false)}
                  >
                    <span className="sr-only">Close</span>
                    <span className="text-xl font-medium">&times;</span>
                  </button>
                </div>
                <AgentForm 
                  onClose={() => setShowAddModal(false)}
                  onSuccess={handleAgentFormSuccess}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
