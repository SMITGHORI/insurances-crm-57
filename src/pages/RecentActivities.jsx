
import React, { useState } from 'react';
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
import { useActivities } from '@/hooks/useRecentActivities';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const RecentActivities = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const isMobile = useIsMobile();

  // Prepare query parameters for API call
  const queryParams = {
    search: searchQuery,
    type: activeTab !== 'all' ? activeTab : typeFilter,
    dateFilter,
    agentId: agentFilter !== 'all' ? agentFilter : undefined,
    page: 1,
    limit: 100
  };

  // Use React Query to fetch activities
  const { data: activitiesData, isLoading, error } = useActivities(queryParams);
  const activities = activitiesData?.activities || [];

  // Filter activities based on search query and active tab
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      searchQuery === '' ||
      (activity.action?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (activity.client?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (activity.agent?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (activity.details?.toLowerCase().includes(searchQuery.toLowerCase()) || '');
    
    // Filter by type tab
    let matchesTab = true;
    if (activeTab !== 'all') {
      matchesTab = activity.type === activeTab;
    }
    
    return matchesSearch && matchesTab;
  });

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

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

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

      {error ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-8 text-center">
            <p className="text-red-600">Error loading activities: {error.message}</p>
          </div>
        </div>
      ) : isMobile ? (
        <ActivitiesMobileView 
          activities={filteredActivities} 
          loading={isLoading} 
        />
      ) : (
        <ActivitiesDesktopView 
          activities={filteredActivities} 
          loading={isLoading} 
          getActivityIcon={getActivityIcon} 
          formatDate={formatDate} 
        />
      )}
    </div>
  );
};

export default RecentActivities;
