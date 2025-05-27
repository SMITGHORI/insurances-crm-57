
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Printer,
  Share,
  Download,
  Edit,
  Trash2,
  Copy,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import InvoicePreview from '@/components/invoices/InvoicePreview';
import InvoiceHistory from '@/components/invoices/InvoiceHistory';
import { getSampleInvoices } from '@/utils/invoiceUtils';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const storedInvoiceData = localStorage.getItem('invoicesData');
    let invoices = [];
    
    if (storedInvoiceData) {
      invoices = JSON.parse(storedInvoiceData);
    } else {
      invoices = getSampleInvoices();
      localStorage.setItem('invoicesData', JSON.stringify(invoices));
    }
    
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

  const handleShare = () => {
    if (invoice) {
      const invoiceText = `Invoice ${invoice.invoiceNumber} for ${invoice.clientName}
Amount: ₹${invoice.total}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

Client Details:
${invoice.clientName}
${invoice.clientPhone}
${invoice.clientEmail}`;

      const emailSubject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} - ${invoice.clientName}`);
      const emailBody = encodeURIComponent(invoiceText);
      const emailUrl = `mailto:${invoice.clientEmail}?subject=${emailSubject}&body=${emailBody}`;
      
      const whatsappText = encodeURIComponent(invoiceText);
      const whatsappPhone = invoice.clientPhone?.replace(/[^\d]/g, '');
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappText}`;
      
      window.open(emailUrl, '_blank');
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);

      toast.success("Email and WhatsApp opened with client details");
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleDownload = () => {
    // This will be handled by the InvoicePreview component
    toast.success("Download initiated");
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
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center"
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InvoicePreview invoice={invoice} />
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

          {invoice.history && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Invoice History</h3>
                <InvoiceHistory history={invoice.history} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
