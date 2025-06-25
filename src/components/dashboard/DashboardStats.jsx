
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
      active: overview?.clients?.active || 0,
      trend: overview?.clients?.trend || '0',
      icon: <Users className="h-5 w-5 text-blue-600" />,
      color: 'blue',
      description: 'Active clients'
    },
    {
      title: 'Active Policies',
      value: overview?.policies?.total || 0,
      active: overview?.policies?.active || 0,
      trend: overview?.policies?.trend || '0',
      icon: <FileText className="h-5 w-5 text-green-600" />,
      color: 'green',
      description: 'Policy coverage'
    },
    {
      title: 'Pending Claims',
      value: overview?.claims?.total || 0,
      active: overview?.claims?.pending || 0,
      trend: overview?.claims?.trend || '0',
      icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      color: 'orange',
      description: 'Under review'
    },
    {
      title: 'Active Leads',
      value: overview?.leads?.total || 0,
      active: overview?.leads?.active || 0,
      trend: overview?.leads?.trend || '0',
      conversion: overview?.leads?.conversionRate || '0',
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
      color: 'purple',
      description: 'Conversion rate'
    },
    {
      title: 'Quotations',
      value: overview?.quotations?.total || 0,
      active: overview?.quotations?.pending || 0,
      trend: overview?.quotations?.trend || '0',
      conversion: overview?.quotations?.conversionRate || '0',
      icon: <Quote className="h-5 w-5 text-indigo-600" />,
      color: 'indigo',
      description: 'Pending quotes'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(metrics?.totalRevenue || 0).toLocaleString()}`,
      active: metrics?.newPolicies || 0,
      trend: '+12%',
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      color: 'green',
      description: 'New policies'
    },
    {
      title: 'Communications',
      value: metrics?.communicationsSent || 0,
      active: metrics?.communicationsDelivered || 0,
      trend: '+8%',
      icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
      color: 'blue',
      description: 'Delivered'
    },
    {
      title: 'Upcoming Tasks',
      value: metrics?.upcomingTasks || 0,
      active: metrics?.overdueTasks || 0,
      trend: '-5%',
      icon: <Calendar className="h-5 w-5 text-yellow-600" />,
      color: 'yellow',
      description: 'Overdue'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  {card.description}: {card.active}
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
  );
};

export default DashboardStats;
