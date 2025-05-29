import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Eye, Edit, Trash2, FileText, Download, ArrowUpDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableSkeleton, CardSkeleton } from '@/components/ui/professional-skeleton';

const AgentTable = ({ 
  agents, 
  onViewAgent, 
  onEditAgent, 
  onDeleteAgent, 
  sortField, 
  sortDirection, 
  onSort, 
  isMobile, 
  isLoading, 
  isEmpty, 
  currentPage, 
  totalPages, 
  totalItems, 
  onPageChange, 
  isDeleting, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  handleExport 
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const renderSortIcon = (field) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return null;
  };

  const getSortableHeaderProps = (field, label) => {
    return {
      onClick: () => onSort(field),
      className: "cursor-pointer hover:bg-gray-50",
      children: (
        <div className="flex items-center">
          {label}
          {renderSortIcon(field)}
          {!renderSortIcon(field) && (
            <ArrowUpDown size={14} className="ml-1 text-gray-300" />
          )}
        </div>
      ),
    };
  };

  // Handle loading state with professional skeleton
  if (isLoading) {
    return isMobile ? <CardSkeleton /> : <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <Input
          type="text"
          placeholder="Search agents..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full sm:w-auto flex-1"
        />
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead {...getSortableHeaderProps('name', 'Name')} />
              <TableHead {...getSortableHeaderProps('email', 'Email')} />
              <TableHead {...getSortableHeaderProps('phone', 'Phone')} />
              <TableHead {...getSortableHeaderProps('status', 'Status')} />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {isLoading ? 'Loading agents...' : 'No agents found.'}
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent) => (
                <TableRow key={agent._id} className="hover:bg-gray-50">
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>{agent.phone}</TableCell>
                  <TableCell>
                    {getStatusBadge(agent.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewAgent(agent._id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditAgent(agent._id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {agent.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteAgent(agent._id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalItems > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTable;
