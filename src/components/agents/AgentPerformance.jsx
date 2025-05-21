
import React from 'react';
import { LineChart, BarChart, PieChart } from 'recharts';
import { Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AgentPerformance = ({ agentId }) => {
  // Sample data - in a real application, this would be fetched from an API
  const monthlySalesData = [
    { month: 'Jan', policies: 8, premium: 120000 },
    { month: 'Feb', policies: 7, premium: 110000 },
    { month: 'Mar', policies: 10, premium: 150000 },
    { month: 'Apr', policies: 9, premium: 130000 },
    { month: 'May', policies: 11, premium: 160000 },
    { month: 'Jun', policies: 14, premium: 180000 },
    { month: 'Jul', policies: 12, premium: 170000 },
    { month: 'Aug', policies: 15, premium: 195000 },
    { month: 'Sep', policies: 13, premium: 175000 },
    { month: 'Oct', policies: 16, premium: 210000 },
    { month: 'Nov', policies: 18, premium: 220000 },
    { month: 'Dec', policies: 20, premium: 240000 },
  ];

  const policyCategoryData = [
    { name: 'Health', value: 35, fill: '#1b365d' },
    { name: 'Term', value: 25, fill: '#5086c1' },
    { name: 'Vehicle', value: 20, fill: '#f15a22' },
    { name: 'Home', value: 10, fill: '#7eb5e2' },
    { name: 'Travel', value: 10, fill: '#fabd84' },
  ];

  const kpis = [
    { 
      title: 'Activities This Month',
      metrics: [
        { label: 'Client Meetings', value: '32' },
        { label: 'Follow-ups', value: '48' },
        { label: 'New Prospects', value: '15' },
        { label: 'Policies Renewed', value: '9' },
      ]
    },
    { 
      title: 'Performance Trends',
      metrics: [
        { label: 'YTD Premium', value: '₹20,50,000' },
        { label: 'YTD Commission', value: '₹3,27,500' },
        { label: 'MTD Premium', value: '₹2,40,000' },
        { label: 'MTD Commission', value: '₹38,400' },
      ]
    },
    { 
      title: 'Training & Compliance',
      metrics: [
        { label: 'Trainings Completed', value: '8/10' },
        { label: 'Compliance Score', value: '96%' },
        { label: 'Certification Status', value: 'Valid' },
        { label: 'Last Assessment', value: '12 Apr 2025' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {kpi.metrics.map((metric, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-sm text-gray-500">{metric.label}</p>
                    <p className="text-lg font-semibold">{metric.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlySalesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="policies" 
                    stroke="#1b365d" 
                    activeDot={{ r: 8 }} 
                    name="Policies Sold"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="premium" 
                    stroke="#f15a22" 
                    name="Premium (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Policy Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Policy Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={policyCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Targets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quarterly Targets & Achievement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { quarter: 'Q1', target: 400000, achieved: 380000 },
                  { quarter: 'Q2', target: 450000, achieved: 510000 },
                  { quarter: 'Q3', target: 500000, achieved: 590000 },
                  { quarter: 'Q4', target: 600000, achieved: 670000 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="target" name="Target Premium" fill="#8884d8" />
                <Bar dataKey="achieved" name="Achieved Premium" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentPerformance;
