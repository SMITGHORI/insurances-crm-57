
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
  MessageSquare, 
  Users, 
  BarChart3,
  FileText,
  CheckCircle,
  Settings,
  TestTube,
  Target
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import EnhancedBroadcastCreator from './EnhancedBroadcastCreator';
import BroadcastTemplates from './BroadcastTemplates';
import BroadcastApproval from './BroadcastApproval';
import ClientOptInManager from './ClientOptInManager';
import BroadcastHistory from './BroadcastHistory';
import EnhancedBroadcastAnalytics from './EnhancedBroadcastAnalytics';
import { useEnhancedBroadcasts } from '@/hooks/useEnhancedBroadcastSystem';

const OffersModule = () => {
  const [activeTab, setActiveTab] = useState('create');
  const isMobile = useIsMobile();

  // Get counts for badges
  const { data: pendingApprovals } = useEnhancedBroadcasts({ 
    status: 'pending_approval',
    limit: 1 
  });

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Enhanced Offers & Broadcast Management
        </h1>
        <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
          Advanced broadcast system with A/B testing, automation, approval workflows, and comprehensive analytics
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <div className="space-y-2">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 h-auto' : 'grid-cols-4'} gap-1 md:gap-0`}>
            <TabsTrigger 
              value="create" 
              className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm ${isMobile ? 'p-2 h-auto flex-col' : ''}`}
            >
              <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
              <span className={isMobile ? 'text-xs' : ''}>Create</span>
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm ${isMobile ? 'p-2 h-auto flex-col' : ''}`}
            >
              <FileText className="h-3 w-3 md:h-4 md:w-4" />
              <span className={isMobile ? 'text-xs' : ''}>Templates</span>
            </TabsTrigger>
            <TabsTrigger 
              value="approval" 
              className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm ${isMobile ? 'p-2 h-auto flex-col relative' : ''}`}
            >
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span className={isMobile ? 'text-xs' : ''}>Approvals</span>
              {pendingApprovals?.pagination?.totalItems > 0 && (
                <Badge variant="destructive" className="text-xs ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {pendingApprovals.pagination.totalItems}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="clients" 
              className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm ${isMobile ? 'p-2 h-auto flex-col' : ''}`}
            >
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span className={isMobile ? 'text-xs' : ''}>Clients</span>
            </TabsTrigger>
          </TabsList>

          {/* Second row for mobile */}
          {isMobile && (
            <TabsList className="grid w-full grid-cols-2 gap-1">
              <TabsTrigger 
                value="history" 
                className="flex items-center gap-1 text-xs p-2 h-auto flex-col"
              >
                <Gift className="h-3 w-3" />
                <span className="text-xs">History</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-1 text-xs p-2 h-auto flex-col"
              >
                <BarChart3 className="h-3 w-3" />
                <span className="text-xs">Analytics</span>
              </TabsTrigger>
            </TabsList>
          )}

          {/* Desktop additional tabs */}
          {!isMobile && (
            <TabsList className="grid w-full grid-cols-2 gap-1">
              <TabsTrigger 
                value="history" 
                className="flex items-center gap-2 text-sm"
              >
                <Gift className="h-4 w-4" />
                Broadcast History
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 text-sm"
              >
                <BarChart3 className="h-4 w-4" />
                Enhanced Analytics
              </TabsTrigger>
            </TabsList>
          )}
        </div>

        <TabsContent value="create" className="space-y-4 md:space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                Enhanced Broadcast Creator
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Create advanced broadcasts with A/B testing, automation, and approval workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <EnhancedBroadcastCreator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 md:space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                Broadcast Templates
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Manage reusable templates for different types of broadcasts and communications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <BroadcastTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4 md:space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                Broadcast Approval Workflow
                {pendingApprovals?.pagination?.totalItems > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingApprovals.pagination.totalItems} Pending
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Review and approve broadcasts before they are sent to clients
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <BroadcastApproval />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4 md:space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                Client Communication Preferences
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Manage client opt-in/opt-out preferences for different communication channels and types
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <ClientOptInManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 md:space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Gift className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                Broadcast History & Management
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                View, manage, and analyze all your past broadcasts and their performance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <BroadcastHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 md:space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                Enhanced Broadcast Analytics
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Comprehensive analytics with conversion tracking, ROI analysis, and advanced engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <EnhancedBroadcastAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Dashboard */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            <span className="font-medium">A/B Tests</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-xs text-gray-500">Active Tests</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="h-5 w-5 text-green-600" />
            <span className="font-medium">Automation</span>
          </div>
          <div className="text-2xl font-bold text-green-600">8</div>
          <div className="text-xs text-gray-500">Active Rules</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Templates</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">24</div>
          <div className="text-xs text-gray-500">Ready to Use</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Compliance</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">98%</div>
          <div className="text-xs text-gray-500">Score</div>
        </Card>
      </div>
    </div>
  );
};

export default OffersModule;
