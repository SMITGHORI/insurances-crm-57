
import React, { useState, Suspense } from 'react';
import { RefreshCw, TrendingUp, BarChart3, Users, Calendar, Bell, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [activeTab, setActiveTab] = useState('overview');
  
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats 
        overview={overview} 
        metrics={metrics} 
        isLoading={overviewLoading || metricsLoading} 
      />

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2">
              <DashboardCharts 
                data={charts} 
                isLoading={chartsLoading}
              />
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <QuickActions 
                data={quickActions} 
                isLoading={quickActionsLoading}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Key performance indicators for the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{metrics?.newClients || 0}</div>
                      <div className="text-sm text-gray-600">New Clients</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">₹{(metrics?.totalRevenue || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{metrics?.conversionRate || 0}%</div>
                      <div className="text-sm text-gray-600">Conversion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{metrics?.customerSatisfaction || 0}%</div>
                      <div className="text-sm text-gray-600">Satisfaction</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Advanced Analytics
                </CardTitle>
                <CardDescription>
                  Detailed insights and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardCharts 
                  data={charts} 
                  isLoading={chartsLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <RecentActivities 
                data={activities} 
                isLoading={activitiesLoading}
              />
            </div>
            <div className="space-y-6">
              <DashboardNotifications />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <DashboardTasks />
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>
                  Important dates and deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Policy Renewal Meeting</div>
                      <div className="text-xs text-gray-600">Tomorrow at 2:00 PM</div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium">High Priority</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Quarterly Review</div>
                      <div className="text-xs text-gray-600">Friday at 10:00 AM</div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">Medium Priority</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Training Session</div>
                      <div className="text-xs text-gray-600">Next Monday at 9:00 AM</div>
                    </div>
                    <div className="text-xs text-yellow-600 font-medium">Low Priority</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Dashboard = () => {
  const isMobile = useIsMobile();
  
  console.log('Dashboard component rendering with enhanced UI');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <DashboardContent isMobile={isMobile} />
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
