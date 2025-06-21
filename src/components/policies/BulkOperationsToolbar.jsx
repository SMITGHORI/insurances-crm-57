
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
  AlertTriangle
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
import { useBulkPolicyOperations, usePolicyExport } from '../../hooks/usePolicyFeatures';
import { toast } from 'sonner';

const BulkOperationsToolbar = ({ 
  selectedPolicies, 
  onClearSelection, 
  onBulkAction,
  agents = [] 
}) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { bulkAssign, isLoading } = useBulkPolicyOperations();
  const exportMutation = usePolicyExport();

  const handleBulkAssign = async () => {
    if (!selectedAgent) {
      toast.error('Please select an agent');
      return;
    }

    try {
      await bulkAssign({
        policyIds: selectedPolicies,
        agentId: selectedAgent
      });
      onClearSelection();
      setSelectedAgent('');
    } catch (error) {
      console.error('Bulk assign error:', error);
    }
  };

  const handleBulkExport = async () => {
    try {
      await exportMutation.mutateAsync({
        policyIds: selectedPolicies
      });
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleBulkDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    onBulkAction('delete', selectedPolicies);
    setShowDeleteDialog(false);
    onClearSelection();
  };

  if (selectedPolicies.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedPolicies.length} policies selected
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
            <div className="flex items-center gap-2">
              <Select onValueChange={setSelectedAgent} value={selectedAgent}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select agent to assign" />
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
                disabled={!selectedAgent || isLoading}
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Assign
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
              Delete Selected Policies
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedPolicies.length} selected policies? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete Policies
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkOperationsToolbar;
