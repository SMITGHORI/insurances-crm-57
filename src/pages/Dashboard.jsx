
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivities from '@/components/dashboard/RecentActivities';
import QuickActions from '@/components/dashboard/QuickActions';
import DashboardNotifications from '@/components/dashboard/DashboardNotifications';
import DashboardTasks from '@/components/dashboard/DashboardTasks';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { useDashboardData, useRefreshDashboard } from '@/hooks/useDashboard';

const Dashboard = () => {
  console.log('Dashboard component rendering with MongoDB integration');
  
  const {
    overview,
    activities,
    metrics,
    charts,
    quickActions,
    isLoading,
    isError,
    refetch
  } = useDashboardData();

  const { refreshDashboard } = useRefreshDashboard();

  // Set up real-time listeners for module updates
  useEffect(() => {
    console.log('Setting up real-time MongoDB listeners for dashboard');
    
    const handleModuleUpdate = (event) => {
      console.log(`Dashboard received ${event.type} event, refreshing data`);
      toast.info('Dashboard data updated', {
        description: 'Real-time sync from database'
      });
      
      // Refresh relevant sections based on the update
      switch (event.type) {
        case 'client-updated':
        case 'lead-updated':
          refetch.overview();
          refetch.activities();
          break;
        case 'policy-updated':
        case 'claim-updated':
          refetch.overview();
          refetch.charts();
          refetch.quickActions();
          break;
        case 'quotation-updated':
          refetch.overview();
          refetch.activities();
          break;
        case 'offer-updated':
        case 'broadcast-sent':
          refetch.metrics();
          refetch.activities();
          break;
        default:
          // Refresh all data for unknown events
          Object.values(refetch).forEach(fn => fn());
      }
    };

    // Listen to all module update events
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
  }, [refetch]);

  const handleRefresh = async () => {
    try {
      console.log('Manual dashboard refresh triggered');
      toast.loading('Refreshing dashboard data from MongoDB...');
      await refreshDashboard();
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
      toast.error('Failed to refresh dashboard data');
    }
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <Database className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Database Connection Error</h2>
          <p className="text-gray-600 mb-6">
            Unable to connect to MongoDB. Please check your backend connection.
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
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with real-time status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
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
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview from MongoDB */}
      <DashboardStats 
        overview={overview} 
        metrics={metrics} 
        isLoading={isLoading} 
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCharts 
            data={charts} 
            isLoading={isLoading} 
          />
        </div>

        {/* Right Column - Activities and Actions */}
        <div className="space-y-6">
          <QuickActions 
            data={quickActions} 
            isLoading={isLoading} 
          />
          
          <RecentActivities 
            data={activities} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      {/* Bottom Row - Notifications and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardNotifications />
        <DashboardTasks />
      </div>

      {/* Real-time Data Footer */}
      <div className="text-center text-sm text-gray-500 py-4 border-t">
        Dashboard connected to MongoDB • Last updated: {new Date().toLocaleTimeString()} • 
        Real-time sync with all modules enabled
      </div>
    </div>
  );
};

export default Dashboard;
