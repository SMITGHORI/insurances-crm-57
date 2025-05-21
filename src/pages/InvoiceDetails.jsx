
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Printer,
  Share,
  Download,
  Send,
  Edit,
  Trash2,
  Copy,
  FileText,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import InvoicePreview from '@/components/invoices/InvoicePreview';
import InvoiceHistory from '@/components/invoices/InvoiceHistory';
import { getSampleInvoices } from '@/utils/invoiceUtils';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    // Get invoice data from localStorage
    const storedInvoiceData = localStorage.getItem('invoicesData');
    let invoices = [];
    
    if (storedInvoiceData) {
      invoices = JSON.parse(storedInvoiceData);
    } else {
      // Use sample data
      invoices = getSampleInvoices();
      localStorage.setItem('invoicesData', JSON.stringify(invoices));
    }
    
    // Find the invoice by ID
    const foundInvoice = invoices.find(inv => inv.id.toString() === id);
    
    if (foundInvoice) {
      setInvoice(foundInvoice);
    } else {
      toast.error("Invoice not found");
      navigate('/invoices');
    }
    
    setLoading(false);
  }, [id, navigate]);
  
  const handleEditInvoice = () => {
    navigate(`/invoices/edit/${id}`);
  };
  
  const handleDeleteInvoice = () => {
    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      const storedInvoiceData = localStorage.getItem('invoicesData');
      
      if (storedInvoiceData) {
        const invoices = JSON.parse(storedInvoiceData);
        const updatedInvoices = invoices.filter(inv => inv.id.toString() !== id);
        
        localStorage.setItem('invoicesData', JSON.stringify(updatedInvoices));
        
        toast.success("Invoice deleted successfully");
        navigate('/invoices');
      }
    }
  };
  
  const handleDuplicateInvoice = () => {
    const storedInvoiceData = localStorage.getItem('invoicesData');
    
    if (storedInvoiceData && invoice) {
      const invoices = JSON.parse(storedInvoiceData);
      
      // Create a new invoice with same data but new ID and invoice number
      const newInvoice = {
        ...invoice,
        id: (Math.max(...invoices.map(inv => parseInt(inv.id))) + 1).toString(),
        invoiceNumber: `${invoice.invoiceNumber.split('-')[0]}-${invoice.invoiceNumber.split('-')[1]}-${
          (parseInt(invoice.invoiceNumber.split('-')[2]) + 1).toString().padStart(4, '0')
        }`,
        status: 'draft',
        history: [
          {
            action: "Duplicated",
            date: new Date().toISOString().split('T')[0],
            user: "Admin",
            details: `Duplicated from Invoice ${invoice.invoiceNumber}`
          }
        ]
      };
      
      const updatedInvoices = [...invoices, newInvoice];
      localStorage.setItem('invoicesData', JSON.stringify(updatedInvoices));
      
      toast.success("Invoice duplicated successfully");
      navigate(`/invoices/${newInvoice.id}`);
    }
  };
  
  const handleSendInvoice = () => {
    if (invoice) {
      // In a real app, this would send an email with the invoice
      // For now, we'll just update the invoice status and history
      
      const storedInvoiceData = localStorage.getItem('invoicesData');
      
      if (storedInvoiceData) {
        const invoices = JSON.parse(storedInvoiceData);
        const updatedInvoices = invoices.map(inv => {
          if (inv.id.toString() === id) {
            const updatedInvoice = {
              ...inv,
              status: 'sent',
              history: [
                ...inv.history,
                {
                  action: "Sent",
                  date: new Date().toISOString().split('T')[0],
                  user: "Admin",
                  details: "Invoice sent to client via email"
                }
              ]
            };
            
            setInvoice(updatedInvoice);
            return updatedInvoice;
          }
          return inv;
        });
        
        localStorage.setItem('invoicesData', JSON.stringify(updatedInvoices));
        
        toast.success("Invoice sent to client");
      }
    }
  };

  const handleShareToggle = () => {
    setShowShareMenu(!showShareMenu);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center">Invoice not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate('/invoices')}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoice {invoice.invoiceNumber}</h1>
          <p className="text-gray-600">
            {invoice.clientName} • {new Date(invoice.issueDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <div className="relative">
            <Button
              variant="outline"
              onClick={handleShareToggle}
              className="flex items-center"
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <Button 
                    variant="ghost" 
                    className="flex items-center w-full justify-start px-4 py-2 text-sm text-gray-700"
                    onClick={() => {
                      navigator.clipboard.writeText(`Invoice ${invoice.invoiceNumber} for ${invoice.clientName}`);
                      toast.success("Link copied to clipboard");
                      setShowShareMenu(false);
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy Link
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex items-center w-full justify-start px-4 py-2 text-sm text-gray-700"
                    onClick={() => {
                      window.open(`mailto:?subject=Invoice ${invoice.invoiceNumber}&body=Please find your invoice attached.`);
                      setShowShareMenu(false);
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" /> Email
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => {
              const invoiceElement = document.getElementById('invoice-container');
              if (invoiceElement) {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Invoice ${invoice.invoiceNumber}</title>
                      <style>
                        body { font-family: Arial, sans-serif; }
                        .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
                      </style>
                    </head>
                    <body>
                      <div class="invoice-container">
                        ${invoiceElement.innerHTML}
                      </div>
                    </body>
                  </html>
                `);
                printWindow.document.close();
                printWindow.print();
              }
            }}
            className="flex items-center"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              const invoiceElement = document.getElementById('invoice-container');
              if (invoiceElement) {
                const content = `
                  <html>
                    <head>
                      <title>Invoice ${invoice.invoiceNumber}</title>
                      <style>
                        body { font-family: Arial, sans-serif; }
                        .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
                      </style>
                    </head>
                    <body>
                      <div class="invoice-container">
                        ${invoiceElement.innerHTML}
                      </div>
                    </body>
                  </html>
                `;
                
                const blob = new Blob([content], { type: 'text/html' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `Invoice_${invoice.invoiceNumber}.html`;
                link.click();
              }
            }}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          
          {invoice.status === 'draft' && (
            <Button
              onClick={handleSendInvoice}
              className="flex items-center"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid grid-cols-2 w-full md:w-auto">
              <TabsTrigger value="preview" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Invoice Preview
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="mt-0">
              <Card>
                <CardContent className="py-6">
                  <InvoicePreview invoice={invoice} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <InvoiceHistory history={invoice.history} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Invoice Actions</h3>
              <div className="space-y-4">
                <Button 
                  className="w-full justify-start"
                  onClick={handleEditInvoice}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Invoice
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleDuplicateInvoice}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleDeleteInvoice}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Client Details</h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{invoice.clientName}</p>
                <p className="text-gray-700">{invoice.clientEmail}</p>
                <p className="text-gray-700">{invoice.clientPhone}</p>
                <p className="text-gray-700">{invoice.clientAddress}</p>
                {invoice.customFields?.["GST Number"] && (
                  <p className="text-gray-700">GST: {invoice.customFields["GST Number"]}</p>
                )}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={() => navigate(`/clients/${invoice.clientId}`)}
                >
                  View Client Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {invoice.policyNumber && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Policy Details</h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Policy: {invoice.policyNumber}</p>
                  <p className="text-gray-700">Type: {invoice.insuranceType}</p>
                  <p className="text-gray-700">Period: {invoice.premiumPeriod}</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={() => invoice.policyId && navigate(`/policies/${invoice.policyId}`)}
                  >
                    View Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
