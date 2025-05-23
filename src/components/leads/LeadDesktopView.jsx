
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
import { 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  Edit, 
  ArrowRight,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { getStatusColor, getPriorityColor } from './LeadUtils';

const LeadDesktopView = ({ leads, onViewDetails, onEdit, onDelete, navigate }) => {
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
              <TableCell colSpan={9} className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-gray-100 p-3 rounded-full mb-2">
                    <AlertCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-700">No leads found</h3>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or create a new lead</p>
                </div>
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
                      onClick={() => onEdit(lead.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(lead.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewDetails(lead.id)}
                      className="text-blue-500 hover:text-blue-700"
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
