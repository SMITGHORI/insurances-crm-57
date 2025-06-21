
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Calendar } from 'lucide-react';
import { usePolicyExport } from '../../hooks/usePolicyFeatures';

const PolicyExportDialog = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    fields: {
      policyNumber: true,
      clientName: true,
      type: true,
      status: true,
      premium: true,
      sumAssured: true,
      startDate: true,
      endDate: true,
      insuranceCompany: false,
      agentName: false,
      commission: false,
      paymentHistory: false
    },
    filters: {
      startDate: '',
      endDate: '',
      status: '',
      type: ''
    }
  });

  const exportMutation = usePolicyExport();

  const handleFieldChange = (field, checked) => {
    setExportConfig(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: checked
      }
    }));
  };

  const handleFilterChange = (filter, value) => {
    setExportConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filter]: value
      }
    }));
  };

  const handleExport = async () => {
    try {
      const selectedFields = Object.keys(exportConfig.fields)
        .filter(field => exportConfig.fields[field]);
      
      const exportData = {
        ...exportConfig.filters,
        fields: selectedFields
      };

      await exportMutation.mutateAsync(exportData);
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const fieldOptions = [
    { key: 'policyNumber', label: 'Policy Number' },
    { key: 'clientName', label: 'Client Name' },
    { key: 'type', label: 'Policy Type' },
    { key: 'status', label: 'Status' },
    { key: 'premium', label: 'Premium' },
    { key: 'sumAssured', label: 'Sum Assured' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'insuranceCompany', label: 'Insurance Company' },
    { key: 'agentName', label: 'Agent Name' },
    { key: 'commission', label: 'Commission Details' },
    { key: 'paymentHistory', label: 'Payment History' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Policies</DialogTitle>
          <DialogDescription>
            Configure your export settings and select the fields to include.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select 
              value={exportConfig.format} 
              onValueChange={(value) => setExportConfig(prev => ({...prev, format: value}))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="start-date"
                  type="date"
                  className="pl-10"
                  value={exportConfig.filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="end-date"
                  type="date"
                  className="pl-10"
                  value={exportConfig.filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Status and Type Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Policy Status</Label>
              <Select 
                value={exportConfig.filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="In Force">In Force</SelectItem>
                  <SelectItem value="Lapsed">Lapsed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Matured">Matured</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Policy Type</Label>
              <Select 
                value={exportConfig.filters.type} 
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                  <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                  <SelectItem value="Motor Insurance">Motor Insurance</SelectItem>
                  <SelectItem value="Home Insurance">Home Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <Label>Select Fields to Export</Label>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-md p-3">
              {fieldOptions.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={exportConfig.fields[field.key]}
                    onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
                  />
                  <Label htmlFor={field.key} className="text-sm font-normal">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={exportMutation.isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            {exportMutation.isLoading ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyExportDialog;
