
import React, { useState, Suspense } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  useDashboardOverview, 
  useRecentActivities, 
  usePerformanceMetrics,
  useChartsData,
  useQuickActions,
  useRefreshDashboard 
} from '@/hooks/useDashboard';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import DashboardNotifications from '@/components/dashboard/DashboardNotifications';
import DashboardTasks from '@/components/dashboard/DashboardTasks';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivities from '@/components/dashboard/RecentActivities';

const DashboardContent = ({ isMobile }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  // Real-time data hooks
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useDashboardOverview();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities(10);
  const { data: metrics, isLoading: metricsLoading } = usePerformanceMetrics('30d');
  const { data: charts, isLoading: chartsLoading } = useChartsData('all');
  const { data: quickActions, isLoading: quickActionsLoading } = useQuickActions();
  const { refreshDashboard } = useRefreshDashboard();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDashboard();
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700"
          size={isMobile ? "sm" : "default"}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats 
        overview={overview} 
        metrics={metrics} 
        isLoading={overviewLoading || metricsLoading} 
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCharts 
            data={charts} 
            isLoading={chartsLoading}
          />
        </div>

        {/* Right Column - Tasks and Notifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardTasks />
            <DashboardNotifications />
          </div>
          
          <QuickActions 
            data={quickActions} 
            isLoading={quickActionsLoading}
          />
        </div>
      </div>

      {/* Recent Activities */}
      <RecentActivities 
        data={activities} 
        isLoading={activitiesLoading}
      />
    </>
  );
};

const Dashboard = () => {
  const isMobile = useIsMobile();
  
  console.log('Dashboard component rendering');
  
  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Real-time overview of your insurance business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <DashboardContent isMobile={isMobile} />
      </Suspense>
    </div>
  );
};

export default Dashboard;
