
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Send, StickyNote, Clock, TrendingUp, Settings } from 'lucide-react';
import QuotationOverview from './details/QuotationOverview';
import QuotationSend from './details/QuotationSend';
import QuotationNotes from './details/QuotationNotes';
import QuotationTimeline from './details/QuotationTimeline';
import QuotationAnalytics from './details/QuotationAnalytics';
import QuotationSettings from './details/QuotationSettings';

const QuotationDetailTabs = ({ quotation }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
        <TabsTrigger value="overview" className="flex items-center text-xs">
          <FileText size={14} className="mr-1" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="send" className="flex items-center text-xs">
          <Send size={14} className="mr-1" />
          Send
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center text-xs">
          <TrendingUp size={14} className="mr-1" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="timeline" className="flex items-center text-xs">
          <Clock size={14} className="mr-1" />
          Timeline
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center text-xs">
          <StickyNote size={14} className="mr-1" />
          Notes
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center text-xs">
          <Settings size={14} className="mr-1" />
          Settings
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <QuotationOverview quotation={quotation} />
      </TabsContent>
      
      <TabsContent value="send" className="mt-6">
        <QuotationSend quotationId={quotation._id || quotation.id} />
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-6">
        <QuotationAnalytics quotationId={quotation._id || quotation.id} />
      </TabsContent>
      
      <TabsContent value="timeline" className="mt-6">
        <QuotationTimeline quotationId={quotation._id || quotation.id} />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-6">
        <QuotationNotes quotationId={quotation._id || quotation.id} />
      </TabsContent>
      
      <TabsContent value="settings" className="mt-6">
        <QuotationSettings quotationId={quotation._id || quotation.id} />
      </TabsContent>
    </Tabs>
  );
};

export default QuotationDetailTabs;
