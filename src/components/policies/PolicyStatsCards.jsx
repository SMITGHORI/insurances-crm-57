
import React from 'react';
import { FileText, TrendingUp, AlertTriangle, DollarSign, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePolicyStats, useExpiringPolicies } from '../../hooks/usePolicyFeatures';

const PolicyStatsCards = () => {
  const { data: stats, isLoading: statsLoading } = usePolicyStats();
  const { data: expiringPolicies, isLoading: expiringLoading } = useExpiringPolicies(30);

  if (statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
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
      title: 'Total Policies',
      value: stats?.totalPolicies || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Policies',
      value: stats?.activePolicies || 0,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Expiring Soon',
      value: expiringPolicies?.length || 0,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badge: expiringPolicies?.length > 0 ? 'urgent' : null
    },
    {
      title: 'Total Premium',
      value: stats?.totalPremium ? `₹${(stats.totalPremium / 1000000).toFixed(1)}M` : '₹0',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'This Month',
      value: stats?.renewalsThisMonth || 0,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Average Premium',
      value: stats?.averagePremium ? `₹${stats.averagePremium.toLocaleString()}` : '₹0',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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

export default PolicyStatsCards;
