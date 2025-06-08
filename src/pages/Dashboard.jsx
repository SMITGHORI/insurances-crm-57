
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  Clock,
  ArrowUp,
  ArrowDown,
  BarChart4,
  PieChart,
  LineChart,
  Settings,
  Bell,
  Calendar,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartPieChart,
  Pie,
  LineChart as RechartLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [periodFilter, setPeriodFilter] = useState('month');
  const isMobile = useIsMobile();

  // Sample data for charts - pre-loaded for better performance
  const policyTypeData = [
    { name: 'Health', value: 35, fill: '#1b365d' },
    { name: 'Term', value: 25, fill: '#5086c1' },
    { name: 'Vehicle', value: 40, fill: '#f15a22' },
  ];

  const monthlyPremiumData = [
    { name: 'Jan', premium: 150000 },
    { name: 'Feb', premium: 180000 },
    { name: 'Mar', premium: 210000 },
    { name: 'Apr', premium: 190000 },
    { name: 'May', premium: 240000 },
    { name: 'Jun', premium: 260000 },
    { name: 'Jul', premium: 290000 },
    { name: 'Aug', premium: 270000 },
    { name: 'Sep', premium: 300000 },
    { name: 'Oct', premium: 320000 },
    { name: 'Nov', premium: 330000 },
    { name: 'Dec', premium: 350000 },
  ];

  const claimsData = [
    { name: 'Approved', value: 65, fill: '#4ade80' },
    { name: 'Pending', value: 25, fill: '#facc15' },
    { name: 'Rejected', value: 10, fill: '#f43f5e' },
  ];

  // Stats cards data with navigation handlers
  const statsCards = [
    {
      title: 'Total Clients',
      value: '312',
      change: '+8%',
      isPositive: true,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      onClick: () => navigate('/clients')
    },
    {
      title: 'Active Policies',
      value: '548',
      change: '+12%',
      isPositive: true,
      icon: <FileText className="h-6 w-6 text-orange-500" />,
      onClick: () => navigate('/policies')
    },
    {
      title: 'Total Claims',
      value: '94',
      change: '+5%',
      isPositive: true,
      icon: <ShieldCheck className="h-6 w-6 text-green-600" />,
      onClick: () => navigate('/claims')
    },
    {
      title: 'New Leads',
      value: '53',
      change: '-3%',
      isPositive: false,
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      onClick: () => navigate('/leads')
    },
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      action: 'New client registered',
      client: 'Vivek Patel',
      time: '2 hours ago',
      type: 'client',
      agent: 'Rahul Sharma',
    },
    {
      id: 2,
      action: 'Policy issued',
      client: 'Priya Desai',
      time: '4 hours ago',
      type: 'policy',
      agent: 'Neha Gupta',
    },
    {
      id: 3,
      action: 'Claim approved',
      client: 'Arjun Singh',
      time: '5 hours ago',
      type: 'claim',
      agent: 'Rahul Sharma',
    },
    {
      id: 4,
      action: 'Premium reminder sent',
      client: 'Tech Solutions Ltd',
      time: '8 hours ago',
      type: 'reminder',
      agent: 'Ananya Patel',
    },
    {
      id: 5,
      action: 'Quotation generated',
      client: 'Meera Joshi',
      time: '10 hours ago',
      type: 'quotation',
      agent: 'Vikram Malhotra',
    },
  ];

  // Upcoming renewals
  const upcomingRenewals = [
    {
      id: 1,
      client: 'Anjali Mehta',
      policyType: 'Health Insurance',
      policyNumber: 'HL29384756',
      dueDate: '05/06/2025',
      premium: '₹25,000',
    },
    {
      id: 2,
      client: 'Rajesh Kumar',
      policyType: 'Term Insurance',
      policyNumber: 'TL83746592',
      dueDate: '12/06/2025',
      premium: '₹12,500',
    },
    {
      id: 3,
      client: 'InfoTech Solutions',
      policyType: 'Vehicle Insurance',
      policyNumber: 'VH47382910',
      dueDate: '18/06/2025',
      premium: '₹35,000',
    },
    {
      id: 4,
      client: 'Sanjay Verma',
      policyType: 'Health Insurance',
      policyNumber: 'HL74628301',
      dueDate: '24/06/2025',
      premium: '₹18,000',
    },
  ];

  // Agent performance data
  const topAgents = [
    {
      name: 'Neha Gupta',
      policies: 45,
      premium: '₹5,40,000',
      conversion: '68%',
    },
    {
      name: 'Vikram Malhotra',
      policies: 42,
      premium: '₹4,85,000',
      conversion: '65%',
    },
    {
      name: 'Ananya Patel',
      policies: 38,
      premium: '₹4,10,000',
      conversion: '62%',
    },
    {
      name: 'Rajiv Kapoor',
      policies: 36,
      premium: '₹3,90,000',
      conversion: '60%',
    },
  ];

  // Performance metrics data
  const performanceMetrics = {
    thisMonth: {
      newClients: 32,
      newPolicies: 48,
      revenue: '₹12,50,000',
      claims: 14
    },
    lastMonth: {
      newClients: 28,
      newPolicies: 42,
      revenue: '₹10,80,000',
      claims: 12
    },
    growth: {
      newClients: '+14.3%',
      newPolicies: '+14.2%',
      revenue: '+15.7%',
      claims: '+16.6%'
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'client':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'policy':
        return <FileCheck className="h-5 w-5 text-orange-500" />;
      case 'claim':
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'quotation':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Navigation handler for View All Renewals button
  const handleViewAllRenewals = () => {
    navigate('/policies?tab=renewal');
  };

  // Navigation handler for View All Activities button
  const handleViewAllActivities = () => {
    navigate('/activities');
  };

  // Responsive chart dimensions
  const getChartHeight = () => {
    if (isMobile) return 180;
    return 300;
  };

  const getPieChartRadius = () => {
    if (isMobile) return { inner: 30, outer: 50 };
    return { inner: 60, outer: 90 };
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 py-2 md:px-4 md:py-4 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="w-full md:w-auto mt-2 md:mt-0">
          <Tabs defaultValue={periodFilter} onValueChange={setPeriodFilter} className="w-full md:w-[300px]">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statsCards.map((card, index) => (
          <Card 
            key={index} 
            className="border-none shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
            onClick={card.onClick}
          >
            <CardContent className="p-3 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">{card.title}</p>
                  <h3 className="text-lg md:text-2xl font-bold mt-1">{card.value}</h3>
                  <div className="flex items-center mt-1">
                    {card.isPositive ? (
                      <ArrowUp className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 md:h-4 md:w-4 text-red-500 mr-1" />
                    )}
                    <span 
                      className={`text-xs font-medium ${
                        card.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-full p-2 md:p-3">{card.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Overview */}
      <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => navigate('/dashboard')}>
        <CardHeader className="pb-1 md:pb-2 p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Performance Overview</CardTitle>
          <CardDescription className="text-xs md:text-sm">Compare current month with previous month</CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
            <div className="p-2 md:p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors" onClick={(e) => { e.stopPropagation(); navigate('/clients'); }}>
              <p className="text-xs text-gray-500 font-medium">New Clients</p>
              <div className="flex items-baseline mt-1">
                <h4 className="text-base md:text-lg font-bold">{performanceMetrics.thisMonth.newClients}</h4>
                <span className="ml-1 text-[10px] md:text-xs text-green-600">{performanceMetrics.growth.newClients}</span>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">vs {performanceMetrics.lastMonth.newClients} last month</p>
            </div>
            
            <div className="p-2 md:p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors" onClick={(e) => { e.stopPropagation(); navigate('/policies'); }}>
              <p className="text-xs text-gray-500 font-medium">New Policies</p>
              <div className="flex items-baseline mt-1">
                <h4 className="text-base md:text-lg font-bold">{performanceMetrics.thisMonth.newPolicies}</h4>
                <span className="ml-1 text-[10px] md:text-xs text-green-600">{performanceMetrics.growth.newPolicies}</span>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">vs {performanceMetrics.lastMonth.newPolicies} last month</p>
            </div>
            
            <div className="p-2 md:p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors" onClick={(e) => { e.stopPropagation(); navigate('/invoices'); }}>
              <p className="text-xs text-gray-500 font-medium">Premium Revenue</p>
              <div className="flex items-baseline mt-1">
                <h4 className="text-base md:text-lg font-bold">{performanceMetrics.thisMonth.revenue}</h4>
                <span className="ml-1 text-[10px] md:text-xs text-green-600">{performanceMetrics.growth.revenue}</span>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">vs {performanceMetrics.lastMonth.revenue} last month</p>
            </div>
            
            <div className="p-2 md:p-4 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors" onClick={(e) => { e.stopPropagation(); navigate('/claims'); }}>
              <p className="text-xs text-gray-500 font-medium">Claims Processed</p>
              <div className="flex items-baseline mt-1">
                <h4 className="text-base md:text-lg font-bold">{performanceMetrics.thisMonth.claims}</h4>
                <span className="ml-1 text-[10px] md:text-xs text-green-600">{performanceMetrics.growth.claims}</span>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">vs {performanceMetrics.lastMonth.claims} last month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Premium */}
        <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => navigate('/invoices')}>
          <CardHeader className="pb-1 md:pb-2 p-4 md:p-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center text-base md:text-lg">
                  <BarChart4 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Monthly Premium Collection
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">Monthly revenue from premium collections</CardDescription>
              </div>
              <select className="text-xs md:text-sm border rounded p-1">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={getChartHeight()}>
                <RechartLineChart data={isMobile ? monthlyPremiumData.slice(-6) : monthlyPremiumData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={isMobile ? 10 : 12} 
                    tickLine={false} 
                    axisLine={false} 
                    interval={isMobile ? 1 : 0}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={isMobile ? 10 : 12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => isMobile ? `₹${value/1000}k` : `₹${value/1000}k`}
                    width={isMobile ? 40 : 60}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: isMobile ? '12px' : '14px',
                      padding: isMobile ? '8px' : '12px'
                    }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Premium']}
                  />
                  <Line
                    type="monotone"
                    dataKey="premium"
                    stroke="#1b365d"
                    strokeWidth={isMobile ? 2 : 3}
                    activeDot={{ r: isMobile ? 4 : 6, fill: "#1b365d" }}
                    dot={false}
                  />
                </RechartLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Policy Distribution */}
        <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => navigate('/policies')}>
          <CardHeader className="pb-1 md:pb-2 p-4 md:p-6">
            <CardTitle className="flex items-center text-base md:text-lg">
              <PieChart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Policy Distribution
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Breakdown by insurance type</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={getChartHeight()}>
                <RechartPieChart>
                  <Pie
                    data={policyTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={getPieChartRadius().outer}
                    dataKey="value"
                    labelLine={false}
                    label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {policyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: isMobile ? '12px' : '14px',
                      padding: isMobile ? '8px' : '12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                  />
                </RechartPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="border-none shadow-md">
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="flex items-center text-base md:text-lg">
            <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Recent Activities
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Latest updates from across your business</CardDescription>
        </CardHeader>
        <CardContent className="p-0 max-h-[300px] overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="p-3 md:p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <div className="bg-gray-100 rounded-full p-1.5 md:p-2 mr-2 md:mr-3 flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-900 line-clamp-1">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      Client: {activity.client} | Agent: {activity.agent}
                    </p>
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap ml-1">{activity.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="border-t p-3 md:p-4 text-center">
          <Button 
            variant="ghost"
            onClick={handleViewAllActivities}
            className="text-xs md:text-sm text-blue-600 hover:text-blue-800 w-full"
          >
            View All Activities
          </Button>
        </CardFooter>
      </Card>

      {/* Upcoming Renewals */}
      <Card className="border-none shadow-md">
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="flex items-center text-base md:text-lg">
            <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Upcoming Renewals
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Policies due for renewal in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isMobile ? (
            <div className="divide-y divide-gray-200">
              {upcomingRenewals.map((renewal) => (
                <div key={renewal.id} className="p-3 hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/policies')}>
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">{renewal.client}</p>
                    <p className="text-sm">{renewal.premium}</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-xs text-gray-700">{renewal.policyType}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{renewal.policyNumber}</span>
                      <span className="text-xs text-gray-500">Due: {renewal.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Premium</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingRenewals.map((renewal) => (
                  <TableRow key={renewal.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/policies')}>
                    <TableCell className="font-medium">{renewal.client}</TableCell>
                    <TableCell>
                      <div>{renewal.policyType}</div>
                      <div className="text-xs text-gray-400">{renewal.policyNumber}</div>
                    </TableCell>
                    <TableCell>{renewal.dueDate}</TableCell>
                    <TableCell>{renewal.premium}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t p-3 md:p-4 text-center">
          <Button 
            variant="ghost"
            onClick={handleViewAllRenewals}
            className="text-xs md:text-sm text-blue-600 hover:text-blue-800 w-full"
          >
            View All Renewals
          </Button>
        </CardFooter>
      </Card>

      {/* Top Performing Agents */}
      <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => navigate('/agents')}>
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="flex items-center text-base md:text-lg">
            <Users className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Top Performing Agents
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Based on policies sold and premium generated</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isMobile ? (
            <div className="divide-y divide-gray-200">
              {topAgents.map((agent, index) => (
                <div key={index} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      {agent.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-sm">{agent.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                    <div>
                      <span className="text-gray-500 block">Policies</span>
                      <span className="font-medium">{agent.policies}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Premium</span>
                      <span className="font-medium">{agent.premium}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Conversion</span>
                      <span className="font-medium">{agent.conversion}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Policies Sold</TableHead>
                  <TableHead>Premium Generated</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAgents.map((agent, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          {agent.name.charAt(0)}
                        </div>
                        <div className="ml-3 font-medium">
                          {agent.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{agent.policies}</TableCell>
                    <TableCell>{agent.premium}</TableCell>
                    <TableCell>{agent.conversion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t p-3 md:p-4 text-center">
          <Button 
            variant="ghost" 
            onClick={(e) => { e.stopPropagation(); navigate('/agents'); }}
            className="text-xs md:text-sm text-blue-600 hover:text-blue-800 w-full"
          >
            View All Agents
          </Button>
        </CardFooter>
      </Card>

      {/* Claims Status */}
      <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => navigate('/claims')}>
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="flex items-center text-base md:text-lg">
            <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Claims Status
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Summary of all claims</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={getChartHeight()}>
              <RechartPieChart>
                <Pie
                  data={claimsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={getPieChartRadius().inner}
                  outerRadius={getPieChartRadius().outer}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {claimsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, name]} 
                  contentStyle={{ 
                    fontSize: isMobile ? '12px' : '14px',
                    padding: isMobile ? '8px' : '12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                />
              </RechartPieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 md:mt-2 space-y-2 px-2 md:px-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs md:text-sm">Approved</span>
              </div>
              <span className="text-xs md:text-sm font-medium">65%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                <span className="text-xs md:text-sm">Pending</span>
              </div>
              <span className="text-xs md:text-sm font-medium">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-xs md:text-sm">Rejected</span>
              </div>
              <span className="text-xs md:text-sm font-medium">10%</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-3 md:p-4 text-center">
          <Button 
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); navigate('/claims'); }}
            className="text-xs md:text-sm text-blue-600 hover:text-blue-800 w-full"
          >
            View All Claims
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
