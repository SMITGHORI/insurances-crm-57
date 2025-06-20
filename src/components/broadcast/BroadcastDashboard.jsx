
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus,
  TrendingUp,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Gift,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useEnhancedBroadcasts, useAutomatedTriggers, useBroadcastAnalytics } from '@/hooks/useEnhancedBroadcast';

const BroadcastDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: broadcasts, isLoading } = useEnhancedBroadcasts();
  const { data: analytics } = useBroadcastAnalytics();
  const automatedTriggers = useAutomatedTriggers();

  const statsCards = [
    {
      title: 'Total Campaigns',
      value: analytics?.totalCampaigns || '0',
      change: '+12%',
      icon: <Send className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-50'
    },
    {
      title: 'Messages Sent',
      value: analytics?.totalMessagesSent || '0',
      change: '+24%',
      icon: <MessageSquare className="h-6 w-6 text-green-600" />,
      color: 'bg-green-50'
    },
    {
      title: 'Engagement Rate',
      value: `${analytics?.avgEngagementRate || 0}%`,
      change: '+8%',
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-50'
    },
    {
      title: 'Revenue Generated',
      value: `₹${analytics?.totalRevenue || 0}`,
      change: '+15%',
      icon: <Gift className="h-6 w-6 text-orange-600" />,
      color: 'bg-orange-50'
    }
  ];

  const automatedTriggerCards = [
    {
      title: 'Birthday Greetings',
      description: 'Send personalized birthday wishes',
      icon: <Gift className="h-5 w-5 text-red-500" />,
      triggerType: 'birthday',
      color: 'bg-red-50 hover:bg-red-100'
    },
    {
      title: 'Policy Renewals',
      description: 'Automated renewal reminders',
      icon: <Bell className="h-5 w-5 text-blue-500" />,
      triggerType: 'policy_expiry',
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'Payment Reminders',
      description: 'Premium payment due alerts',
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      triggerType: 'payment_due',
      color: 'bg-yellow-50 hover:bg-yellow-100'
    },
    {
      title: 'Claim Updates',
      description: 'Notify clients about claim status',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      triggerType: 'claim_update',
      color: 'bg-green-50 hover:bg-green-100'
    }
  ];

  const handleTriggerAutomation = (triggerType) => {
    automatedTriggers.mutate(triggerType);
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending_approval': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'sending': 'bg-purple-100 text-purple-800',
      'sent': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Broadcast Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, manage, and analyze your communication campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                  <p className="text-sm text-green-600 mt-1">{card.change}</p>
                </div>
                <div className={`${card.color} rounded-full p-3`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Automated Triggers */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Automated Triggers</CardTitle>
          <p className="text-sm text-gray-500">Trigger automated campaigns based on client events</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {automatedTriggerCards.map((trigger, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`${trigger.color} h-auto p-4 flex flex-col items-start text-left`}
                onClick={() => handleTriggerAutomation(trigger.triggerType)}
                disabled={automatedTriggers.isPending}
              >
                <div className="flex items-center w-full mb-2">
                  {trigger.icon}
                  <span className="font-medium text-sm ml-2">{trigger.title}</span>
                </div>
                <p className="text-xs text-gray-600">{trigger.description}</p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="border-none shadow-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Recent Campaigns */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Campaigns</h3>
                  <div className="space-y-3">
                    {broadcasts?.data?.slice(0, 5)?.map((campaign) => (
                      <div key={campaign._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-white rounded-full p-2 mr-3">
                            {campaign.type === 'offer' ? (
                              <Gift className="h-4 w-4 text-orange-500" />
                            ) : campaign.type === 'policy_renewal' ? (
                              <Bell className="h-4 w-4 text-blue-500" />
                            ) : (
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{campaign.title}</p>
                            <p className="text-xs text-gray-500">
                              {campaign.channels.join(', ')} • {formatDate(campaign.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">{campaign.stats?.totalRecipients || 0} recipients</p>
                            <p className="text-xs text-green-600">{campaign.stats?.roi || 0}% ROI</p>
                          </div>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                      <Send className="h-6 w-6 text-blue-500 mb-2" />
                      <span className="font-medium">Create Campaign</span>
                      <span className="text-xs text-gray-500">Start a new broadcast</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                      <BarChart3 className="h-6 w-6 text-green-500 mb-2" />
                      <span className="font-medium">View Analytics</span>
                      <span className="text-xs text-gray-500">Campaign performance</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                      <Settings className="h-6 w-6 text-purple-500 mb-2" />
                      <span className="font-medium">Manage Templates</span>
                      <span className="text-xs text-gray-500">Create reusable templates</span>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="campaigns">
              <div className="text-center py-8">
                <Send className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Campaign management interface coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Template management interface coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Advanced analytics dashboard coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="automation">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Automation rules interface coming soon</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default BroadcastDashboard;
