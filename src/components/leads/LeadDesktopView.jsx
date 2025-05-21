
import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, User, Calendar, Edit, ArrowRight } from 'lucide-react';
import { getStatusColor, getPriorityColor } from './LeadUtils';

const LeadDesktopView = ({ leads, onViewDetails, navigate }) => {
  return (
    <div className="overflow-x-auto w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Next Follow-up</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{lead.id}</TableCell>
                <TableCell>
                  <span className="line-clamp-1">{lead.name}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1 text-xs">
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1 shrink-0" /> 
                      <span className="truncate">{lead.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1 shrink-0" /> 
                      <span className="truncate">{lead.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{lead.product}</span>
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(lead.status)} text-white`}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1 shrink-0" /> 
                    <span className="truncate max-w-[100px]">{lead.assignedTo}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 shrink-0" /> 
                    <span className="truncate">{lead.nextFollowUp}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={getPriorityColor(lead.priority)}>{lead.priority}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(`/leads/edit/${lead.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewDetails(lead.id)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadDesktopView;
