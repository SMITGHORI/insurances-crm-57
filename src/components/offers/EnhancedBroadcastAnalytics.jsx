
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Mail, 
  MessageSquare, 
  Users, 
  Target,
  DollarSign,
  Eye,
  MousePointer,
  UserCheck,
  Download
} from 'lucide-react';
import { useEnhancedBroadcasts, useBroadcastAnalytics } from '@/hooks/useEnhancedBroadcastSystem';

const EnhancedBroadcastAnalytics = () => {
  const [selectedBroadcast, setSelectedBroadcast] = useState('');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [selectedMetric, setSelectedMetric] = useState('all');

  const { data: broadcasts } = useEnhancedBroadcasts({ 
    status: 'sent',
    limit: 50 
  });
  
  const { data: analytics } = useBroadcastAnalytics(selectedBroadcast);

  // Mock comprehensive analytics data
  const overallStats = {
    totalBroadcasts: 156,
    totalRecipients: 45230,
    deliveryRate: 94.2,
    openRate: 23.8,
    clickRate: 4.7,
    conversionRate: 1.3,
    totalRevenue: 2450000,
    roi: 340,
    avgEngagementScore: 7.2,
    optOutRate: 0.8
  };

  const channelPerformance = [
    { channel: 'Email', sent: 15200, delivered: 14896, opened: 3548, clicked: 672, converted: 198, revenue: 1200000 },
    { channel: 'WhatsApp', sent: 12800, delivered: 12544, opened: 4389, clicked: 526, converted: 156, revenue: 890000 },
    { channel: 'SMS', sent: 8500, delivered: 7905, opened: 1896, clicked: 152, converted: 41, revenue: 360000 }
  ];

  const campaignPerformance = [
    { campaign: 'Festival Offers', broadcasts: 45, recipients: 18500, revenue: 1200000, roi: 450 },
    { campaign: 'Policy Renewals', broadcasts: 38, recipients: 12200, revenue: 800000, roi: 380 },
    { campaign: 'Birthday Specials', broadcasts: 28, recipients: 8900, revenue: 320000, roi: 280 },
    { campaign: 'Anniversary Greetings', broadcasts: 22, recipients: 5630, revenue: 130000, roi: 220 }
  ];

  const engagementTrends = [
    { date: '2024-01-01', opens: 2340, clicks: 456, conversions: 89 },
    { date: '2024-01-02', opens: 2180, clicks: 392, conversions: 67 },
    { date: '2024-01-03', opens: 2890, clicks: 578, conversions: 123 },
    { date: '2024-01-04', opens: 2456, clicks: 445, conversions: 98 },
    { date: '2024-01-05', opens: 3120, clicks: 634, conversions: 156 },
    { date: '2024-01-06', opens: 2567, clicks: 478, conversions: 102 },
    { date: '2024-01-07', opens: 2789, clicks: 523, conversions: 134 }
  ];

  const tierPerformance = [
    { tier: 'Platinum', count: 450, revenue: 890000, avgEngagement: 9.2 },
    { tier: 'Gold', count: 1200, revenue: 720000, avgEngagement: 7.8 },
    { tier: 'Silver', count: 3400, revenue: 580000, avgEngagement: 6.4 },
    { tier: 'Bronze', count: 8900, revenue: 260000, avgEngagement: 4.2 }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const calculateChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedBroadcast} onValueChange={setSelectedBroadcast}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select broadcast for detailed analysis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Broadcasts</SelectItem>
            {broadcasts?.data?.map((broadcast) => (
              <SelectItem key={broadcast._id} value={broadcast._id}>
                {broadcast.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select metric focus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Metrics</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="conversion">Conversion</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="channel">Channel Performance</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {overallStats.totalBroadcasts}
            </div>
            <div className="text-xs text-gray-500">Total Broadcasts</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {overallStats.totalRecipients.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Total Recipients</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+8%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(overallStats.openRate)}
            </div>
            <div className="text-xs text-gray-500">Open Rate</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+2.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MousePointer className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(overallStats.clickRate)}
            </div>
            <div className="text-xs text-gray-500">Click Rate</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-xs text-red-600">-0.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(overallStats.totalRevenue)}
            </div>
            <div className="text-xs text-gray-500">Total Revenue</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+18%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatPercentage(overallStats.deliveryRate)}
            </div>
            <div className="text-xs text-gray-500">Delivery Rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatPercentage(overallStats.conversionRate)}
            </div>
            <div className="text-xs text-gray-500">Conversion Rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-gray-900">
              {overallStats.roi}%
            </div>
            <div className="text-xs text-gray-500">ROI</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-gray-900">
              {overallStats.avgEngagementScore}
            </div>
            <div className="text-xs text-gray-500">Avg Engagement Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Channel Performance Analysis
          </CardTitle>
          <CardDescription>
            Compare performance across different communication channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                    return [value.toLocaleString(), name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="sent" fill="#8884d8" name="Sent" />
                <Bar yAxisId="left" dataKey="delivered" fill="#82ca9d" name="Delivered" />
                <Bar yAxisId="left" dataKey="opened" fill="#ffc658" name="Opened" />
                <Bar yAxisId="left" dataKey="clicked" fill="#ff7300" name="Clicked" />
                <Bar yAxisId="right" dataKey="revenue" fill="#0088fe" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Engagement Trends
          </CardTitle>
          <CardDescription>
            Track engagement metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="opens" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="clicks" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="conversions" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance & Tier Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>
              Revenue and ROI by campaign type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignPerformance.map((campaign, index) => (
                <div key={campaign.campaign} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{campaign.campaign}</h4>
                    <p className="text-sm text-gray-500">
                      {campaign.broadcasts} broadcasts • {campaign.recipients.toLocaleString()} recipients
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(campaign.revenue)}</div>
                    <Badge variant="outline" className="text-xs">
                      {campaign.roi}% ROI
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Tier Analysis</CardTitle>
            <CardDescription>
              Performance by client tier level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tier, revenue }) => `${tier}: ${formatCurrency(revenue)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {tierPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Broadcast Analysis */}
      {selectedBroadcast && analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Broadcast Analysis</CardTitle>
            <CardDescription>
              In-depth analysis of the selected broadcast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-3">Delivery Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Recipients:</span>
                    <span className="font-medium">{analytics.totalRecipients?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Delivered:</span>
                    <span className="font-medium text-green-600">{analytics.deliveredCount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Failed:</span>
                    <span className="font-medium text-red-600">{analytics.failedCount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Engagement Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Opened:</span>
                    <span className="font-medium">{analytics.openedCount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Clicked:</span>
                    <span className="font-medium">{analytics.clickedCount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Converted:</span>
                    <span className="font-medium text-green-600">{analytics.convertedCount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Revenue Impact</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Revenue Generated:</span>
                    <span className="font-medium">{formatCurrency(analytics.revenueGenerated || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">ROI:</span>
                    <span className="font-medium text-green-600">{analytics.roi || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cost per Conversion:</span>
                    <span className="font-medium">{formatCurrency(analytics.costPerConversion || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedBroadcastAnalytics;
