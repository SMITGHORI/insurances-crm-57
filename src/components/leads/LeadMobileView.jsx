
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, User, Calendar, Edit, ArrowRight } from 'lucide-react';
import { getStatusColor, getPriorityColor } from './LeadUtils';

const LeadMobileView = ({ leads, onViewDetails, navigate }) => {
  if (leads.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 p-3">No leads found</div>
    );
  }

  return (
    <div className="p-3">
      {leads.map(lead => (
        <div key={lead.id} className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
          <div className="flex justify-between items-start mb-2">
            <div className="max-w-[70%]">
              <h3 className="font-medium truncate">{lead.name}</h3>
              <p className="text-xs text-gray-500">{lead.id}</p>
            </div>
            <Badge className={`${getStatusColor(lead.status)} text-white shrink-0`}>
              {lead.status}
            </Badge>
          </div>
          
          <div className="space-y-1 text-xs mb-3">
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1 shrink-0" /> 
              <span className="truncate">{lead.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-1 shrink-0" /> 
              <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1 shrink-0" /> 
              <span className="truncate">{lead.assignedTo}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 shrink-0" /> 
              <span className="truncate">Next: {lead.nextFollowUp}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`text-xs ${getPriorityColor(lead.priority)}`}>
              {lead.priority} Priority
            </span>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-auto"
                onClick={() => navigate(`/leads/edit/${lead.id}`)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-auto"
                onClick={() => onViewDetails(lead.id)}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadMobileView;
