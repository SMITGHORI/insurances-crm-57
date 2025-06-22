
import React from 'react';
import { Edit, Trash2, Phone, Mail, User, Calendar, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const LeadMobileView = ({ 
  leads, 
  onViewDetails, 
  onEdit, 
  onDelete 
}) => {
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (leads.length === 0) {
    return (
      <Card className="mt-4 animate-fade-in">
        <CardContent className="pt-6 text-center text-gray-500">
          No leads found matching your criteria
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {leads.map((lead) => (
        <Card 
          key={lead.id} 
          className="overflow-hidden hover:shadow-md transition-shadow animate-fade-in cursor-pointer"
          onClick={() => onViewDetails(lead.id)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{lead.name}</div>
                  <div className="text-xs text-gray-500">ID: {lead.id}</div>
                </div>
              </div>
              <div className="flex space-x-1">
                <Badge className={getStatusBadgeClass(lead.status)}>
                  {lead.status}
                </Badge>
                <Badge className={getPriorityBadgeClass(lead.priority)}>
                  {lead.priority}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-2 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                {lead.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                {lead.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Target className="h-4 w-4 mr-2 text-gray-400" />
                {lead.product} (via {lead.source})
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                Assigned to: {lead.assignedTo}
              </div>
              {lead.nextFollowUp && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  Next follow-up: {lead.nextFollowUp}
                </div>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(lead.id);
                }}
              >
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-red-600 hover:text-red-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(lead.id);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeadMobileView;
