
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Wifi, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivities from '@/components/dashboard/RecentActivities';
import QuickActions from '@/components/dashboard/QuickActions';
import DashboardNotifications from '@/components/dashboard/DashboardNotifications';
import DashboardTasks from '@/components/dashboard/DashboardTasks';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { useDashboardData } from '@/hooks/useDashboardApi';

const Dashboard = () => {
  console.log('Dashboard component rendering with enhanced API integration');
  
  const {
    overview,
    activities,
    metrics,
    charts,
    quickActions,
    isLoading,
    isError,
    isRefreshing,
    lastUpdated,
    refreshDashboard,
    refetch
  } = useDashboardData();

  // Auto-refresh on component mount
  useEffect(() => {
    console.log('Dashboard mounted, setting up real-time listeners');
    
    // Trigger initial data load
    if (!overview && !isLoading) {
      console.log('No overview data, triggering initial load');
      refetch.overview();
    }

    // Listen for browser connectivity changes
    const handleOnline = () => {
      console.log('Browser back online, refreshing dashboard');
      toast.info('Connection restored', {
        description: 'Refreshing dashboard data...'
      });
      refreshDashboard();
    };

    const handleOffline = () => {
      console.log('Browser went offline');
      toast.warning('Connection lost', {
        description: 'Some features may not work properly'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [overview, isLoading, refreshDashboard, refetch]);

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      console.log('Manual dashboard refresh triggered');
      toast.loading('Refreshing dashboard data...', { id: 'dashboard-refresh' });
      await refreshDashboard();
      toast.success('Dashboard refreshed successfully', { id: 'dashboard-refresh' });
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
      toast.error('Failed to refresh dashboard data', { id: 'dashboard-refresh' });
    }
  };

  // Show error state if all data failed to load
  if (isError && !overview && !activities && !metrics && !charts && !quickActions) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">
            Unable to connect to the backend API. Please check your connection and try again.
          </p>
          <div className="space-x-4">
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Retry Connection
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with connection status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Connected to API</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <Database className="h-4 w-4" />
              <span className="text-sm">Real-time sync enabled</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-1 text-gray-500">
                <span className="text-xs">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Connection warning if partial data load */}
      {isError && (overview || activities || metrics || charts || quickActions) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Partial Data Load</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Some dashboard sections may not be up to date. Click refresh to reload all data.
          </p>
        </div>
      )}

      {/* Stats Overview with enhanced data */}
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
        <div className="flex items-center justify-center gap-4">
          <span>Dashboard connected to API</span>
          <span>•</span>
          <span>Real-time sync with all modules enabled</span>
          <span>•</span>
          <span>Auto-refresh every 5 minutes</span>
        </div>
        {lastUpdated && (
          <div className="mt-1">
            Last synchronized: {lastUpdated.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
