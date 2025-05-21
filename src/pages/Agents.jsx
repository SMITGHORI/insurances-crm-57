
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, UserPlus, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AgentTable from '@/components/agents/AgentTable';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Agents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();

  // Sample data - in production this would come from an API
  const agents = [
    {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@ambainsurance.com',
      phone: '+91 9876543210',
      status: 'active',
      joinDate: '15 Jan 2022',
      specialization: 'Health Insurance',
      clientsCount: 45,
      policiesCount: 78,
      premiumGenerated: '₹5,40,000',
      commissionEarned: '₹86,400',
      conversionRate: '68%',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: 2,
      name: 'Neha Gupta',
      email: 'neha.gupta@ambainsurance.com',
      phone: '+91 9876543211',
      status: 'active',
      joinDate: '23 Mar 2022',
      specialization: 'Term Insurance',
      clientsCount: 42,
      policiesCount: 65,
      premiumGenerated: '₹4,85,000',
      commissionEarned: '₹72,750',
      conversionRate: '65%',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: 3,
      name: 'Vikram Malhotra',
      email: 'vikram.malhotra@ambainsurance.com',
      phone: '+91 9876543212',
      status: 'inactive',
      joinDate: '05 Apr 2022',
      specialization: 'Vehicle Insurance',
      clientsCount: 38,
      policiesCount: 52,
      premiumGenerated: '₹4,10,000',
      commissionEarned: '₹61,500',
      conversionRate: '62%',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    },
    {
      id: 4,
      name: 'Ananya Patel',
      email: 'ananya.patel@ambainsurance.com',
      phone: '+91 9876543213',
      status: 'active',
      joinDate: '18 Jun 2022',
      specialization: 'Health Insurance',
      clientsCount: 36,
      policiesCount: 49,
      premiumGenerated: '₹3,90,000',
      commissionEarned: '₹58,500',
      conversionRate: '60%',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
      id: 5,
      name: 'Rajiv Kapoor',
      email: 'rajiv.kapoor@ambainsurance.com',
      phone: '+91 9876543214',
      status: 'onboarding',
      joinDate: '12 Jul 2022',
      specialization: 'Term Insurance',
      clientsCount: 28,
      policiesCount: 41,
      premiumGenerated: '₹3,45,000',
      commissionEarned: '₹51,750',
      conversionRate: '58%',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    },
    {
      id: 6,
      name: 'Priya Desai',
      email: 'priya.desai@ambainsurance.com',
      phone: '+91 9876543215',
      status: 'active',
      joinDate: '08 Sep 2022',
      specialization: 'Vehicle Insurance',
      clientsCount: 32,
      policiesCount: 44,
      premiumGenerated: '₹3,75,000',
      commissionEarned: '₹56,250',
      conversionRate: '59%',
      avatar: 'https://randomuser.me/api/portraits/women/27.jpg',
    },
  ];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.phone.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    
    const matchesSpecialization = filterSpecialization === 'all' || 
                                 agent.specialization === filterSpecialization;
    
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  const handleCreateAgent = () => {
    navigate('/agents/create');
  };

  const handleExportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your agent data export will be ready shortly.",
    });
  };

  const handleBulkUpload = () => {
    navigate('/agents/bulk-upload');
  };

  const handleAgentClick = (agentId) => {
    navigate(`/agents/${agentId}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Agents Management</h1>
        <div className="text-sm text-gray-500">
          Total: {agents.length} agents
        </div>
      </div>

      {/* Mobile view - Collapsible sections for better organization */}
      {isMobile ? (
        <div className="space-y-3">
          <div className="flex justify-between">
            <Button 
              onClick={handleCreateAgent}
              className="bg-amba-blue hover:bg-blue-800 text-white"
            >
              <UserPlus size={16} className="mr-2" />
              New Agent
            </Button>
            
            <Button 
              variant="outline" 
              className="border-gray-300"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-2" />
              Filters
            </Button>
          </div>
          
          {/* Collapsible Filters Section */}
          <Accordion type="single" collapsible className={showFilters ? "block" : "hidden"}>
            <AccordionItem value="filters" className="border rounded-md">
              <AccordionTrigger className="px-3 py-2 text-sm">Search & Filters</AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {/* Search */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
                
                {/* Status Filter */}
                <div className="w-full">
                  <label className="text-xs text-gray-500 mb-1 block">Filter by Status</label>
                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Specialization Filter */}
                <div className="w-full">
                  <label className="text-xs text-gray-500 mb-1 block">Filter by Specialization</label>
                  <Select
                    value={filterSpecialization}
                    onValueChange={setFilterSpecialization}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                      <SelectItem value="Term Insurance">Term Insurance</SelectItem>
                      <SelectItem value="Vehicle Insurance">Vehicle Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Quick search always visible for convenience */}
          <div className={showFilters ? "hidden" : "relative w-full"}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Quick search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>
      ) : (
        /* Desktop view - keep the existing layout */
        <div className="flex flex-col space-y-3 sm:space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleCreateAgent}
              className="bg-amba-blue hover:bg-blue-800 text-white"
            >
              <UserPlus size={16} className="mr-2" />
              New Agent
            </Button>
            <Button 
              onClick={handleExportData} 
              variant="outline" 
              className="border-gray-300"
            >
              <FileText size={16} className="mr-2" />
              Export Data
            </Button>
            <Button 
              onClick={handleBulkUpload} 
              variant="outline" 
              className="border-gray-300"
            >
              <UserPlus size={16} className="mr-2" />
              Bulk Upload
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {/* Search */}
            <div className="relative w-full sm:w-auto flex-1 sm:max-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center w-full sm:w-auto">
              <Filter size={16} className="mr-1 text-gray-500" />
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
                className="w-full"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Specialization Filter */}
            <div className="flex items-center w-full sm:w-auto">
              <Filter size={16} className="mr-1 text-gray-500" />
              <Select
                value={filterSpecialization}
                onValueChange={setFilterSpecialization}
                className="w-full"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                  <SelectItem value="Term Insurance">Term Insurance</SelectItem>
                  <SelectItem value="Vehicle Insurance">Vehicle Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Agents Table/Cards */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <AgentTable 
          agents={filteredAgents} 
          onAgentClick={handleAgentClick} 
        />
      </div>
    </div>
  );
};

export default Agents;
