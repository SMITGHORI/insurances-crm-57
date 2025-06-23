
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, ShieldCheck, Receipt, Target, StickyNote } from 'lucide-react';
import AgentPerformance from './AgentPerformance';
import AgentClients from './AgentClients';
import AgentPolicies from './AgentPolicies';
import AgentCommissions from './AgentCommissions';
import AgentDocuments from './details/AgentDocuments';
import AgentNotes from './details/AgentNotes';
import AgentTargets from './details/AgentTargets';

const AgentDetailTabs = ({ agent }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
        <TabsTrigger value="overview" className="flex items-center text-xs">
          <FileText size={14} className="mr-1" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="clients" className="flex items-center text-xs">
          <Users size={14} className="mr-1" />
          Clients
        </TabsTrigger>
        <TabsTrigger value="policies" className="flex items-center text-xs">
          <ShieldCheck size={14} className="mr-1" />
          Policies
        </TabsTrigger>
        <TabsTrigger value="commissions" className="flex items-center text-xs">
          <Receipt size={14} className="mr-1" />
          Commissions
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center text-xs">
          <FileText size={14} className="mr-1" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center text-xs">
          <StickyNote size={14} className="mr-1" />
          Notes
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <div className="space-y-6">
          <AgentPerformance agentId={agent._id || agent.id} />
          <AgentTargets agentId={agent._id || agent.id} />
        </div>
      </TabsContent>
      
      <TabsContent value="clients" className="mt-6">
        <AgentClients agentId={agent._id || agent.id} />
      </TabsContent>
      
      <TabsContent value="policies" className="mt-6">
        <AgentPolicies agentId={agent._id || agent.id} />
      </TabsContent>
      
      <TabsContent value="commissions" className="mt-6">
        <AgentCommissions agentId={agent._id || agent.id} />
      </TabsContent>
      
      <TabsContent value="documents" className="mt-6">
        <AgentDocuments agentId={agent._id || agent.id} />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-6">
        <AgentNotes agentId={agent._id || agent.id} />
      </TabsContent>
    </Tabs>
  );
};

export default AgentDetailTabs;
