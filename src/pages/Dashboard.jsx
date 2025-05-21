
import React from 'react';
import { Bar, Pie, Line } from 'recharts';
import { BarChart, PieChart, LineChart } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileCheck,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  // Sample data for charts
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

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Clients',
      value: '312',
      change: '+8%',
      isPositive: true,
      icon: <Users className="h-6 w-6 text-amba-blue" />,
    },
    {
      title: 'Active Policies',
      value: '548',
      change: '+12%',
      isPositive: true,
      icon: <FileText className="h-6 w-6 text-amba-orange" />,
    },
    {
      title: 'Total Claims',
      value: '94',
      change: '+5%',
      isPositive: true,
      icon: <ShieldCheck className="h-6 w-6 text-green-600" />,
    },
    {
      title: 'New Leads',
      value: '53',
      change: '-3%',
      isPositive: false,
      icon: <Star className="h-6 w-6 text-yellow-500" />,
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'client':
        return <Users className="h-5 w-5 text-amba-blue" />;
      case 'policy':
        return <FileCheck className="h-5 w-5 text-amba-orange" />;
      case 'claim':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
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
    navigate('/recent-activities');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">Today: {new Date().toLocaleDateString('en-GB')}</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                <div className="flex items-center mt-1">
                  {card.isPositive ? (
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span 
                    className={`text-xs font-medium ${
                      card.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {card.change} from last month
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 rounded-full p-3">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Premium */}
        <div className="bg-white rounded-lg shadow p-4 col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Monthly Premium Collection</h3>
            <select className="text-sm border rounded p-1">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64">
            <LineChart width={500} height={250} data={monthlyPremiumData}>
              <Line type="monotone" dataKey="premium" stroke="#1b365d" strokeWidth={2} />
            </LineChart>
          </div>
        </div>

        {/* Policy Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Policy Distribution</h3>
          </div>
          <div className="h-64 flex justify-center items-center">
            <PieChart width={250} height={250}>
              <Pie
                data={policyTypeData}
                cx={125}
                cy={125}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              />
            </PieChart>
          </div>
          <div className="flex justify-center mt-2 space-x-4">
            {policyTypeData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: entry.fill }}></div>
                <span className="text-xs">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Recent Activities</h3>
          </div>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="bg-gray-100 rounded-full p-2 mr-3">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500">
                        Client: {activity.client} | Agent: {activity.agent}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 border-t text-center">
            <button 
              onClick={handleViewAllActivities}
              className="text-sm text-amba-blue hover:text-amba-lightblue"
            >
              View All Activities
            </button>
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Upcoming Renewals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingRenewals.map((renewal) => (
                  <tr key={renewal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{renewal.client}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{renewal.policyType}</div>
                      <div className="text-xs text-gray-400">{renewal.policyNumber}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{renewal.dueDate}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{renewal.premium}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t text-center">
            <button 
              onClick={handleViewAllRenewals}
              className="text-sm text-amba-blue hover:text-amba-lightblue"
            >
              View All Renewals
            </button>
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Agents */}
        <div className="bg-white rounded-lg shadow col-span-1 lg:col-span-2">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Top Performing Agents</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policies Sold</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium Generated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topAgents.map((agent, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-amba-blue">
                          {agent.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {agent.policies}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {agent.premium}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{agent.conversion}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t text-center">
            <button className="text-sm text-amba-blue hover:text-amba-lightblue">View All Agents</button>
          </div>
        </div>

        {/* Claims Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Claims Status</h3>
          </div>
          <div className="p-4">
            <div className="h-64 flex justify-center items-center">
              <PieChart width={200} height={200}>
                <Pie
                  data={claimsData}
                  cx={100}
                  cy={100}
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                />
              </PieChart>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Approved</span>
                </div>
                <span className="text-sm font-medium">65%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">Rejected</span>
                </div>
                <span className="text-sm font-medium">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
