
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, MessageSquare, Users, BarChart3 } from 'lucide-react';
import BroadcastCreator from './BroadcastCreator';
import ClientOptInManager from './ClientOptInManager';
import BroadcastHistory from './BroadcastHistory';
import BroadcastAnalytics from './BroadcastAnalytics';

const OffersModule = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Offers & Broadcast Management</h1>
        <p className="text-gray-600 mt-2">
          Send targeted offers, festival greetings, and announcements to your clients via WhatsApp and Email
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Create Broadcast
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manage Clients
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Broadcast History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Create New Broadcast
              </CardTitle>
              <CardDescription>
                Create and send offers, festival greetings, or announcements to your clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BroadcastCreator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Client Communication Preferences
              </CardTitle>
              <CardDescription>
                Manage client opt-in/opt-out preferences for different communication channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientOptInManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-600" />
                Broadcast History
              </CardTitle>
              <CardDescription>
                View and manage all your past broadcasts and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BroadcastHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Broadcast Analytics
              </CardTitle>
              <CardDescription>
                Analyze the performance of your broadcasts and client engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BroadcastAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OffersModule;
