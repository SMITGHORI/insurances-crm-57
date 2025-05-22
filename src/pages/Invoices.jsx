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
import { Card } from "@/components/ui/card";
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
import InvoicesMobileView from '@/components/invoices/InvoicesMobileView';
import { getSampleInvoices, getStatusBadgeClass, formatInvoiceDateForDisplay } from '@/utils/invoiceUtils';
import { formatCurrency } from '@/lib/utils';
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

  const toggleFilters = () => {
    setShowFilters(!showFilters);
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
            <InvoiceFilters filterParams={filterParams} setFilterParams={setFilterParams} />
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
                <FileEdit className="mr-2 h-4 w-4" />
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

          {/* Modified this part to use a proper TabsList for mobile extra tabs */}
          {isMobile && (
            <TabsList className="flex gap-2 mb-4">
              <TabsTrigger value="drafts" className="flex-1 flex items-center justify-center">
                <FileEdit className="mr-2 h-4 w-4" />
                Drafts
              </TabsTrigger>
              <TabsTrigger value="overdue" className="flex-1 flex items-center justify-center">
                <Calendar className="mr-2 h-4 w-4" />
                Overdue
              </TabsTrigger>
            </TabsList>
          )}

          {/* Add TabsContent component that was missing */}
          <TabsContent value="all">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : isMobile ? (
              <InvoicesMobileView invoices={filteredInvoices} />
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
          </TabsContent>
          
          <TabsContent value="drafts">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : isMobile ? (
              <InvoicesMobileView invoices={filteredInvoices.filter(invoice => invoice.status === 'draft')} />
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
                    {filteredInvoices.filter(invoice => invoice.status === 'draft').length > 0 ? (
                      filteredInvoices.filter(invoice => invoice.status === 'draft').map((invoice) => (
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
          </TabsContent>
          
          <TabsContent value="pending">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : isMobile ? (
              <InvoicesMobileView invoices={filteredInvoices.filter(invoice => invoice.status === 'sent')} />
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
                    {filteredInvoices.filter(invoice => invoice.status === 'sent').length > 0 ? (
                      filteredInvoices.filter(invoice => invoice.status === 'sent').map((invoice) => (
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
          </TabsContent>
          
          <TabsContent value="paid">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : isMobile ? (
              <InvoicesMobileView invoices={filteredInvoices.filter(invoice => invoice.status === 'paid')} />
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
                    {filteredInvoices.filter(invoice => invoice.status === 'paid').length > 0 ? (
                      filteredInvoices.filter(invoice => invoice.status === 'paid').map((invoice) => (
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
          </TabsContent>
          
          <TabsContent value="overdue">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : isMobile ? (
              <InvoicesMobileView invoices={filteredInvoices.filter(invoice => invoice.status === 'overdue')} />
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
                    {filteredInvoices.filter(invoice => invoice.status === 'overdue').length > 0 ? (
                      filteredInvoices.filter(invoice => invoice.status === 'overdue').map((invoice) => (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Invoices;
