
import React from 'react';
import { Star, Award, TrendingUp, Users, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLoyaltyStats, useLoyaltyActivity } from '@/hooks/useCommunication';

const LoyaltyManager = () => {
  // Fetch loyalty data from API
  const { data: loyaltyStats, isLoading: statsLoading, error: statsError } = useLoyaltyStats();
  const { data: recentActivity = [], isLoading: activityLoading, error: activityError } = useLoyaltyActivity();
  
  // Show loading state
  if (statsLoading || activityLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (statsError || activityError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-800">Failed to load loyalty data</h3>
          <p className="text-gray-600 mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }
  
  // Default tier configuration
  const tierConfig = [
    { tier: 'Bronze', color: 'bg-orange-100 text-orange-800', icon: '🥉' },
    { tier: 'Silver', color: 'bg-gray-100 text-gray-800', icon: '🥈' },
    { tier: 'Gold', color: 'bg-yellow-100 text-yellow-800', icon: '🥇' },
    { tier: 'Platinum', color: 'bg-purple-100 text-purple-800', icon: '💎' }
  ];
  
  // Merge API data with tier configuration
  const tierStats = tierConfig.map(config => {
    const apiData = loyaltyStats?.tiers?.find(t => t.tier === config.tier);
    return {
      ...config,
      count: apiData?.count || 0
    };
  });
  
  const totalClients = tierStats.reduce((sum, tier) => sum + tier.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Loyalty Program Management</h3>
        <p className="text-sm text-gray-500">Manage client loyalty points and tier benefits</p>
      </div>

      {/* Tier Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tierStats.map((stat) => (
          <Card key={stat.tier} className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.tier} Tier</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
              <Badge className={`${stat.color} mt-2`}>
                {totalClients > 0 ? ((stat.count / totalClients) * 100).toFixed(1) : 0}% of clients
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loyalty Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Summary */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              Points Summary
            </CardTitle>
            <CardDescription>Total loyalty points distributed and redeemed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Points Issued</span>
                <span className="text-2xl font-bold text-green-600">
                  {loyaltyStats?.points?.totalIssued?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Points Redeemed</span>
                <span className="text-2xl font-bold text-blue-600">
                  {loyaltyStats?.points?.totalRedeemed?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Points</span>
                <span className="text-2xl font-bold text-purple-600">
                  {loyaltyStats?.points?.totalAvailable?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Benefits */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 text-purple-500 mr-2" />
              Tier Benefits
            </CardTitle>
            <CardDescription>Rewards and benefits by tier level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                <span className="font-medium">💎 Platinum</span>
                <span className="text-sm text-gray-600">15% discount, Priority support</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="font-medium">🥇 Gold</span>
                <span className="text-sm text-gray-600">10% discount, Exclusive offers</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">🥈 Silver</span>
                <span className="text-sm text-gray-600">5% discount, Birthday rewards</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="font-medium">🥉 Bronze</span>
                <span className="text-sm text-gray-600">Points on purchases</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            Recent Loyalty Activity
          </CardTitle>
          <CardDescription>Latest points transactions and tier changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-white rounded-full p-2 mr-3">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.client}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {activity.tier}
                  </Badge>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyManager;
