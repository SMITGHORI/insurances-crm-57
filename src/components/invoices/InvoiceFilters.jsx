
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const InvoiceFilters = ({ filterParams, setFilterParams }) => {
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [policyTypes, setPolicyTypes] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  
  // Load agents, clients from localStorage
  useEffect(() => {
    const storedAgentsData = localStorage.getItem('agentsData');
    const storedClientsData = localStorage.getItem('clientsData');
    const storedPoliciesData = localStorage.getItem('policiesData');
    
    if (storedAgentsData) {
      setAgents(JSON.parse(storedAgentsData));
    }
    
    if (storedClientsData) {
      setClients(JSON.parse(storedClientsData));
    }
    
    if (storedPoliciesData) {
      // Extract unique policy types
      const policies = JSON.parse(storedPoliciesData);
      const types = [...new Set(policies.map(policy => policy.type))].filter(Boolean);
      setPolicyTypes(types);
    }
  }, []);
  
  const handleStatusChange = (value) => {
    setFilterParams({ ...filterParams, status: value });
  };
  
  const handleAgentChange = (value) => {
    setFilterParams({ ...filterParams, agentId: value });
  };
  
  const handleClientChange = (value) => {
    setFilterParams({ ...filterParams, clientId: value });
  };
  
  const handlePolicyTypeChange = (value) => {
    setFilterParams({ ...filterParams, policyType: value });
  };
  
  const handleDateChange = (range) => {
    setDateRange(range);
    if (range.from && range.to) {
      setFilterParams({ 
        ...filterParams, 
        dateRange: `${format(range.from, "yyyy-MM-dd")}_${format(range.to, "yyyy-MM-dd")}`
      });
    }
  };
  
  const handleResetFilters = () => {
    setFilterParams({
      status: 'all',
      agentId: 'all',
      clientId: 'all',
      dateRange: 'all',
      policyType: 'all'
    });
    setDateRange({ from: null, to: null });
  };

  return (
    <div className="bg-white p-4 rounded-md border mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <Select
          value={filterParams.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
        <Select
          value={filterParams.agentId}
          onValueChange={handleAgentChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {agents.map(agent => (
              <SelectItem key={agent.id} value={agent.id.toString()}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
        <Select
          value={filterParams.clientId}
          onValueChange={handleClientChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Type</label>
        <Select
          value={filterParams.policyType}
          onValueChange={handlePolicyTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {policyTypes.map((type, index) => (
              <SelectItem key={index} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd MMM yyyy")} - {format(dateRange.to, "dd MMM yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd MMM yyyy")
                )
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="col-span-1 md:col-span-5 flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleResetFilters}
          className="flex items-center"
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default InvoiceFilters;
