
import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Quote, 
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useDashboardOverview, 
  useRecentActivities, 
  usePerformanceMetrics,
  useChartsData,
  useQuickActions,
  useRefreshDashboard 
} from '@/hooks/useDashboard';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
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

  const statsCards = [
    {
      title: 'Total Clients',
      value: overview?.clients?.total || 0,
      active: overview?.clients?.active || 0,
      trend: overview?.clients?.trend || '0',
      icon: <Users className="h-5 w-5 text-blue-600" />,
      color: 'blue'
    },
    {
      title: 'Active Policies',
      value: overview?.policies?.total || 0,
      active: overview?.policies?.active || 0,
      trend: overview?.policies?.trend || '0',
      icon: <FileText className="h-5 w-5 text-green-600" />,
      color: 'green'
    },
    {
      title: 'Pending Claims',
      value: overview?.claims?.total || 0,
      active: overview?.claims?.pending || 0,
      trend: overview?.claims?.trend || '0',
      icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      color: 'orange'
    },
    {
      title: 'Active Leads',
      value: overview?.leads?.total || 0,
      active: overview?.leads?.active || 0,
      trend: overview?.leads?.trend || '0',
      conversion: overview?.leads?.conversionRate || '0',
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
      color: 'purple'
    },
    {
      title: 'Quotations',
      value: overview?.quotations?.total || 0,
      active: overview?.quotations?.pending || 0,
      trend: overview?.quotations?.trend || '0',
      conversion: overview?.quotations?.conversionRate || '0',
      icon: <Quote className="h-5 w-5 text-indigo-600" />,
      color: 'indigo'
    }
  ];

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

      {/* Performance Metrics */}
      {metrics && !metricsLoading && (
        <Card className="border-none shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Performance Overview (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.newClients}</div>
                <div className="text-sm text-gray-500">New Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.newPolicies}</div>
                <div className="text-sm text-gray-500">New Policies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">${metrics.totalRevenue}</div>
                <div className="text-sm text-gray-500">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">${metrics.averageDealSize}</div>
                <div className="text-sm text-gray-500">Avg Deal Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <div className="flex items-center mt-2">
                    <h3 className="text-2xl font-bold">{card.value}</h3>
                    {card.trend !== '0' && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {card.trend}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Active: {card.active}
                    {card.conversion && (
                      <span className="ml-2">• Conv: {card.conversion}%</span>
                    )}
                  </div>
                </div>
                <div className="ml-4">{card.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts 
            data={charts} 
            isLoading={chartsLoading}
          />
        </div>
        <div>
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

export default DashboardContent;
