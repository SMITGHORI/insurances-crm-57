
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { usePolicyStats } from '@/hooks/usePolicyFeatures';
import { formatCurrency } from '@/lib/utils';

const PolicyStats = () => {
  const { data: stats, isLoading, error } = usePolicyStats();

  console.log('Policy stats from MongoDB:', stats);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    console.error('Error loading policy stats:', error);
    return null;
  }

  const statsData = stats || {
    totalPolicies: 0,
    activePolicies: 0,
    totalPremium: 0,
    expiringPolicies: 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.totalPolicies || 0}</div>
          <p className="text-xs text-muted-foreground">
            Connected to MongoDB
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.activePolicies || 0}</div>
          <p className="text-xs text-muted-foreground">
            Currently active in database
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Premium</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(statsData.totalPremium || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Sum of all premiums
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.expiringPolicies || 0}</div>
          <p className="text-xs text-muted-foreground">
            Expiring within 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyStats;
