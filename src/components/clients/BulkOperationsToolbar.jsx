
import React, { useState } from 'react';
import { Users, UserCheck, Trash, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const BulkOperationsToolbar = ({ 
  selectedClients = [], 
  onClearSelection, 
  onBulkAssign, 
  onBulkStatusUpdate, 
  onBulkDelete, 
  onBulkExport 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  if (selectedClients.length === 0) {
    return null;
  }

  const handleBulkDelete = async () => {
    try {
      await onBulkDelete(selectedClients.map(c => c._id || c.id));
      setShowDeleteDialog(false);
      onClearSelection();
      toast.success(`${selectedClients.length} clients deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete clients');
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await onBulkStatusUpdate(selectedClients.map(c => c._id || c.id), status);
      onClearSelection();
      toast.success(`${selectedClients.length} clients updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update client status');
    }
  };

  const handleBulkExport = () => {
    onBulkExport(selectedClients);
    toast.success('Export started for selected clients');
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {selectedClients.length} clients selected
            </span>
            <Badge variant="outline" className="bg-white">
              {selectedClients.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear selection
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate('Active')}
            className="flex items-center"
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Activate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkExport}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowAssignDialog(true)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Assign to Agent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate('Inactive')}>
                <Users className="h-4 w-4 mr-2" />
                Mark as Inactive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate('Pending')}>
                <Users className="h-4 w-4 mr-2" />
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Clients</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedClients.length} selected clients? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete {selectedClients.length} Clients
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkOperationsToolbar;
