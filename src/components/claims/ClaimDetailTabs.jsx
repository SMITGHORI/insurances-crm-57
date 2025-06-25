
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Receipt, StickyNote, Shield, Calendar, Clock, AlertCircle } from 'lucide-react';
import ClaimOverview from './details/ClaimOverview';
import ClaimDocuments from './details/ClaimDocuments';
import ClaimNotes from './details/ClaimNotes';
import ClaimTimeline from './details/ClaimTimeline';
import ClaimStatus from './details/ClaimStatus';

const ClaimDetailTabs = ({ claim }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
        <TabsTrigger value="overview" className="flex items-center text-xs">
          <Shield size={14} className="mr-1" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center text-xs">
          <FileText size={14} className="mr-1" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="status" className="flex items-center text-xs">
          <AlertCircle size={14} className="mr-1" />
          Status
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
        <ClaimOverview claim={claim} />
      </TabsContent>
      
      <TabsContent value="documents" className="mt-6">
        <ClaimDocuments claimId={claim._id || claim.id} />
      </TabsContent>
      
      <TabsContent value="status" className="mt-6">
        <ClaimStatus claimId={claim._id || claim.id} />
      </TabsContent>
      
      <TabsContent value="timeline" className="mt-6">
        <ClaimTimeline claimId={claim._id || claim.id} />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-6">
        <ClaimNotes claimId={claim._id || claim.id} />
      </TabsContent>
    </Tabs>
  );
};

export default ClaimDetailTabs;
