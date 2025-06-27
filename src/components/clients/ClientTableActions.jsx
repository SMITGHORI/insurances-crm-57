
import React from 'react';
import { Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import Protected from '@/components/Protected';
import { usePermissions } from '@/hooks/usePermissions';

const ClientTableActions = ({ 
  client, 
  onEdit, 
  onDelete,
  canEdit = true,
  canDelete = false,
  userRole,
  userId 
}) => {
  const { hasPermission } = usePermissions();
  const isAssignedAgent = client.assignedAgentId === userId;
  const isAgent = userRole === 'agent';
  
  // Determine if actions are available based on role and assignment
  const canEditClient = canEdit && (!isAgent || isAssignedAgent);
  const canDeleteClient = canDelete && !isAgent && hasPermission('clients', 'delete');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Protected module="clients" action="edit" recordBranch={client.branch}>
          {canEditClient && (
            <DropdownMenuItem onClick={() => onEdit(client._id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Client
            </DropdownMenuItem>
          )}
        </Protected>
        
        <Protected module="clients" action="view" recordBranch={client.branch}>
          <DropdownMenuItem onClick={() => onView(`${client._id}/documents`)}>
            <FileText className="mr-2 h-4 w-4" />
            View Documents
          </DropdownMenuItem>
        </Protected>
        
        <Protected module="clients" action="delete" recordBranch={client.branch}>
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
        </Protected>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ClientTableActions;
