
import React from 'react';
import { Eye, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import AgentMobileView from './AgentMobileView';

const AgentTable = ({ agents, onAgentClick, onDeleteAgent }) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <AgentMobileView agents={agents} onAgentClick={onAgentClick} onDeleteAgent={onDeleteAgent} />;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Inactive</Badge>;
      case 'onboarding':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Onboarding</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="amba-table">
        <thead>
          <tr>
            <th className="py-3 px-4 font-medium">Agent</th>
            <th className="py-3 px-4 font-medium">Status</th>
            <th className="py-3 px-4 font-medium">Specialization</th>
            <th className="py-3 px-4 font-medium">Clients</th>
            <th className="py-3 px-4 font-medium">Policies</th>
            <th className="py-3 px-4 font-medium">Premium Generated</th>
            <th className="py-3 px-4 font-medium">Commission</th>
            <th className="py-3 px-4 font-medium">Conversion Rate</th>
            <th className="py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.length === 0 ? (
            <tr>
              <td colSpan="9" className="py-8 text-center text-gray-500">
                No agents found matching your search criteria
              </td>
            </tr>
          ) : (
            agents.map((agent) => (
              <tr 
                key={agent.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onAgentClick(agent.id)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <img 
                      src={agent.avatar} 
                      alt={agent.name} 
                      className="h-8 w-8 rounded-full object-cover mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{agent.name}</div>
                      <div className="text-sm text-gray-500">{agent.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {getStatusBadge(agent.status)}
                </td>
                <td className="py-3 px-4 text-gray-500">{agent.specialization}</td>
                <td className="py-3 px-4 text-gray-500">{agent.clientsCount}</td>
                <td className="py-3 px-4 text-gray-500">{agent.policiesCount}</td>
                <td className="py-3 px-4 text-gray-500">{agent.premiumGenerated}</td>
                <td className="py-3 px-4 text-gray-500">{agent.commissionEarned}</td>
                <td className="py-3 px-4 text-gray-500">{agent.conversionRate}</td>
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onAgentClick(agent.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAgentClick(agent.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => onDeleteAgent(agent, e)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AgentTable;
