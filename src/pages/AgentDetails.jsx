
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  UserCheck,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  FileText,
  Users,
  Receipt
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AgentClients from '@/components/agents/AgentClients';
import AgentPolicies from '@/components/agents/AgentPolicies';
import AgentPerformance from '@/components/agents/AgentPerformance';
import AgentCommissions from '@/components/agents/AgentCommissions';

const AgentDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  
  // In a real app, fetch agent data based on ID
  // This is sample data
  const agent = {
    id: parseInt(id),
    name: 'Rahul Sharma',
    email: 'rahul.sharma@ambainsurance.com',
    phone: '+91 9876543210',
    status: 'active',
    joinDate: '15 Jan 2022',
    specialization: 'Health Insurance',
    clientsCount: 45,
    policiesCount: 78,
    premiumGenerated: '₹5,40,000',
    commissionEarned: '₹86,400',
    conversionRate: '68%',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    address: '123 Patel Nagar, New Delhi, India',
    licenseNumber: 'IRDAI-AG-25896-12/14',
    licenseExpiry: '14 Dec 2025',
    performanceMetrics: {
      leadsConverted: 68,
      targetAchieved: 85,
      customerRating: 4.7,
      retentionRate: 94
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Inactive</Badge>;
      case 'onboarding':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Onboarding</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/agents" className="mr-4 text-gray-600 hover:text-amba-blue">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Agent Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300">
            <Edit size={16} className="mr-2" />
            Edit Agent
          </Button>
          {agent.status === 'active' ? (
            <Button variant="destructive">
              <UserCheck size={16} className="mr-2" />
              Deactivate
            </Button>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <UserCheck size={16} className="mr-2" />
              Activate
            </Button>
          )}
        </div>
      </div>

      {/* Agent Profile Summary Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img 
              src={agent.avatar} 
              alt={agent.name} 
              className="h-24 w-24 rounded-full object-cover border-4 border-gray-100"
            />
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{agent.name}</h2>
                <div className="flex items-center mt-1">
                  {getStatusBadge(agent.status)}
                  <span className="ml-2 text-gray-500">{agent.specialization}</span>
                </div>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className="text-sm font-medium text-gray-500">License #:</span>
                <span className="ml-1 text-sm">{agent.licenseNumber}</span>
                <div className="text-xs text-gray-500">Expires: {agent.licenseExpiry}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Mail size={18} className="text-gray-500 mr-2" />
                <span className="text-sm">{agent.email}</span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-gray-500 mr-2" />
                <span className="text-sm">{agent.phone}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={18} className="text-gray-500 mr-2" />
                <span className="text-sm">Joined: {agent.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Performance Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{agent.performanceMetrics.leadsConverted}%</div>
            <Progress className="h-2 mt-2" value={agent.performanceMetrics.leadsConverted} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Target Achievement</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{agent.performanceMetrics.targetAchieved}%</div>
            <Progress className="h-2 mt-2" value={agent.performanceMetrics.targetAchieved} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Customer Rating</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{agent.performanceMetrics.customerRating}/5</div>
            <div className="flex mt-1 text-yellow-400">
              {[...Array(Math.floor(agent.performanceMetrics.customerRating))].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15.27L16.18 19L14.54 11.97L20 7.24L12.81 6.63L10 0L7.19 6.63L0 7.24L5.46 11.97L3.82 19L10 15.27Z" />
                </svg>
              ))}
              {agent.performanceMetrics.customerRating % 1 !== 0 && (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15.27L16.18 19L14.54 11.97L20 7.24L12.81 6.63L10 0L7.19 6.63L0 7.24L5.46 11.97L3.82 19L10 15.27Z" fill="url(#half-star)" />
                  <defs>
                    <linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0">
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="#d1d5db" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{agent.performanceMetrics.retentionRate}%</div>
            <Progress className="h-2 mt-2" value={agent.performanceMetrics.retentionRate} />
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="overview" className="flex items-center">
            <FileText size={16} className="mr-2" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center">
            <Users size={16} className="mr-2" />
            <span>Clients</span>
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center">
            <ShieldCheck size={16} className="mr-2" />
            <span>Policies</span>
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center">
            <Receipt size={16} className="mr-2" />
            <span>Commissions</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <AgentPerformance agentId={agent.id} />
        </TabsContent>
        
        <TabsContent value="clients" className="mt-6">
          <AgentClients agentId={agent.id} />
        </TabsContent>
        
        <TabsContent value="policies" className="mt-6">
          <AgentPolicies agentId={agent.id} />
        </TabsContent>
        
        <TabsContent value="commissions" className="mt-6">
          <AgentCommissions agentId={agent.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDetails;
