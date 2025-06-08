
import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Gift,
  Star,
  Calendar,
  BarChart3,
  Users,
  TrendingUp,
  Mail,
  Phone,
  Heart,
  Award,
  Settings,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCommunications, useCommunicationStats, useTriggerBirthdayGreetings, useTriggerAnniversaryGreetings } from '@/hooks/useCommunication';
import CommunicationList from './CommunicationList';
import SendCommunicationDialog from './SendCommunicationDialog';
import OffersManager from './OffersManager';
import LoyaltyManager from './LoyaltyManager';
import AutomationRulesManager from './AutomationRulesManager';

const CommunicationDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const isMobile = useIsMobile();

  const { data: stats, isLoading: statsLoading } = useCommunicationStats();
  const { data: recentCommunications } = useCommunications({ limit: 5 });
  const triggerBirthdayGreetings = useTriggerBirthdayGreetings();
  const triggerAnniversaryGreetings = useTriggerAnniversaryGreetings();

  const statsCards = [
    {
      title: 'Total Communications',
      value: stats?.communications?.totalCommunications || '0',
      change: '+12%',
      isPositive: true,
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      description: 'All time communications sent'
    },
    {
      title: 'Email Sent',
      value: stats?.communications?.byChannel?.filter(c => c.channel === 'email').reduce((sum, c) => sum + c.count, 0) || '0',
      change: '+8%',
      isPositive: true,
      icon: <Mail className="h-6 w-6 text-green-600" />,
      description: 'This month'
    },
    {
      title: 'WhatsApp Sent',
      value: stats?.communications?.byChannel?.filter(c => c.channel === 'whatsapp').reduce((sum, c) => sum + c.count, 0) || '0',
      change: '+15%',
      isPositive: true,
      icon: <Phone className="h-6 w-6 text-green-500" />,
      description: 'This month'
    },
    {
      title: 'Active Offers',
      value: '6',
      change: '+2',
      isPositive: true,
      icon: <Gift className="h-6 w-6 text-orange-500" />,
      description: 'Currently running'
    }
  ];

  const quickActions = [
    {
      title: 'Send Birthday Greetings',
      description: 'Send birthday wishes to today\'s celebrants',
      icon: <Heart className="h-5 w-5 text-red-500" />,
      action: () => triggerBirthdayGreetings.mutate(),
      loading: triggerBirthdayGreetings.isLoading,
      color: 'bg-red-50 hover:bg-red-100'
    },
    {
      title: 'Send Anniversary Greetings',
      description: 'Send anniversary wishes to today\'s celebrants',
      icon: <Award className="h-5 w-5 text-purple-500" />,
      action: () => triggerAnniversaryGreetings.mutate(),
      loading: triggerAnniversaryGreetings.isLoading,
      color: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'Send Manual Message',
      description: 'Send a custom message to specific clients',
      icon: <Send className="h-5 w-5 text-blue-500" />,
      action: () => setShowSendDialog(true),
      loading: false,
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'View Analytics',
      description: 'Detailed communication analytics and reports',
      icon: <BarChart3 className="h-5 w-5 text-green-500" />,
      action: () => setActiveTab('analytics'),
      loading: false,
      color: 'bg-green-50 hover:bg-green-100'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6 px-2 py-2 md:px-4 md:py-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Communication Center</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage automated communications, loyalty programs, and client engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowSendDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size={isMobile ? "sm" : "default"}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-3 md:p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-gray-500 font-medium">{card.title}</p>
                  <h3 className="text-lg md:text-2xl font-bold mt-1">{card.value}</h3>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className="bg-gray-100 rounded-full p-2 md:p-3 ml-2">{card.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-md">
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Common communication tasks and automation triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`${action.color} h-auto p-4 flex flex-col items-start text-left transition-colors`}
                onClick={action.action}
                disabled={action.loading}
              >
                <div className="flex items-center w-full mb-2">
                  {action.icon}
                  <span className="font-medium text-sm ml-2">{action.title}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{action.description}</p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card className="border-none shadow-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="p-4 md:p-6 pb-2">
            <TabsList className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} w-full`}>
              <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="communications" className="text-xs md:text-sm">Messages</TabsTrigger>
              <TabsTrigger value="offers" className="text-xs md:text-sm">Offers</TabsTrigger>
              {!isMobile && (
                <>
                  <TabsTrigger value="loyalty" className="text-xs md:text-sm">Loyalty</TabsTrigger>
                  <TabsTrigger value="automation" className="text-xs md:text-sm">Automation</TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs md:text-sm">Analytics</TabsTrigger>
                </>
              )}
            </TabsList>
          </CardHeader>

          <CardContent className="p-3 md:p-6 pt-0">
            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                {/* Recent Communications */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Communications</h3>
                  {recentCommunications?.data?.length > 0 ? (
                    <div className="space-y-2">
                      {recentCommunications.data.slice(0, 5).map((comm) => (
                        <div key={comm._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="bg-white rounded-full p-2 mr-3">
                              {comm.channel === 'email' ? (
                                <Mail className="h-4 w-4 text-blue-600" />
                              ) : comm.channel === 'whatsapp' ? (
                                <Phone className="h-4 w-4 text-green-600" />
                              ) : (
                                <MessageSquare className="h-4 w-4 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{comm.clientId?.displayName || 'Unknown Client'}</p>
                              <p className="text-xs text-gray-500 capitalize">{comm.type} • {comm.channel}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={comm.status === 'sent' ? 'default' : comm.status === 'pending' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {comm.status}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(comm.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent communications</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="communications" className="mt-4">
              <CommunicationList />
            </TabsContent>

            <TabsContent value="offers" className="mt-4">
              <OffersManager />
            </TabsContent>

            <TabsContent value="loyalty" className="mt-4">
              <LoyaltyManager />
            </TabsContent>

            <TabsContent value="automation" className="mt-4">
              <AutomationRulesManager />
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Analytics dashboard coming soon</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Send Communication Dialog */}
      <SendCommunicationDialog 
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
      />
    </div>
  );
};

export default CommunicationDashboard;
