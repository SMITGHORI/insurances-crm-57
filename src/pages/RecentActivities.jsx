
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  Star,
  Clock,
  AlertCircle,
  TrendingUp,
  Database,
  Wifi,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import ActivityFilters from '@/components/activities/ActivityFilters';
import ActivityTabs from '@/components/activities/ActivityTabs';
import ActivitiesMobileView from '@/components/activities/ActivitiesMobileView';
import ActivitiesDesktopView from '@/components/activities/ActivitiesDesktopView';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useDebouncedValue } from '@/hooks/useDebouncedSearch';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useActivities, useRealtimeActivities } from '@/hooks/useRecentActivities';
import AdvancedActivityFilters from '@/components/activities/AdvancedActivityFilters';
import ActivityAnalytics from '@/components/activities/ActivityAnalytics';
import { Button } from '@/components/ui/button';

const RecentActivities = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const isMobile = useIsMobile();

  // Performance monitoring
  const { renderTime } = usePerformanceMonitor('RecentActivities');

  // Debounced search for better performance
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // Memoized query parameters
  const queryParams = useMemo(() => ({
    search: debouncedSearchQuery,
    type: activeTab !== 'all' ? activeTab : typeFilter,
    dateFilter,
    agentId: agentFilter !== 'all' ? agentFilter : undefined,
    page: 1,
    limit: 100
  }), [debouncedSearchQuery, activeTab, typeFilter, dateFilter, agentFilter]);

  // Use MongoDB-connected activities hook
  const { data: activitiesData, isLoading, error, refetch } = useActivities(queryParams);

  // Set up real-time updates
  const { refreshActivities } = useRealtimeActivities();

  // Memoized activities data from MongoDB
  const activities = useMemo(() => activitiesData?.activities || [], [activitiesData]);

  // Memoized filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = 
        debouncedSearchQuery === '' ||
        (activity.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || '') ||
        (activity.action?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || '') ||
        (activity.userName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || '') ||
        (activity.entityName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || '') ||
        (activity.details?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || '');
      
      let matchesTab = true;
      if (activeTab !== 'all') {
        matchesTab = activity.type === activeTab;
      }
      
      return matchesSearch && matchesTab;
    });
  }, [activities, debouncedSearchQuery, activeTab]);

  // Memoized unique agents from MongoDB data
  const uniqueAgents = useMemo(() => 
    [...new Set(activities.map(activity => activity.userName))].filter(Boolean).sort(),
    [activities]
  );

  // Set up real-time listeners for cross-module updates
  useEffect(() => {
    console.log('Setting up real-time MongoDB listeners for activities');
    
    const handleModuleUpdate = (event) => {
      console.log(`Activities module received ${event.type} event, refreshing data`);
      toast.info('Activities updated', {
        description: 'Real-time sync from MongoDB'
      });
      refreshActivities();
    };

    const events = [
      'client-updated', 'client-created', 'client-deleted',
      'policy-updated', 'policy-created', 'policy-deleted',
      'claim-updated', 'claim-created', 'claim-deleted',
      'lead-updated', 'lead-created', 'lead-deleted',
      'quotation-updated', 'quotation-created', 'quotation-deleted',
      'offer-updated', 'offer-created', 'offer-deleted',
      'broadcast-sent', 'broadcast-created'
    ];

    events.forEach(eventType => {
      window.addEventListener(eventType, handleModuleUpdate);
    });

    return () => {
      events.forEach(eventType => {
        window.removeEventListener(eventType, handleModuleUpdate);
      });
    };
  }, [refreshActivities]);

  // Memoized callback functions
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveTab('all');
    setDateFilter('all');
    setTypeFilter('all');
    setAgentFilter('all');
    toast.success('Filters have been reset');
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      console.log('Manual refresh of activities from MongoDB');
      toast.loading('Refreshing activities from MongoDB...');
      await refetch();
      toast.success('Activities refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh activities:', error);
      toast.error('Failed to refresh activities');
    }
  }, [refetch]);

  const getActivityIcon = useCallback((type) => {
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
  }, []);

  const formatDate = useCallback((dateString) => {
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
  }, []);

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Show MongoDB connection error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <Database className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">MongoDB Connection Error</h2>
          <p className="text-gray-600 mb-6">
            Unable to connect to MongoDB for activities data.
          </p>
          <Button onClick={handleRefresh} className="mr-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Recent Activities</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Connected to MongoDB</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <Database className="h-4 w-4" />
              <span className="text-sm">Real-time sync enabled</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={showAnalytics ? "default" : "outline"}
            onClick={() => setShowAnalytics(!showAnalytics)}
            size="sm"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 flex items-center">
              Render: {renderTime}ms
            </div>
          )}
        </div>
      </div>

      {/* Show Analytics or Activities */}
      {showAnalytics ? (
        <ActivityAnalytics activities={filteredActivities} />
      ) : (
        <>
          <AdvancedActivityFilters 
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
        </>
      )}

      {/* Real-time Data Footer */}
      <div className="text-center text-sm text-gray-500 py-4 border-t mt-6">
        Connected to MongoDB • {filteredActivities.length} activities • 
        Real-time sync enabled • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default React.memo(RecentActivities);
