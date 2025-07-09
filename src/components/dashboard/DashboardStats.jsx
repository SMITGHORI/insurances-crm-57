
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Quote,
  DollarSign,
  Calendar,
  MessageSquare,
  Activity,
  CheckCircle
} from 'lucide-react';

const DashboardStats = ({ overview, metrics, isLoading }) => {
  // Enhanced stats cards with real-time data
  const statsCards = [
    {
      title: 'Total Clients',
      value: overview?.clients?.total || 0,
      trend: overview?.clients?.trend || '0%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Active client base'
    },
    {
      title: 'Active Policies',
      value: overview?.policies?.total || 0,
      trend: overview?.policies?.trend || '0%',
      icon: FileText,
      color: 'text-green-600',  
      bgColor: 'bg-green-50',
      description: 'Current policy count'
    },
    {
      title: 'Pending Claims',
      value: overview?.claims?.pending || 0,
      trend: overview?.claims?.trend || '0%',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Claims awaiting processing'
    },
    {
      title: 'Active Leads',
      value: overview?.leads?.active || 0,
      trend: overview?.leads?.trend || '0%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Leads in pipeline'
    },
    {
      title: 'Quotations',
      value: overview?.quotations?.total || 0,
      trend: overview?.quotations?.trend || '0%',
      icon: Quote,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Total quotations issued'
    },
    {
      title: 'Monthly Revenue',
      value: metrics?.totalRevenue ? `₹${Number(metrics.totalRevenue).toLocaleString()}` : '₹0',
      trend: metrics?.revenueGrowth || '0%',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Current month revenue'
    },
    {
      title: 'New Clients',
      value: metrics?.newClients || 0,
      trend: metrics?.clientGrowth || '0%',
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      description: 'New clients this period'
    },
    {
      title: 'Conversion Rate',
      value: `${metrics?.conversionRate || 0}%`,
      trend: metrics?.conversionGrowth || '0%',
      icon: CheckCircle,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      description: 'Lead to policy conversion'
    }
  ];

  const formatTrend = (trend) => {
    if (!trend || trend === '0%') return null;
    const isPositive = !trend.startsWith('-');
    const trendValue = trend.replace(/[+-]/, '');
    return (
      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <Activity className="h-3 w-3" />
        <span>{isPositive ? '+' : ''}{trendValue} from last month</span>
      </div>
    );
  };

  const getStatusIndicator = (value, type) => {
    let status = 'normal';
    let color = 'bg-green-100 text-green-800';
    
    if (type === 'claims' && value > 20) {
      status = 'high';
      color = 'bg-red-100 text-red-800';
    } else if (type === 'leads' && value < 10) {
      status = 'low';
      color = 'bg-yellow-100 text-yellow-800';
    } else if (type === 'revenue' && value > 100000) {
      status = 'excellent';
      color = 'bg-emerald-100 text-emerald-800';
    }
    
    return (
      <Badge variant="secondary" className={`text-xs ${color}`}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsCards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-gray-200 hover:border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                {card.description}
              </p>
            </div>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-gray-900">
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </div>
              {card.title.includes('Claims') && getStatusIndicator(card.value, 'claims')}
              {card.title.includes('Leads') && getStatusIndicator(card.value, 'leads')}
              {card.title.includes('Revenue') && getStatusIndicator(card.value, 'revenue')}
            </div>
            
            {formatTrend(card.trend)}
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">
                Real-time from API
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
