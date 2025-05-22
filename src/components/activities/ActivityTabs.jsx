
import React from 'react';
import { Users, FileText, ShieldCheck, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ActivityTabs = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="all" className="flex items-center">
          All
        </TabsTrigger>
        <TabsTrigger value="client" className="flex items-center">
          <Users className="md:mr-2 h-4 w-4" />
          <span className="hidden md:inline">Client</span>
        </TabsTrigger>
        <TabsTrigger value="policy" className="flex items-center">
          <FileText className="md:mr-2 h-4 w-4" />
          <span className="hidden md:inline">Policy</span>
        </TabsTrigger>
        <TabsTrigger value="claim" className="flex items-center">
          <ShieldCheck className="md:mr-2 h-4 w-4" />
          <span className="hidden md:inline">Claims</span>
        </TabsTrigger>
        <TabsTrigger value="lead" className="flex items-center">
          <Star className="md:mr-2 h-4 w-4" />
          <span className="hidden md:inline">Leads</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ActivityTabs;
