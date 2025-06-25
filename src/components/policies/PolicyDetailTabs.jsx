
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Receipt, StickyNote, Shield, Calendar, Clock } from 'lucide-react';
import PolicyOverview from './details/PolicyOverview';
import PolicyDocuments from './details/PolicyDocuments';
import PolicyPayments from './details/PolicyPayments';
import PolicyNotes from './details/PolicyNotes';
import PolicyRenewals from './details/PolicyRenewals';
import PolicyTimeline from './details/PolicyTimeline';

const PolicyDetailTabs = ({ policy }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
        <TabsTrigger value="overview" className="flex items-center text-xs">
          <Shield size={14} className="mr-1" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center text-xs">
          <FileText size={14} className="mr-1" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center text-xs">
          <Receipt size={14} className="mr-1" />
          Payments
        </TabsTrigger>
        <TabsTrigger value="renewals" className="flex items-center text-xs">
          <Calendar size={14} className="mr-1" />
          Renewals
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
        <PolicyOverview policy={policy} />
      </TabsContent>
      
      <TabsContent value="documents" className="mt-6">
        <PolicyDocuments policyId={policy._id || policy.id} />
      </TabsContent>
      
      <TabsContent value="payments" className="mt-6">
        <PolicyPayments policyId={policy._id || policy.id} />
      </TabsContent>
      
      <TabsContent value="renewals" className="mt-6">
        <PolicyRenewals policyId={policy._id || policy.id} />
      </TabsContent>
      
      <TabsContent value="timeline" className="mt-6">
        <PolicyTimeline policyId={policy._id || policy.id} />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-6">
        <PolicyNotes policyId={policy._id || policy.id} />
      </TabsContent>
    </Tabs>
  );
};

export default PolicyDetailTabs;
