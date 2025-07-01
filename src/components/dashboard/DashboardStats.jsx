
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
  MessageSquare,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';

const DashboardStats = ({ overview, metrics, isLoading }) => {
  const statsCards = [
    {
      title: 'Total Clients',
      value: overview?.clients?.total || 0,
      active: overview?.clients?.active || 0,
      trend: overview?.clients?.trend || '0',
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: 'blue',
      description: 'Active clients',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Policies',
      value: overview?.policies?.total || 0,
      active: overview?.policies?.active || 0,
      trend: overview?.policies?.trend || '0',
      icon: <FileText className="h-6 w-6 text-green-600" />,
      color: 'green',
      description: 'Policy coverage',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Pending Claims',
      value: overview?.claims?.total || 0,
      active: overview?.claims?.pending || 0,
      trend: overview?.claims?.trend || '0',
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
      color: 'orange',
      description: 'Under review',
      bgGradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Active Leads',
      value: overview?.leads?.total || 0,
      active: overview?.leads?.active || 0,
      trend: overview?.leads?.trend || '0',
      conversion: overview?.leads?.conversionRate || '0',
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      color: 'purple',
      description: 'Conversion rate',
      bgGradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Quotations',
      value: overview?.quotations?.total || 0,
      active: overview?.quotations?.pending || 0,
      trend: overview?.quotations?.trend || '0',
      conversion: overview?.quotations?.conversionRate || '0',
      icon: <Quote className="h-6 w-6 text-indigo-600" />,
      color: 'indigo',
      description: 'Pending quotes',
      bgGradient: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(metrics?.totalRevenue || 0).toLocaleString()}`,
      active: metrics?.newPolicies || 0,
      trend: '+12%',
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      color: 'green',
      description: 'New policies',
      bgGradient: 'from-emerald-500 to-green-600'
    },
    {
      title: 'Communications',
      value: metrics?.communicationsSent || 0,
      active: metrics?.communicationsDelivered || 0,
      trend: '+8%',
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      color: 'blue',
      description: 'Delivered',
      bgGradient: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Tasks & Events',
      value: metrics?.upcomingTasks || 0,
      active: metrics?.overdueTasks || 0,
      trend: '-5%',
      icon: <Calendar className="h-6 w-6 text-yellow-600" />,
      color: 'yellow',
      description: 'Overdue',
      bgGradient: 'from-yellow-500 to-orange-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getTrendIcon = (trend) => {
    if (trend.startsWith('+')) {
      return <ArrowUpIcon className="h-3 w-3 text-green-600" />;
    } else if (trend.startsWith('-')) {
      return <ArrowDownIcon className="h-3 w-3 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (trend) => {
    if (trend.startsWith('+')) {
      return 'text-green-600 bg-green-50';
    } else if (trend.startsWith('-')) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((card, index) => (
        <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${card.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
          
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                  {card.trend !== '0' && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs flex items-center gap-1 ${getTrendColor(card.trend)}`}
                    >
                      {getTrendIcon(card.trend)}
                      {card.trend}
                    </Badge>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${card.bgGradient} shadow-lg`}>
                <div className="text-white">
                  {card.icon}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{card.description}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">{card.active}</span>
                {card.conversion && (
                  <Badge variant="secondary" className="text-xs">
                    {card.conversion}%
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
