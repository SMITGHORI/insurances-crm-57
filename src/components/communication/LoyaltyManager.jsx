
import React from 'react';
import { Star, Award, TrendingUp, Users, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LoyaltyManager = () => {
  // Sample data for demonstration
  const tierStats = [
    { tier: 'Bronze', count: 245, color: 'bg-orange-100 text-orange-800', icon: '🥉' },
    { tier: 'Silver', count: 89, color: 'bg-gray-100 text-gray-800', icon: '🥈' },
    { tier: 'Gold', count: 34, color: 'bg-yellow-100 text-yellow-800', icon: '🥇' },
    { tier: 'Platinum', count: 12, color: 'bg-purple-100 text-purple-800', icon: '💎' }
  ];

  const recentActivity = [
    { client: 'Raj Patel', action: 'Earned 500 points', tier: 'Gold', date: '2 hours ago' },
    { client: 'Priya Singh', action: 'Redeemed 1000 points', tier: 'Silver', date: '5 hours ago' },
    { client: 'Tech Corp', action: 'Upgraded to Platinum', tier: 'Platinum', date: '1 day ago' },
    { client: 'Amit Kumar', action: 'Earned 250 points', tier: 'Bronze', date: '2 days ago' }
  ];

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
                {((stat.count / 380) * 100).toFixed(1)}% of clients
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
                <span className="text-2xl font-bold text-green-600">2,45,600</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Points Redeemed</span>
                <span className="text-2xl font-bold text-blue-600">89,400</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Points</span>
                <span className="text-2xl font-bold text-purple-600">1,56,200</span>
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
