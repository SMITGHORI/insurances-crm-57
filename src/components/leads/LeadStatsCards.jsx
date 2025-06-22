
import React from 'react';
import { Users, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, UserPlus, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLeadsStatsBackend } from '../../hooks/useLeadsBackend';

const LeadStatsCards = () => {
  const { data: stats, isLoading: statsLoading } = useLeadsStatsBackend();

  if (statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
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

  const statsData = [
    {
      title: 'Total Leads',
      value: stats?.totalLeads || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'New Leads',
      value: stats?.newLeads || 0,
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: stats?.newLeads > 10 ? 'urgent' : null
    },
    {
      title: 'In Progress',
      value: stats?.inProgress || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Qualified',
      value: stats?.qualified || 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Converted',
      value: stats?.converted || 0,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Lost',
      value: stats?.lost || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Conversion Rate',
      value: stats?.conversionRate ? `${stats.conversionRate}%` : '0%',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Avg Score',
      value: stats?.averageScore ? parseFloat(stats.averageScore).toFixed(1) : 'N/A',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor} relative`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              {stat.badge === 'urgent' && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 py-0 text-xs">
                  !
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            {stats?.growth && index === 0 && (
              <p className="text-xs text-green-600">
                +{stats.growth}% from last month
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeadStatsCards;
