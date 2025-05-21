
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, User, Calendar, Edit, ArrowRight, Clock, Tag } from 'lucide-react';
import { getStatusColor, getPriorityColor } from './LeadUtils';

const LeadMobileView = ({ leads, onViewDetails, navigate }) => {
  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 px-4">
        <p className="text-base">No leads found</p>
        <p className="text-sm mt-1">Try adjusting your filters or create a new lead</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {leads.map(lead => (
        <Card key={lead.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: getStatusColorHex(lead.status) }}>
          <CardContent className="p-0">
            <div className="p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="max-w-[70%]">
                  <h3 className="font-medium text-base">{lead.name}</h3>
                  <div className="flex items-center mt-1">
                    <Tag className="h-3 w-3 mr-1 text-gray-500" />
                    <p className="text-xs text-gray-500">{lead.id}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(lead.status)} text-white`}>
                  {lead.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3 text-sm mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                    <Phone className="h-4 w-4 text-blue-600" /> 
                  </div>
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-red-50 p-1.5 rounded-full mr-3">
                    <Mail className="h-4 w-4 text-red-600" /> 
                  </div>
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-50 p-1.5 rounded-full mr-3">
                    <User className="h-4 w-4 text-green-600" /> 
                  </div>
                  <span>{lead.assignedTo}</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-50 p-1.5 rounded-full mr-3">
                    <Calendar className="h-4 w-4 text-purple-600" /> 
                  </div>
                  <div className="flex flex-col">
                    <span>Next follow up:</span>
                    <span className="text-xs text-gray-500">{lead.nextFollowUp}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-amber-50 p-1.5 rounded-full mr-3">
                    <Clock className="h-4 w-4 text-amber-600" /> 
                  </div>
                  <div className="flex flex-col">
                    <span>Last interaction:</span>
                    <span className="text-xs text-gray-500">{lead.lastInteraction}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className={`text-sm font-medium ${getPriorityColor(lead.priority)}`}>
                  {lead.priority} Priority
                </span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-gray-200"
                    onClick={() => navigate(`/leads/edit/${lead.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onViewDetails(lead.id)}
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Helper function to get hex color based on status
const getStatusColorHex = (status) => {
  switch (status) {
    case 'New':
      return '#2563eb'; // blue-600
    case 'In Progress':
      return '#8b5cf6'; // purple-500
    case 'Qualified':
      return '#10b981'; // emerald-500
    case 'Not Interested':
      return '#ef4444'; // red-500
    case 'Closed':
      return '#6b7280'; // gray-500
    default:
      return '#64748b'; // slate-500
  }
};

export default LeadMobileView;
