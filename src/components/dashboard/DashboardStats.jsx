
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
  MessageSquare
} from 'lucide-react';

const DashboardStats = ({ overview, metrics, isLoading }) => {
  const statsCards = [
    {
      title: 'Total Clients',
      value: overview?.clients?.total || 0,
      trend: overview?.clients?.trend || '0',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Policies',
      value: overview?.policies?.total || 0,
      trend: overview?.policies?.trend || '0',
      icon: FileText,
      color: 'text-green-600',  
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Claims',
      value: overview?.claims?.total || 0,
      trend: overview?.claims?.trend || '0',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Active Leads',
      value: overview?.leads?.total || 0,
      trend: overview?.leads?.trend || '0',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Quotations',
      value: overview?.quotations?.total || 0,
      trend: overview?.quotations?.trend || '0',
      icon: Quote,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(metrics?.totalRevenue || 0).toLocaleString()}`,
      trend: '+12%',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Communications',
      value: metrics?.communicationsSent || 0,
      trend: '+8%',  
      icon: MessageSquare,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Tasks & Events',
      value: metrics?.upcomingTasks || 0,
      trend: '-5%',
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsCards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            {card.trend !== '0' && (
              <p className="text-xs text-green-600">
                {card.trend}% from last month
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
