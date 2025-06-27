
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
import { PermissionTooltip } from '@/components/ui/permission-tooltip';
import { usePermissions } from '@/hooks/usePermissions';

const ClientTableActions = ({ 
  client, 
  onEdit, 
  onDelete,
  onView,
  canEdit = true,
  canDelete = false,
  userRole,
  userId 
}) => {
  const { hasPermission } = usePermissions();
  const isAssignedAgent = client.assignedAgentId === userId;
  const isAgent = userRole === 'agent';
  
  // Determine if actions are available based on role and assignment
  const canEditClient = canEdit && (!isAgent || isAssignedAgent) && hasPermission('clients', 'edit');
  const canDeleteClient = canDelete && !isAgent && hasPermission('clients', 'delete');
  const canViewDocuments = hasPermission('clients', 'view');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Protected module="clients" action="edit" recordBranch={client.branch} fallback={null}>
          <PermissionTooltip 
            module="clients" 
            action="edit" 
            disabled={!canEditClient}
            message={!canEditClient && isAgent ? "You can only edit clients assigned to you" : undefined}
          >
            <DropdownMenuItem 
              onClick={() => canEditClient && onEdit(client._id)}
              disabled={!canEditClient}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Client
            </DropdownMenuItem>
          </PermissionTooltip>
        </Protected>
        
        <Protected module="clients" action="view" recordBranch={client.branch} fallback={null}>
          <PermissionTooltip 
            module="clients" 
            action="view" 
            disabled={!canViewDocuments}
          >
            <DropdownMenuItem 
              onClick={() => canViewDocuments && onView(`${client._id}/documents`)}
              disabled={!canViewDocuments}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Documents
            </DropdownMenuItem>
          </PermissionTooltip>
        </Protected>
        
        <Protected module="clients" action="delete" recordBranch={client.branch} fallback={null}>
          <PermissionTooltip 
            module="clients" 
            action="delete" 
            disabled={!canDeleteClient}
          >
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => canDeleteClient && onDelete(client._id)}
                className="text-red-600 hover:text-red-700"
                disabled={!canDeleteClient}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Client
              </DropdownMenuItem>
            </>
          </PermissionTooltip>
        </Protected>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ClientTableActions;
