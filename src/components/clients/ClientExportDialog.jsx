
import React, { useState } from 'react';
import { Download, FileDown, FileSpreadsheet, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ClientExportDialog = ({ 
  selectedClients = [], 
  filteredData = [], 
  allData = [],
  searchTerm = '',
  selectedFilter = '',
  onExport 
}) => {
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState('all');
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [selectedFields, setSelectedFields] = useState([
    'name', 'email', 'contact', 'type', 'status', 'location'
  ]);

  const exportFields = [
    { id: 'name', label: 'Client Name' },
    { id: 'clientId', label: 'Client ID' },
    { id: 'email', label: 'Email' },
    { id: 'contact', label: 'Contact' },
    { id: 'type', label: 'Client Type' },
    { id: 'status', label: 'Status' },
    { id: 'location', label: 'Location' },
    { id: 'createdAt', label: 'Created Date' },
    { id: 'policies', label: 'Policy Count' }
  ];

  const handleExport = async () => {
    try {
      const exportData = {
        type: exportType,
        format,
        fields: selectedFields,
        dateRange: exportType === 'dateRange' ? dateRange : undefined,
        filters: exportType === 'filtered' ? { searchTerm, selectedFilter } : undefined,
        selectedIds: exportType === 'selected' ? selectedClients.map(c => c._id) : undefined
      };

      await onExport(exportData);
      setOpen(false);
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Export failed. Please try again.');
    }
  };

  const getExportCount = () => {
    switch (exportType) {
      case 'selected': return selectedClients.length;
      case 'filtered': return filteredData.length;
      case 'all': return allData.length;
      default: return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="inline-flex items-center">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Clients</DialogTitle>
          <DialogDescription>
            Choose your export options and download client data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Export Type Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Export Data</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="all"
                  name="exportType"
                  checked={exportType === 'all'}
                  onChange={() => setExportType('all')}
                  className="h-4 w-4"
                />
                <label htmlFor="all" className="text-sm flex items-center">
                  All Clients <Badge variant="outline" className="ml-2">{allData.length}</Badge>
                </label>
              </div>
              
              {(searchTerm || selectedFilter !== 'All') && (
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="filtered"
                    name="exportType"
                    checked={exportType === 'filtered'}
                    onChange={() => setExportType('filtered')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="filtered" className="text-sm flex items-center">
                    Filtered Results <Badge variant="outline" className="ml-2">{filteredData.length}</Badge>
                  </label>
                </div>
              )}
              
              {selectedClients.length > 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="selected"
                    name="exportType"
                    checked={exportType === 'selected'}
                    onChange={() => setExportType('selected')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="selected" className="text-sm flex items-center">
                    Selected Clients <Badge variant="outline" className="ml-2">{selectedClients.length}</Badge>
                  </label>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="dateRange"
                  name="exportType"
                  checked={exportType === 'dateRange'}
                  onChange={() => setExportType('dateRange')}
                  className="h-4 w-4"
                />
                <label htmlFor="dateRange" className="text-sm">Date Range</label>
              </div>
            </div>
          </div>

          {/* Date Range Picker */}
          {exportType === 'dateRange' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "PPP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Export Format</label>
            <div className="flex gap-2">
              <Button
                variant={format === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('csv')}
                className="flex items-center"
              >
                <FileDown className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button
                variant={format === 'excel' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('excel')}
                className="flex items-center"
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                Excel
              </Button>
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Select Fields</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {exportFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFields([...selectedFields, field.id]);
                      } else {
                        setSelectedFields(selectedFields.filter(f => f !== field.id));
                      }
                    }}
                  />
                  <label htmlFor={field.id} className="text-sm">{field.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-gray-500">
              {getExportCount()} clients will be exported
            </span>
            <Button onClick={handleExport} disabled={selectedFields.length === 0}>
              Export {format.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientExportDialog;
