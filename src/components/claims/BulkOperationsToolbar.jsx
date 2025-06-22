
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Trash2, 
  Download,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Flag
} from 'lucide-react';
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
import { useBulkUpdateClaimsBackend, useExportClaimsBackend } from '../../hooks/useClaimsBackend';
import { toast } from 'sonner';

const BulkOperationsToolbar = ({ 
  selectedClaims, 
  onClearSelection, 
  onBulkAction,
  agents = [] 
}) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const bulkUpdateMutation = useBulkUpdateClaimsBackend();
  const exportMutation = useExportClaimsBackend();

  const handleBulkAssign = async () => {
    if (!selectedAgent) {
      toast.error('Please select an agent');
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync({
        claimIds: selectedClaims,
        updateData: { assignedTo: selectedAgent }
      });
      onClearSelection();
      setSelectedAgent('');
    } catch (error) {
      console.error('Bulk assign error:', error);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync({
        claimIds: selectedClaims,
        updateData: { status: selectedStatus }
      });
      onClearSelection();
      setSelectedStatus('');
    } catch (error) {
      console.error('Bulk status update error:', error);
    }
  };

  const handleBulkPriorityUpdate = async () => {
    if (!selectedPriority) {
      toast.error('Please select a priority');
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync({
        claimIds: selectedClaims,
        updateData: { priority: selectedPriority }
      });
      onClearSelection();
      setSelectedPriority('');
    } catch (error) {
      console.error('Bulk priority update error:', error);
    }
  };

  const handleBulkExport = async () => {
    try {
      await exportMutation.mutateAsync({
        claimIds: selectedClaims
      });
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleBulkDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    onBulkAction('delete', selectedClaims);
    setShowDeleteDialog(false);
    onClearSelection();
  };

  if (selectedClaims.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedClaims.length} claims selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Agent Assignment */}
            <div className="flex items-center gap-2">
              <Select onValueChange={setSelectedAgent} value={selectedAgent}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Assign to agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleBulkAssign}
                disabled={!selectedAgent || bulkUpdateMutation.isLoading}
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Assign
              </Button>
            </div>

            {/* Status Update */}
            <div className="flex items-center gap-2">
              <Select onValueChange={setSelectedStatus} value={selectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="settled">Settled</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleBulkStatusUpdate}
                disabled={!selectedStatus || bulkUpdateMutation.isLoading}
                size="sm"
                variant="outline"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Update
              </Button>
            </div>

            {/* Priority Update */}
            <div className="flex items-center gap-2">
              <Select onValueChange={setSelectedPriority} value={selectedPriority}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleBulkPriorityUpdate}
                disabled={!selectedPriority || bulkUpdateMutation.isLoading}
                size="sm"
                variant="outline"
              >
                <Flag className="h-4 w-4 mr-2" />
                Set
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={handleBulkExport}
              disabled={exportMutation.isLoading}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Selected Claims
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedClaims.length} selected claims? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete Claims
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkOperationsToolbar;
