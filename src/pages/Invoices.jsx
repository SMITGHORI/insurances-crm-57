import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvoicesTable from '@/components/invoices/InvoicesTable';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PaymentReminderManager from '@/components/invoices/PaymentReminderManager';

const Invoices = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    dateRange: 'all',
    clientId: 'all',
    searchTerm: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdDate',
    direction: 'desc'
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demonstration
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateInvoice = () => {
    navigate('/invoices/create');
  };
  
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  const updateActiveFilters = (filterName, value) => {
    setActiveFilters(prev => {
      if (!value) {
        const newFilters = { ...prev };
        delete newFilters[filterName];
        return newFilters;
      } else {
        return { ...prev, [filterName]: value };
      }
    });
  };
  
  const clearAllFilters = () => {
    setFilterParams({
      status: 'all',
      dateRange: 'all',
      clientId: 'all',
      searchTerm: ''
    });
    setActiveFilters({});
  };
  
  const handleExportInvoices = (invoices) => {
    // In a real app, this would generate a CSV/Excel file
    toast.success(`Exported ${invoices.length} invoices to CSV`);
  };

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track all your invoices
          </p>
        </div>
        <Button onClick={() => navigate('/invoices/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="reminders">Payment Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="mb-4 sm:mb-6 border-0 shadow-sm">
            <InvoiceFilters 
              filterParams={filterParams} 
              setFilterParams={setFilterParams}
              activeFilters={activeFilters}
              updateActiveFilters={updateActiveFilters}
              clearAllFilters={clearAllFilters}
            />
          </Card>
          
          <div className="max-w-full overflow-x-hidden mb-20 sm:mb-0">
            <InvoicesTable 
              filterParams={filterParams} 
              sortConfig={sortConfig}
              handleSort={handleSort}
              handleExport={handleExportInvoices}
            />
          </div>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {/* Draft invoices */}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {/* Sent invoices */}
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <PaymentReminderManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invoices;
