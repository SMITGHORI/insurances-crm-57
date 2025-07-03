
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useClaimsDashboardStats } from '../../hooks/useClaims';
import { formatCurrency } from '../../lib/utils';

const ClaimStatsCards = () => {
  // Connect to MongoDB for dashboard stats
  const { data: stats, isLoading, error } = useClaimsDashboardStats();

  // Default stats if loading or error
  const defaultStats = {
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    totalClaimAmount: 0,
    totalApprovedAmount: 0,
    averageProcessingTime: 0,
    settlementRatio: 0
  };

  const displayStats = stats || defaultStats;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Unable to load statistics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Claims',
      value: displayStats.totalClaims.toLocaleString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: displayStats.claimsGrowth > 0 ? `+${displayStats.claimsGrowth}%` : `${displayStats.claimsGrowth}%`,
      isPositive: displayStats.claimsGrowth >= 0
    },
    {
      title: 'Pending Claims',
      value: displayStats.pendingClaims.toLocaleString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: `${displayStats.pendingPercentage}% of total`,
      isPositive: displayStats.pendingPercentage < 50
    },
    {
      title: 'Approved Claims',
      value: displayStats.approvedClaims.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${displayStats.approvalRate}% approval rate`,
      isPositive: displayStats.approvalRate > 70
    },
    {
      title: 'Total Claim Amount',
      value: formatCurrency(displayStats.totalClaimAmount),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: displayStats.amountGrowth > 0 ? `+${displayStats.amountGrowth}%` : `${displayStats.amountGrowth}%`,
      isPositive: displayStats.amountGrowth >= 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="flex items-center text-xs">
              {stat.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={stat.isPositive ? 'text-green-600' : 'text-red-600'}>
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClaimStatsCards;
