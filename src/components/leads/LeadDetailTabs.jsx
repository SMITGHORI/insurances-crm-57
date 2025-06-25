
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, StickyNote, Clock, UserCheck, TrendingUp } from 'lucide-react';
import LeadOverview from './details/LeadOverview';
import LeadFollowUps from './details/LeadFollowUps';
import LeadNotes from './details/LeadNotes';
import LeadTimeline from './details/LeadTimeline';
import LeadAssignment from './details/LeadAssignment';

const LeadDetailTabs = ({ lead }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
        <TabsTrigger value="overview" className="flex items-center text-xs">
          <User size={14} className="mr-1" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="followups" className="flex items-center text-xs">
          <Calendar size={14} className="mr-1" />
          Follow-ups
        </TabsTrigger>
        <TabsTrigger value="assignment" className="flex items-center text-xs">
          <UserCheck size={14} className="mr-1" />
          Assignment
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
        <LeadOverview lead={lead} />
      </TabsContent>
      
      <TabsContent value="followups" className="mt-6">
        <LeadFollowUps leadId={lead._id || lead.id} />
      </TabsContent>
      
      <TabsContent value="assignment" className="mt-6">
        <LeadAssignment leadId={lead._id || lead.id} />
      </TabsContent>
      
      <TabsContent value="timeline" className="mt-6">
        <LeadTimeline leadId={lead._id || lead.id} />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-6">
        <LeadNotes leadId={lead._id || lead.id} />
      </TabsContent>
    </Tabs>
  );
};

export default LeadDetailTabs;
