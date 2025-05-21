
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  Star, 
  FileEdit, 
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Link
} from 'lucide-react';
import { toast } from 'sonner';

const RecentActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  // Sample activities data
  useEffect(() => {
    setLoading(true);
    
    // Try to get activities from localStorage
    const storedActivities = localStorage.getItem('activitiesData');
    let activitiesList = [];
    
    if (storedActivities) {
      activitiesList = JSON.parse(storedActivities);
    } else {
      // Sample activities data as fallback
      activitiesList = [
        {
          id: 1,
          action: 'New client registered',
          client: 'Vivek Patel',
          clientId: 12,
          time: '2025-05-20T10:30:00',
          timestamp: '2 hours ago',
          type: 'client',
          agent: 'Rahul Sharma',
          agentId: 3,
          details: 'Client registered with email vivek.patel@email.com'
        },
        {
          id: 2,
          action: 'Policy issued',
          client: 'Priya Desai',
          clientId: 8,
          time: '2025-05-20T08:15:00',
          timestamp: '4 hours ago',
          type: 'policy',
          agent: 'Neha Gupta',
          agentId: 5,
          policyNumber: 'POL-2025-0042',
          policyId: 42,
          details: 'Health insurance policy issued'
        },
        {
          id: 3,
          action: 'Claim approved',
          client: 'Arjun Singh',
          clientId: 15,
          time: '2025-05-20T07:25:00',
          timestamp: '5 hours ago',
          type: 'claim',
          agent: 'Rahul Sharma',
          agentId: 3,
          claimId: 28,
          claimNumber: 'CLM-2025-0028',
          details: 'Claim approved for ₹45,000'
        },
        {
          id: 4,
          action: 'Premium reminder sent',
          client: 'Tech Solutions Ltd',
          clientId: 22,
          time: '2025-05-20T04:45:00',
          timestamp: '8 hours ago',
          type: 'reminder',
          agent: 'Ananya Patel',
          agentId: 7,
          policyId: 53,
          policyNumber: 'POL-2025-0053',
          details: 'Premium reminder sent for policy due on 15/06/2025'
        },
        {
          id: 5,
          action: 'Quotation generated',
          client: 'Meera Joshi',
          clientId: 18,
          time: '2025-05-20T02:15:00',
          timestamp: '10 hours ago',
          type: 'quotation',
          agent: 'Vikram Malhotra',
          agentId: 2,
          quotationId: 67,
          quotationNumber: 'QT-2025-0067',
          details: 'Term insurance quotation for ₹1 crore coverage'
        },
        {
          id: 6,
          action: 'Policy renewed',
          client: 'Rajesh Sharma',
          clientId: 9,
          time: '2025-05-19T16:30:00',
          timestamp: '1 day ago',
          type: 'policy',
          agent: 'Neha Gupta',
          agentId: 5,
          policyId: 31,
          policyNumber: 'POL-2024-0031',
          details: 'Vehicle insurance policy renewed for 1 year'
        },
        {
          id: 7,
          action: 'Document uploaded',
          client: 'Aarav Patel',
          clientId: 27,
          time: '2025-05-19T14:20:00',
          timestamp: '1 day ago',
          type: 'document',
          agent: 'Ananya Patel',
          agentId: 7,
          documentType: 'KYC',
          details: 'Address proof uploaded'
        },
        {
          id: 8,
          action: 'Lead converted',
          client: 'Sunita Verma',
          clientId: 33,
          time: '2025-05-19T11:10:00',
          timestamp: '1 day ago',
          type: 'lead',
          agent: 'Vikram Malhotra',
          agentId: 2,
          leadId: 45,
          details: 'Lead converted to client'
        },
        {
          id: 9,
          action: 'Claim filed',
          client: 'InfoTech Solutions',
          clientId: 16,
          time: '2025-05-19T09:15:00',
          timestamp: '1 day ago',
          type: 'claim',
          agent: 'Rahul Sharma',
          agentId: 3,
          claimId: 29,
          claimNumber: 'CLM-2025-0029',
          details: 'Claim filed for property damage'
        },
        {
          id: 10,
          action: 'Client details updated',
          client: 'Priya Desai',
          clientId: 8,
          time: '2025-05-18T16:45:00',
          timestamp: '2 days ago',
          type: 'client',
          agent: 'Neha Gupta',
          agentId: 5,
          details: 'Phone number and address updated'
        },
        {
          id: 11,
          action: 'Payment received',
          client: 'Arjun Singh',
          clientId: 15,
          time: '2025-05-18T13:30:00',
          timestamp: '2 days ago',
          type: 'payment',
          agent: 'Rahul Sharma',
          agentId: 3,
          amount: '₹25,000',
          policyId: 42,
          policyNumber: 'POL-2025-0042',
          details: 'Policy premium payment received'
        },
        {
          id: 12,
          action: 'Policy canceled',
          client: 'Tech Solutions Ltd',
          clientId: 22,
          time: '2025-05-18T10:20:00',
          timestamp: '2 days ago',
          type: 'policy',
          agent: 'Ananya Patel',
          agentId: 7,
          policyId: 39,
          policyNumber: 'POL-2025-0039',
          details: 'Policy canceled at client request'
        },
        {
          id: 13,
          action: 'New lead registered',
          client: 'Rohit Kapoor',
          clientId: null,
          time: '2025-05-18T08:15:00',
          timestamp: '2 days ago',
          type: 'lead',
          agent: 'Vikram Malhotra',
          agentId: 2,
          leadId: 46,
          details: 'Lead generated from website inquiry'
        },
        {
          id: 14,
          action: 'Endorsement applied',
          client: 'Meera Joshi',
          clientId: 18,
          time: '2025-05-17T16:50:00',
          timestamp: '3 days ago',
          type: 'policy',
          agent: 'Neha Gupta',
          agentId: 5,
          policyId: 48,
          policyNumber: 'POL-2025-0048',
          details: 'Added family member to health insurance'
        },
        {
          id: 15,
          action: 'Commission paid',
          client: null,
          clientId: null,
          time: '2025-05-17T14:30:00',
          timestamp: '3 days ago',
          type: 'commission',
          agent: 'Rahul Sharma',
          agentId: 3,
          amount: '₹12,500',
          details: 'Monthly commission paid'
        }
      ];
      
      // Save sample data to localStorage
      localStorage.setItem('activitiesData', JSON.stringify(activitiesList));
    }
    
    setActivities(activitiesList);
    setFilteredActivities(activitiesList);
    setLoading(false);
  }, []);

  // Filter activities based on search and filters
  useEffect(() => {
    let result = activities;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(activity => 
        (activity.action && activity.action.toLowerCase().includes(query)) ||
        (activity.client && activity.client.toLowerCase().includes(query)) ||
        (activity.agent && activity.agent.toLowerCase().includes(query)) ||
        (activity.details && activity.details.toLowerCase().includes(query))
      );
    }
    
    // Filter by tab (activity type)
    if (activeTab !== 'all') {
      result = result.filter(activity => activity.type === activeTab);
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      switch (dateFilter) {
        case 'today':
          result = result.filter(activity => {
            const activityDate = new Date(activity.time).getTime();
            return activityDate >= today;
          });
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStart = yesterday.getTime();
          
          result = result.filter(activity => {
            const activityDate = new Date(activity.time).getTime();
            return activityDate >= yesterdayStart && activityDate < today;
          });
          break;
        case 'week':
          const lastWeek = new Date(today);
          lastWeek.setDate(lastWeek.getDate() - 7);
          const weekStart = lastWeek.getTime();
          
          result = result.filter(activity => {
            const activityDate = new Date(activity.time).getTime();
            return activityDate >= weekStart;
          });
          break;
        case 'month':
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          const monthStart = lastMonth.getTime();
          
          result = result.filter(activity => {
            const activityDate = new Date(activity.time).getTime();
            return activityDate >= monthStart;
          });
          break;
      }
    }
    
    // Filter by agent
    if (agentFilter !== 'all') {
      result = result.filter(activity => activity.agent === agentFilter);
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
      result = result.filter(activity => activity.type === typeFilter);
    }
    
    setFilteredActivities(result);
  }, [activities, searchQuery, activeTab, dateFilter, typeFilter, agentFilter]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
    setDateFilter('all');
    setTypeFilter('all');
    setAgentFilter('all');
    toast.success('Filters have been reset');
  };

  // Get unique agents for filter
  const uniqueAgents = [...new Set(activities.map(activity => activity.agent))].filter(Boolean).sort();
  
  // Get activity icon by type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'client':
        return <Users className="h-5 w-5 text-amba-blue" />;
      case 'policy':
        return <FileText className="h-5 w-5 text-amba-orange" />;
      case 'claim':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'quotation':
        return <FileEdit className="h-5 w-5 text-purple-500" />;
      case 'lead':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'payment':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'commission':
        return <FileText className="h-5 w-5 text-amba-orange" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Handle navigation to related entities
  const handleNavigateToClient = (id) => {
    if (id) navigate(`/clients/${id}`);
  };

  const handleNavigateToAgent = (id) => {
    if (id) navigate(`/agents/${id}`);
  };

  const handleNavigateToPolicy = (id) => {
    if (id) navigate(`/policies/${id}`);
  };

  const handleNavigateToQuotation = (id) => {
    if (id) navigate(`/quotations/${id}`);
  };

  const handleNavigateToClaim = (id) => {
    if (id) navigate(`/claims/${id}`);
  };

  const handleNavigateToLead = (id) => {
    if (id) navigate(`/leads/${id}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Recent Activities</h1>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search activities by action, client, agent or details..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Date Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="claim">Claim</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="quotation">Quotation</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="commission">Commission</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-[180px]">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {uniqueAgents.map((agent) => (
                  <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={handleResetFilters}
              className="flex items-center"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all" className="flex items-center">
              All Activities
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Client
            </TabsTrigger>
            <TabsTrigger value="policy" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Policy
            </TabsTrigger>
            <TabsTrigger value="claim" className="flex items-center">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Claims
            </TabsTrigger>
            <TabsTrigger value="lead" className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              Leads
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
                <TableHead>Activity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-full p-2 mr-3">
                          {getActivityIcon(activity.type)}
                        </div>
                        <span>{activity.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{activity.type}</span>
                    </TableCell>
                    <TableCell>
                      {activity.client ? (
                        <div 
                          className="flex items-center text-primary hover:underline cursor-pointer"
                          onClick={() => handleNavigateToClient(activity.clientId)}
                        >
                          <Link className="h-4 w-4 mr-1" />
                          {activity.client}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div 
                        className="flex items-center text-primary hover:underline cursor-pointer"
                        onClick={() => handleNavigateToAgent(activity.agentId)}
                      >
                        <Link className="h-4 w-4 mr-1" />
                        {activity.agent}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{formatDate(activity.time)}</div>
                        <div className="text-xs text-gray-500">{activity.timestamp}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{activity.details}</div>
                        {activity.policyId && (
                          <button 
                            className="text-xs text-amba-blue hover:text-amba-lightblue mr-2"
                            onClick={() => handleNavigateToPolicy(activity.policyId)}
                          >
                            View Policy
                          </button>
                        )}
                        {activity.claimId && (
                          <button 
                            className="text-xs text-amba-blue hover:text-amba-lightblue mr-2"
                            onClick={() => handleNavigateToClaim(activity.claimId)}
                          >
                            View Claim
                          </button>
                        )}
                        {activity.quotationId && (
                          <button 
                            className="text-xs text-amba-blue hover:text-amba-lightblue mr-2"
                            onClick={() => handleNavigateToQuotation(activity.quotationId)}
                          >
                            View Quotation
                          </button>
                        )}
                        {activity.leadId && (
                          <button 
                            className="text-xs text-amba-blue hover:text-amba-lightblue"
                            onClick={() => handleNavigateToLead(activity.leadId)}
                          >
                            View Lead
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No activities found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
