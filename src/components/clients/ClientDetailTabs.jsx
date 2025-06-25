
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, Clock, Receipt, StickyNote, Building } from 'lucide-react';
import ClientOverview from './details/ClientOverview';
import ClientDocuments from './details/ClientDocuments';
import ClientPolicies from './details/ClientPolicies';
import ClientTimeline from './details/ClientTimeline';
import ClientNotes from './details/ClientNotes';

const ClientDetailTabs = ({ client }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
        <TabsTrigger value="overview" className="flex items-center text-xs">
          <Building size={14} className="mr-1" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="policies" className="flex items-center text-xs">
          <Users size={14} className="mr-1" />
          Policies
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center text-xs">
          <FileText size={14} className="mr-1" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="timeline" className="flex items-center text-xs">
          <Clock size={14} className="mr-1" />
          Timeline
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center text-xs">
          <StickyNote size={14} className="mr-1" />
          Notes
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <ClientOverview client={client} />
      </TabsContent>
      
      <TabsContent value="policies" className="mt-6">
        <ClientPolicies clientId={client._id || client.id} />
      </TabsContent>
      
      <TabsContent value="documents" className="mt-6">
        <ClientDocuments clientId={client._id || client.id} />
      </TabsContent>
      
      <TabsContent value="timeline" className="mt-6">
        <ClientTimeline clientId={client._id || client.id} />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-6">
        <ClientNotes clientId={client._id || client.id} />
      </TabsContent>
    </Tabs>
  );
};

export default ClientDetailTabs;
