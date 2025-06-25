
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Cell
} from 'recharts';
import { TrendingUp, Activity, Users, Clock } from 'lucide-react';

const ActivityAnalytics = ({ activities = [] }) => {
  // Process data for charts
  const activityTypeData = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.entries(activityTypeData).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count
  }));

  const agentActivityData = activities.reduce((acc, activity) => {
    if (activity.agent) {
      acc[activity.agent] = (acc[activity.agent] || 0) + 1;
    }
    return acc;
  }, {});

  const agentChartData = Object.entries(agentActivityData)
    .slice(0, 10) // Top 10 agents
    .map(([agent, count]) => ({
      agent: agent.split(' ')[0], // First name only for chart
      count
    }));

  // Daily activity data (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.time || activity.createdAt).toISOString().split('T')[0];
      return activityDate === dateStr;
    });

    last7Days.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: dayActivities.length
    });
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Activity Analytics</h3>
        <p className="text-sm text-gray-600">Comprehensive analysis of system activities</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total Activities</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Active Agents</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {Object.keys(agentActivityData).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Most Active Type</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              {typeChartData.length > 0 ? 
                typeChartData.reduce((max, item) => item.count > max.count ? item : max).type : 
                'N/A'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-600">Today's Activities</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {last7Days[last7Days.length - 1]?.count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Agents Activity */}
      {agentChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Agents by Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agent" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Activity Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Breakdown by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {typeChartData.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium">{item.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.count} activities</span>
                  <Badge variant="secondary">
                    {((item.count / activities.length) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityAnalytics;
