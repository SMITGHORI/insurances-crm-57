import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
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
  Users, 
  Mail, 
  MessageSquare, 
  Target, 
  Calendar,
  DollarSign,
  Eye,
  MousePointer,
  Share2,
  Phone,
  Facebook,
  Instagram,
  Twitter,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useEnhancedBroadcasts, useBroadcastAnalytics } from '@/hooks/useEnhancedBroadcastSystem';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EnhancedBroadcastAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedBroadcast, setSelectedBroadcast] = useState('all');
  const [dateRange, setDateRange] = useState();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: broadcastsData, isLoading } = useEnhancedBroadcasts({
    limit: 100,
    sortField: 'createdAt',
    sortDirection: 'desc'
  });

  const broadcasts = broadcastsData?.data || [];

  // Mock analytics data - replace with real API calls
  const analyticsData = {
    overview: {
      totalBroadcasts: 45,
      totalRecipients: 12450,
      totalSent: 12350,
      totalDelivered: 11980,
      totalOpened: 8540,
      totalClicked: 3210,
      totalConverted: 845,
      totalRevenue: 125400,
      deliveryRate: 97.1,
      openRate: 71.3,
      clickRate: 26.8,
      conversionRate: 6.9,
      roi: 340
    },
    channelPerformance: [
      { channel: 'Email', sent: 8500, delivered: 8245, opened: 5890, clicked: 2340, converted: 520, revenue: 85600 },
      { channel: 'WhatsApp', sent: 2800, delivered: 2756, opened: 1980, clicked: 560, converted: 180, revenue: 28400 },
      { channel: 'SMS', sent: 1050, delivered: 979, opened: 670, clicked: 310, converted: 145, revenue: 11400 }
    ],
    typePerformance: [
      { type: 'Policy Renewal', count: 12, sent: 3200, delivered: 3100, opened: 2240, clicked: 890, converted: 320, revenue: 45200 },
      { type: 'Payment Reminder', count: 8, sent: 2100, delivered: 2050, opened: 1460, clicked: 420, converted: 180, revenue: 18700 },
      { type: 'Offer', count: 15, sent: 4500, delivered: 4380, opened: 3150, clicked: 1280, converted: 245, revenue: 42300 },
      { type: 'Newsletter', count: 6, sent: 1800, delivered: 1720, opened: 1240, clicked: 380, converted: 65, revenue: 8900 },
      { type: 'Anniversary', count: 4, sent: 750, delivered: 730, opened: 450, clicked: 240, converted: 35, revenue: 10300 }
    ]
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

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
      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h3 className="text-lg font-semibold">Enhanced Broadcast Analytics</h3>
        
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === 'custom' && (
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
              placeholder="Select date range"
            />
          )}

          <Select value={selectedBroadcast} onValueChange={setSelectedBroadcast}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Broadcasts</SelectItem>
              {broadcasts.slice(0, 10).map((broadcast) => (
                <SelectItem key={broadcast._id} value={broadcast._id}>
                  {broadcast.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Broadcasts</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalBroadcasts}</p>
                    <p className="text-xs text-green-600">+12% from last month</p>
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
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalRecipients.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+8% from last month</p>
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
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.deliveryRate}%</p>
                    <p className="text-xs text-green-600">+2.1% from last month</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{(analyticsData.overview.totalRevenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-green-600">+24% from last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Broadcast performance across different metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.channelPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sent" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="delivered" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="opened" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          {/* Channel Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsData.channelPerformance.map((channel, index) => (
              <Card key={channel.channel}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {channel.channel === 'Email' && <Mail className="h-5 w-5 text-blue-600" />}
                    {channel.channel === 'WhatsApp' && <MessageSquare className="h-5 w-5 text-green-600" />}
                    {channel.channel === 'SMS' && <Phone className="h-5 w-5 text-purple-600" />}
                    {channel.channel}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Delivery Rate</span>
                      <span className="font-medium">{((channel.delivered / channel.sent) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Open Rate</span>
                      <span className="font-medium">{((channel.opened / channel.delivered) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Click Rate</span>
                      <span className="font-medium">{((channel.clicked / channel.opened) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="font-medium text-green-600">₹{channel.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Channel Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.channelPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sent" fill="#3B82F6" name="Sent" />
                  <Bar dataKey="delivered" fill="#10B981" name="Delivered" />
                  <Bar dataKey="opened" fill="#F59E0B" name="Opened" />
                  <Bar dataKey="clicked" fill="#EF4444" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{analyticsData.overview.openRate}%</p>
                <p className="text-sm text-gray-600">Open Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MousePointer className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{analyticsData.overview.clickRate}%</p>
                <p className="text-sm text-gray-600">Click Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Share2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">12.4%</p>
                <p className="text-sm text-gray-600">Share Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">8.7%</p>
                <p className="text-sm text-gray-600">Growth Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Broadcast Type Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Type Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.typePerformance.map((type, index) => (
                  <div key={type.type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <p className="font-medium">{type.type}</p>
                        <p className="text-sm text-gray-500">{type.count} broadcasts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{((type.opened / type.delivered) * 100).toFixed(1)}% open rate</p>
                      <p className="text-sm text-gray-500">{type.opened.toLocaleString()} opens</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          {/* Conversion Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</p>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-xs text-green-600">+1.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{analyticsData.overview.roi}%</p>
                <p className="text-sm text-gray-600">ROI</p>
                <p className="text-xs text-green-600">+45% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">₹{(analyticsData.overview.totalRevenue / analyticsData.overview.totalConverted).toFixed(0)}</p>
                <p className="text-sm text-gray-600">Avg. Value per Conversion</p>
                <p className="text-xs text-green-600">+8% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Broadcast Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.typePerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {analyticsData.typePerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {analyticsData.typePerformance.map((entry, index) => (
                  <Badge key={entry.type} variant="outline" className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    {entry.type} (₹{(entry.revenue / 1000).toFixed(0)}K)
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedBroadcastAnalytics;
