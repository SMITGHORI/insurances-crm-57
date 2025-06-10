
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Mail, MessageSquare, Target, Calendar } from 'lucide-react';
import { useBroadcasts } from '@/hooks/useBroadcast';

const BroadcastAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30');

  const { data: broadcastsData, isLoading } = useBroadcasts({
    limit: 100, // Get more data for analytics
    sortField: 'createdAt',
    sortDirection: 'desc'
  });

  const broadcasts = broadcastsData?.data || [];

  // Calculate analytics data
  const getAnalyticsData = () => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
    
    const filteredBroadcasts = broadcasts.filter(b => 
      new Date(b.createdAt) >= daysAgo && b.status === 'sent'
    );

    // Overall stats
    const totalBroadcasts = filteredBroadcasts.length;
    const totalRecipients = filteredBroadcasts.reduce((sum, b) => sum + b.stats.totalRecipients, 0);
    const totalSent = filteredBroadcasts.reduce((sum, b) => sum + b.stats.sentCount, 0);
    const totalDelivered = filteredBroadcasts.reduce((sum, b) => sum + b.stats.deliveredCount, 0);
    const totalFailed = filteredBroadcasts.reduce((sum, b) => sum + b.stats.failedCount, 0);

    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
    const successRate = totalRecipients > 0 ? Math.round((totalSent / totalRecipients) * 100) : 0;

    // Channel distribution
    const channelStats = {};
    filteredBroadcasts.forEach(broadcast => {
      broadcast.channels.forEach(channel => {
        if (!channelStats[channel]) {
          channelStats[channel] = { sent: 0, delivered: 0, failed: 0 };
        }
        channelStats[channel].sent += broadcast.stats.sentCount;
        channelStats[channel].delivered += broadcast.stats.deliveredCount;
        channelStats[channel].failed += broadcast.stats.failedCount;
      });
    });

    // Type distribution
    const typeStats = {};
    filteredBroadcasts.forEach(broadcast => {
      if (!typeStats[broadcast.type]) {
        typeStats[broadcast.type] = { count: 0, sent: 0, delivered: 0 };
      }
      typeStats[broadcast.type].count += 1;
      typeStats[broadcast.type].sent += broadcast.stats.sentCount;
      typeStats[broadcast.type].delivered += broadcast.stats.deliveredCount;
    });

    // Daily performance (last 7 days)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayBroadcasts = filteredBroadcasts.filter(b => {
        const broadcastDate = new Date(b.createdAt);
        return broadcastDate.toDateString() === date.toDateString();
      });
      
      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        broadcasts: dayBroadcasts.length,
        sent: dayBroadcasts.reduce((sum, b) => sum + b.stats.sentCount, 0),
        delivered: dayBroadcasts.reduce((sum, b) => sum + b.stats.deliveredCount, 0)
      });
    }

    return {
      overview: {
        totalBroadcasts,
        totalRecipients,
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate,
        successRate
      },
      channelStats,
      typeStats,
      dailyData
    };
  };

  const analytics = getAnalyticsData();

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  // Prepare data for charts
  const channelChartData = Object.entries(analytics.channelStats).map(([channel, stats]) => ({
    name: channel,
    sent: stats.sent,
    delivered: stats.delivered,
    failed: stats.failed,
    deliveryRate: stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0
  }));

  const typeChartData = Object.entries(analytics.typeStats).map(([type, stats]) => ({
    name: type,
    value: stats.count,
    sent: stats.sent,
    delivered: stats.delivered
  }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Broadcast Performance Analytics</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Broadcasts</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalBroadcasts}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalRecipients.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.deliveryRate}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Performance comparison across different channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#3B82F6" name="Sent" />
                <Bar dataKey="delivered" fill="#10B981" name="Delivered" />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Broadcast Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Broadcast Types</CardTitle>
            <CardDescription>Distribution of broadcast types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {typeChartData.map((entry, index) => (
                <Badge key={entry.name} variant="outline" className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  {entry.name} ({entry.value})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance Trend</CardTitle>
          <CardDescription>Broadcast activity and delivery performance over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="broadcasts" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Broadcasts Created"
              />
              <Line 
                type="monotone" 
                dataKey="sent" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Messages Sent"
              />
              <Line 
                type="monotone" 
                dataKey="delivered" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Messages Delivered"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Channel Details */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.channelStats).map(([channel, stats]) => (
                <div key={channel} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {channel === 'email' ? (
                      <Mail className="h-4 w-4 text-blue-600" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    )}
                    <span className="font-medium capitalize">{channel}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {stats.delivered}/{stats.sent}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0}% delivery
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Type Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.typeStats).map(([type, stats]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium capitalize">{type}</span>
                    <div className="text-xs text-gray-500">{stats.count} broadcasts</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {stats.delivered}/{stats.sent}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0}% delivery
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {analytics.overview.totalBroadcasts === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500">
            Create some broadcasts to start seeing analytics data.
          </p>
        </div>
      )}
    </div>
  );
};

export default BroadcastAnalytics;
