
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Plus, 
  Search,
  Calendar,
  User,
  Building,
  FileEdit,
  Link,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';
import { getSampleInvoices, getStatusBadgeClass, formatInvoiceDateForDisplay } from '@/utils/invoiceUtils';
import { formatCurrency } from '@/lib/utils';

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    agentId: 'all',
    clientId: 'all',
    dateRange: 'all',
    policyType: 'all'
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

  // Filter invoices based on search query, active tab and filter params
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
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
    
    // Filter by additional filters
    let matchesFilters = true;
    if (filterParams.status !== 'all') {
      matchesFilters = matchesFilters && invoice.status === filterParams.status;
    }
    if (filterParams.agentId !== 'all') {
      matchesFilters = matchesFilters && invoice.agentId === filterParams.agentId;
    }
    if (filterParams.clientId !== 'all') {
      matchesFilters = matchesFilters && invoice.clientId === filterParams.clientId;
    }
    if (filterParams.policyType !== 'all') {
      matchesFilters = matchesFilters && invoice.insuranceType === filterParams.policyType;
    }
    if (filterParams.dateRange !== 'all') {
      // Date range logic would go here
      // For now, we'll just return true
      matchesFilters = matchesFilters && true;
    }
    
    return matchesSearch && matchesTab && matchesFilters;
  });

  const handleCreateInvoice = () => {
    navigate('/invoices/create');
  };

  const handleViewInvoice = (id) => {
    navigate(`/invoices/${id}`);
  };

  const handleViewClient = (e, clientId) => {
    e.stopPropagation(); // Prevent triggering the row click
    navigate(`/clients/${clientId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Invoice Management</h1>
        <Button 
          onClick={handleCreateInvoice}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="mr-1 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search invoices by number, client, policy or agent..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('filterSection').classList.toggle('hidden')}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div id="filterSection" className="hidden mb-4">
          <InvoiceFilters filterParams={filterParams} setFilterParams={setFilterParams} />
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              All Invoices
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center">
              <FileEdit className="mr-2 h-4 w-4" />
              Drafts
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="paid" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Paid
            </TabsTrigger>
            <TabsTrigger value="overdue" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Overdue
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Policy</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewInvoice(invoice.id)}
                  >
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div 
                        className="flex items-center text-primary hover:underline cursor-pointer"
                        onClick={(e) => handleViewClient(e, invoice.clientId)}
                      >
                        <User className="h-4 w-4 mr-1" />
                        {invoice.clientName}
                      </div>
                    </TableCell>
                    <TableCell>
                      {invoice.policyNumber ? (
                        <div className="flex items-center">
                          <Link 
                            className="h-4 w-4 mr-1 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/policies/${invoice.policyId}`);
                            }}
                          />
                          {invoice.policyNumber}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatInvoiceDateForDisplay(invoice.issueDate)}</TableCell>
                    <TableCell>{formatInvoiceDateForDisplay(invoice.dueDate)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {invoice.agentName ? (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {invoice.agentName}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Invoices;
