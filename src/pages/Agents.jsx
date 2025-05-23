
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, UserPlus, Filter, ChevronDown, Trash2 } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import AgentTable from '@/components/agents/AgentTable';
import ClientFilters from '@/components/clients/ClientFilters';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Agents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Load agents from localStorage or API in production
    const storedAgents = localStorage.getItem('agentsData');
    if (storedAgents) {
      setAgents(JSON.parse(storedAgents));
    } else {
      // Sample data if nothing exists in localStorage
      const sampleAgents = [
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
      setAgents(sampleAgents);
      localStorage.setItem('agentsData', JSON.stringify(sampleAgents));
    }
  }, []);

  // Filter and sort agents
  const getFilteredAndSortedAgents = () => {
    let filteredAgents = agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.phone.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
      
      const matchesSpecialization = filterSpecialization === 'all' || 
                                  agent.specialization === filterSpecialization;
      
      return matchesSearch && matchesStatus && matchesSpecialization;
    });

    // Sort the filtered agents
    filteredAgents.sort((a, b) => {
      let valueA = a[sortField]?.toString().toLowerCase();
      let valueB = b[sortField]?.toString().toLowerCase();
      
      if (sortDirection === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    return filteredAgents;
  };

  const handleCreateAgent = () => {
    navigate('/agents/create');
  };

  const handleExportData = () => {
    // Get the filtered and sorted agents
    const agentsToExport = getFilteredAndSortedAgents();

    // Create CSV data
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Name,Email,Phone,Status,Specialization,Joined Date,Clients,Policies,Premium Generated,Commission Earned,Conversion Rate\n";
    
    // Add agent data
    agentsToExport.forEach(agent => {
      csvContent += `${agent.name},${agent.email},${agent.phone},${agent.status},${agent.specialization},${agent.joinDate},${agent.clientsCount},${agent.policiesCount},${agent.premiumGenerated},${agent.commissionEarned},${agent.conversionRate}\n`;
    });
    
    // Create a download link and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "agents_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Agents Data Exported",
      description: `${agentsToExport.length} agents exported to CSV file.`,
    });
  };

  const handleBulkUpload = () => {
    navigate('/agents/bulk-upload');
  };

  const handleAgentClick = (agentId) => {
    navigate(`/agents/${agentId}`);
  };

  const handleDeleteAgentClick = (agent, e) => {
    e.stopPropagation();
    setSelectedAgent(agent);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAgent = () => {
    if (selectedAgent) {
      const updatedAgents = agents.filter(agent => agent.id !== selectedAgent.id);
      setAgents(updatedAgents);
      localStorage.setItem('agentsData', JSON.stringify(updatedAgents));
      
      toast({
        title: "Agent Deleted",
        description: `${selectedAgent.name} has been removed successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedAgent(null);
    }
  };

  const filterOptions = [
    'All',
    'Active',
    'Inactive',
    'Onboarding'
  ];

  // Convert active filters for ClientFilters component
  const activeFilters = [];
  if (filterStatus !== 'all') {
    activeFilters.push({
      name: 'Status',
      value: filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)
    });
  }
  if (filterSpecialization !== 'all') {
    activeFilters.push({
      name: 'Specialization',
      value: filterSpecialization
    });
  }

  // Handle removing a filter
  const removeFilter = (filterName) => {
    if (filterName === 'Status') {
      setFilterStatus('all');
    } else if (filterName === 'Specialization') {
      setFilterSpecialization('all');
    }
  };

  const filteredAgents = getFilteredAndSortedAgents();

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Agents Management</h1>
        <div className="text-sm text-gray-500">
          Total: {filteredAgents.length} agents
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
        /* Desktop view - enhanced filtering and sorting */
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

          <ClientFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedFilter=""
            setSelectedFilter={() => {}}
            filterOptions={["All"]}
            handleExport={handleExportData}
            sortField={sortField}
            sortDirection={sortDirection}
            setSortField={setSortField}
            setSortDirection={setSortDirection}
            activeFilters={activeFilters}
            removeFilter={removeFilter}
            placeholderText="Search agents..."
          />

          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="flex items-center w-full sm:w-auto">
              <Filter size={16} className="mr-1 text-gray-500" />
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
            <div className="flex items-center w-full sm:w-auto">
              <Filter size={16} className="mr-1 text-gray-500" />
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
          </div>
        </div>
      )}

      {/* Agents Table/Cards */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <AgentTable 
          agents={filteredAgents} 
          onAgentClick={handleAgentClick}
          onDeleteAgent={handleDeleteAgentClick}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAgent?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAgent}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Agents;
