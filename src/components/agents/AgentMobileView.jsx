
import React from 'react';
import { Eye, Edit, User, ShieldCheck, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AgentMobileView = ({ agents, onAgentClick }) => {
  // Helper function to get status badge styling
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

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (agents.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No agents found matching your search criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      {agents.map(agent => (
        <Card 
          key={agent.id} 
          className="overflow-hidden border border-gray-200 shadow-sm"
          onClick={() => onAgentClick(agent.id)}
        >
          <CardContent className="p-0">
            <div className="flex items-center p-4 border-b border-gray-100">
              <Avatar className="h-12 w-12 mr-3">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">{agent.name}</h3>
                <p className="text-xs text-gray-500 truncate">{agent.specialization}</p>
              </div>
              <div>{getStatusBadge(agent.status)}</div>
            </div>
            
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              <div className="p-3 flex items-center text-sm">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 truncate">{agent.email}</span>
              </div>
              <div className="p-3 flex items-center text-sm">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">{agent.phone}</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col">
                  <span className="text-gray-500">Clients</span>
                  <span className="font-medium">{agent.clientsCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Policies</span>
                  <span className="font-medium">{agent.policiesCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Premium</span>
                  <span className="font-medium">{agent.premiumGenerated}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Conversion</span>
                  <span className="font-medium">{agent.conversionRate}</span>
                </div>
              </div>
              <div className="p-3 flex justify-end">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-amba-blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAgentClick(agent.id);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AgentMobileView;
