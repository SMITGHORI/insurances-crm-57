
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, MessageSquare, Users, BarChart3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import BroadcastCreator from './BroadcastCreator';
import ClientOptInManager from './ClientOptInManager';
import BroadcastHistory from './BroadcastHistory';
import BroadcastAnalytics from './BroadcastAnalytics';

const OffersModule = () => {
  const [activeTab, setActiveTab] = useState('create');
  const isMobile = useIsMobile();

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Offers & Broadcast Management
        </h1>
        <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
          Send targeted offers, festival greetings, and announcements to your clients via WhatsApp and Email
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 h-auto' : 'grid-cols-4'} gap-1 md:gap-0`}>
          <TabsTrigger 
            value="create" 
            className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm ${isMobile ? 'p-2 h-auto flex-col' : ''}`}
          >
            <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
            <span className={isMobile ? 'text-xs' : ''}>Create Broadcast</span>
          </TabsTrigger>
          <TabsTrigger 
            value="clients" 
            className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm ${isMobile ? 'p-2 h-auto flex-col' : ''}`}
          >
            <Users className="h-3 w-3 md:h-4 md:w-4" />
            <span className={isMobile ? 'text-xs' : ''}>Manage Clients</span>
          </TabsTrigger>
          {!isMobile && (
            <>
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
                Analytics
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Mobile-only additional tabs */}
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

        <TabsContent value="create" className="space-y-4 md:space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                Create New Broadcast
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Create and send offers, festival greetings, or announcements to your clients
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <BroadcastCreator />
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
                Manage client opt-in/opt-out preferences for different communication channels
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
                Broadcast History
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                View and manage all your past broadcasts and their performance
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
                Broadcast Analytics
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Analyze the performance of your broadcasts and client engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <BroadcastAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OffersModule;
