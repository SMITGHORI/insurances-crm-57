
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Plus, 
  Search,
  Calendar,
  Filter
} from 'lucide-react';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';
import InvoicesMobileView from '@/components/invoices/InvoicesMobileView';
import InvoicesTable from '@/components/invoices/InvoicesTable';
import { getSampleInvoices } from '@/utils/invoiceUtils';
import { useIsMobile } from '@/hooks/use-mobile';

const Invoices = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    agentId: 'all',
    clientId: 'all',
    dateRange: 'all',
    policyType: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'issueDate',
    direction: 'desc'
  });

  // Get invoice data from localStorage or sample data
  useEffect(() => {
    setLoading(true);
    
    const storedInvoiceData = localStorage.getItem('invoicesData');
    let invoicesList = [];
    
    if (storedInvoiceData) {
      invoicesList = JSON.parse(storedInvoiceData);
    } else {
      // Use sample data as fallback
      invoicesList = getSampleInvoices();
      
      // Save sample data to localStorage
      localStorage.setItem('invoicesData', JSON.stringify(invoicesList));
    }
    
    setInvoices(invoicesList);
    setLoading(false);
  }, []);

  // Filter invoices based on search query and active tab
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      searchQuery === '' ||
      (invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (invoice.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (invoice.policyNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (invoice.agentName?.toLowerCase().includes(searchQuery.toLowerCase()) || '');
    
    // Filter by status tab
    let matchesTab = true;
    if (activeTab === 'paid') {
      matchesTab = invoice.status === 'paid';
    } else if (activeTab === 'pending') {
      matchesTab = invoice.status === 'sent';
    } else if (activeTab === 'overdue') {
      matchesTab = invoice.status === 'overdue';
    } else if (activeTab === 'drafts') {
      matchesTab = invoice.status === 'draft';
    }
    
    return matchesSearch && matchesTab;
  });

  const handleCreateInvoice = () => {
    navigate('/invoices/create');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const clearAllFilters = () => {
    setFilterParams({
      status: 'all',
      agentId: 'all',
      clientId: 'all',
      dateRange: 'all',
      policyType: 'all'
    });
  };
  
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Invoice Management</h1>
        <Button 
          onClick={handleCreateInvoice}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> {isMobile ? 'Create' : 'Create Invoice'}
        </Button>
      </div>

      <Card className="mb-4 p-3 sm:p-4 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search invoices..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={toggleFilters}
            className="sm:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" /> Filters {showFilters ? '↑' : '↓'}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-3 sm:mt-4 animate-fade-in">
            <InvoiceFilters 
              filterParams={filterParams} 
              setFilterParams={setFilterParams}
              clearAllFilters={clearAllFilters} 
            />
          </div>
        )}
      </Card>

      <div className="mb-4">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-5'} mb-4`}>
            <TabsTrigger value="all" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">All</span> Invoices
            </TabsTrigger>
            {!isMobile && (
              <TabsTrigger value="drafts" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Drafts
              </TabsTrigger>
            )}
            <TabsTrigger value="pending" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="paid" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Paid
            </TabsTrigger>
            {!isMobile && (
              <TabsTrigger value="overdue" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Overdue
              </TabsTrigger>
            )}
          </TabsList>

          {/* Mobile extra tabs */}
          {isMobile && (
            <TabsList className="flex gap-2 mb-4">
              <TabsTrigger value="drafts" className="flex-1 flex items-center justify-center">
                <FileText className="mr-2 h-4 w-4" />
                Drafts
              </TabsTrigger>
              <TabsTrigger value="overdue" className="flex-1 flex items-center justify-center">
                <Calendar className="mr-2 h-4 w-4" />
                Overdue
              </TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent value="all">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : isMobile ? (
              <InvoicesMobileView invoices={filteredInvoices} />
            ) : (
              <InvoicesTable 
                filterParams={filterParams}
                sortConfig={sortConfig}
                handleSort={handleSort}
              />
            )}
          </TabsContent>
          
          {/* Status-specific tabs will display filtered content */}
          <TabsContent value="drafts">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : isMobile ? (
              <InvoicesMobileView invoices={filteredInvoices.filter(invoice => invoice.status === 'draft')} />
            ) : (
              <InvoicesTable 
                filterParams={{...filterParams, status: 'draft'}}
                sortConfig={sortConfig}
                handleSort={handleSort}
              />
            )}
          </TabsContent>
          
          <TabsContent value="pending">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : isMobile ? (
              <InvoicesMobileView invoices={filteredInvoices.filter(invoice => invoice.status === 'sent')} />
            ) : (
              <InvoicesTable 
                filterParams={{...filterParams, status: 'sent'}}
                sortConfig={sortConfig}
                handleSort={handleSort}
              />
            )}
          </TabsContent>
          
          <TabsContent value="paid">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : isMobile ? (
              <InvoicesMobileView invoices={filteredInvoices.filter(invoice => invoice.status === 'paid')} />
            ) : (
              <InvoicesTable 
                filterParams={{...filterParams, status: 'paid'}}
                sortConfig={sortConfig}
                handleSort={handleSort}
              />
            )}
          </TabsContent>
          
          <TabsContent value="overdue">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : isMobile ? (
              <InvoicesMobileView invoices={filteredInvoices.filter(invoice => invoice.status === 'overdue')} />
            ) : (
              <InvoicesTable 
                filterParams={{...filterParams, status: 'overdue'}}
                sortConfig={sortConfig}
                handleSort={handleSort}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Invoices;
