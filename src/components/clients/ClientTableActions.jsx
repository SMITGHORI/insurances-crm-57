
import React from 'react';
import { Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

const ClientTableActions = ({ 
  client, 
  onView, 
  onEdit, 
  onDelete,
  canEdit = true,
  canDelete = false,
  userRole,
  userId 
}) => {
  const isAssignedAgent = client.assignedAgentId === userId;
  const isAgent = userRole === 'agent';
  
  // Determine if actions are available based on role and assignment
  const canEditClient = canEdit && (!isAgent || isAssignedAgent);
  const canDeleteClient = canDelete && !isAgent;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(client._id)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        {canEditClient && (
          <DropdownMenuItem onClick={() => onEdit(client._id)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Client
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => onView(`${client._id}/documents`)}>
          <FileText className="mr-2 h-4 w-4" />
          View Documents
        </DropdownMenuItem>
        
        {canDeleteClient && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(client._id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Client
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ClientTableActions;
