import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  Star,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import ActivityFilters from '@/components/activities/ActivityFilters';
import ActivityTabs from '@/components/activities/ActivityTabs';
import ActivitiesMobileView from '@/components/activities/ActivitiesMobileView';
import ActivitiesDesktopView from '@/components/activities/ActivitiesDesktopView';

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
  const isMobile = useIsMobile();

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
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'quotation':
        return <FileText className="h-5 w-5 text-purple-500" />;
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
    <div className="container mx-auto px-4 py-4 md:py-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Recent Activities</h1>
      </div>

      <ActivityFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        agentFilter={agentFilter}
        setAgentFilter={setAgentFilter}
        uniqueAgents={uniqueAgents}
        handleResetFilters={handleResetFilters}
      />

      <ActivityTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {isMobile ? (
        <ActivitiesMobileView 
          activities={filteredActivities} 
          loading={loading} 
        />
      ) : (
        <ActivitiesDesktopView 
          activities={filteredActivities} 
          loading={loading} 
          getActivityIcon={getActivityIcon} 
          formatDate={formatDate} 
        />
      )}
    </div>
  );
};

export default RecentActivities;
