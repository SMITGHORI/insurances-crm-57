

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import AgentTable from '@/components/agents/AgentTable';
import { useAgents, useDeleteAgent, useCreateAgent } from '@/hooks/useAgents';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const Agents = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // API query parameters
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    status: statusFilter,
    sortField,
    sortDirection,
  };

  // React Query hooks
  const {
    data: agentsResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useAgents(queryParams);

  const createAgentMutation = useCreateAgent();
  const deleteAgentMutation = useDeleteAgent();

  // Extract data from API response
  const agents = agentsResponse?.data || [];
  const totalAgents = agentsResponse?.total || 0;
  const totalPages = agentsResponse?.totalPages || 1;

  const handleCreateAgent = () => {
    navigate('/agents/create');
  };

  const handleViewAgent = (id) => {
    navigate(`/agents/${id}`);
  };

  const handleEditAgent = (id) => {
    navigate(`/agents/edit/${id}`);
  };

  const handleDeleteAgent = async (id) => {
    const agent = agents.find(a => a._id === id);
    const agentName = agent?.name || `Agent ID: ${id}`;
    
    if (window.confirm(`Are you sure you want to delete "${agentName}"? This action cannot be undone.`)) {
      try {
        await deleteAgentMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete agent:', error);
      }
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExport = async () => {
    try {
      toast.info('Export feature will be available after backend integration');
      // TODO: Implement export functionality with backend
    } catch (error) {
      toast.error('Failed to export agents');
    }
  };

  // Professional loading state
  if (isLoading && currentPage === 1) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Failed to load agents: {error?.message || 'Unknown error'}
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Agents Management</h1>
        <Button onClick={handleCreateAgent} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> {isMobile ? 'Create' : 'Create Agent'}
        </Button>
      </div>

      <div className="max-w-full overflow-hidden mb-20 sm:mb-0">
        <AgentTable 
          agents={agents}
          onViewAgent={handleViewAgent}
          onEditAgent={handleEditAgent}
          onDeleteAgent={handleDeleteAgent}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          isMobile={isMobile}
          isLoading={isLoading}
          isEmpty={agents.length === 0}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalAgents}
          onPageChange={handlePageChange}
          isDeleting={deleteAgentMutation.isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          handleExport={handleExport}
        />
      </div>
    </div>
  );
};

export default Agents;
