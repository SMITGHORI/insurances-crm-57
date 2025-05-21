
import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatInvoiceDateForDisplay } from '@/utils/invoiceUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileImage, Image, Layout, PaintBucket } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const InvoicePreview = ({ invoice }) => {
  const [template, setTemplate] = useState(invoice.layoutTemplate || 'standard');
  const [accentColor, setAccentColor] = useState('#1a56db');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [activeCustomizeTab, setActiveCustomizeTab] = useState('layout');
  const [logoUrl, setLogoUrl] = useState('/placeholder.svg');
  
  // Get total paid amount if payment details exist
  const getPaidAmount = () => {
    return invoice.status === 'paid' ? invoice.total : 0;
  };
  
  // Calculate remaining balance
  const getRemainingBalance = () => {
    const paidAmount = getPaidAmount();
    return invoice.total - paidAmount;
  };
  
  const templates = {
    standard: {
      className: "bg-white max-w-4xl mx-auto p-8 rounded shadow",
      headerClass: "border-b pb-8",
      titleClass: "text-2xl font-bold",
      contentClass: "",
      tableClass: "mt-6",
      footerClass: "mt-8 pt-8 border-t",
    },
    corporate: {
      className: "bg-white max-w-4xl mx-auto p-8 rounded-lg shadow-md",
      headerClass: `bg-[${accentColor}] -m-8 mb-8 p-8 text-white rounded-t-lg`,
      titleClass: "text-3xl font-bold",
      contentClass: "grid grid-cols-1 md:grid-cols-2 gap-8",
      tableClass: "mt-8",
      footerClass: "mt-8 pt-8 border-t flex justify-between",
    },
    minimal: {
      className: "bg-white max-w-4xl mx-auto p-8",
      headerClass: "border-b pb-4",
      titleClass: "text-xl font-medium",
      contentClass: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-4",
      tableClass: "mt-6",
      footerClass: "mt-4 pt-4 border-t text-sm",
    },
    modern: {
      className: "bg-white max-w-4xl mx-auto p-8 rounded-xl shadow-lg",
      headerClass: "flex flex-col md:flex-row justify-between items-start md:items-center pb-8",
      titleClass: "text-3xl font-bold",
      contentClass: "grid grid-cols-1 md:grid-cols-2 gap-8 mt-8",
      tableClass: "mt-10",
      footerClass: "mt-10 pt-6 border-t flex flex-col md:flex-row justify-between",
    },
    elegant: {
      className: "bg-white max-w-4xl mx-auto p-12 rounded shadow-md border",
      headerClass: "text-center border-b pb-8 mb-8",
      titleClass: "text-4xl font-light",
      contentClass: "grid grid-cols-1 md:grid-cols-2 gap-12",
      tableClass: "mt-12",
      footerClass: "mt-12 pt-8 border-t text-center",
    }
  };
  
  const currentTemplate = templates[template] || templates.standard;
  
  const handleTemplateChange = (newTemplate) => {
    setTemplate(newTemplate);
  };
  
  const handleColorChange = (color) => {
    setAccentColor(color);
  };
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => setShowCustomizer(!showCustomizer)}
          className="flex items-center"
        >
          <PaintBucket className="mr-2 h-4 w-4" />
          {showCustomizer ? 'Hide Customizer' : 'Customize Layout'}
        </Button>
      </div>
      
      {showCustomizer && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <Tabs defaultValue="layout" value={activeCustomizeTab} onValueChange={setActiveCustomizeTab}>
              <TabsList className="mb-4 grid grid-cols-2 w-full md:w-auto">
                <TabsTrigger value="layout" className="flex items-center">
                  <Layout className="mr-2 h-4 w-4" />
                  Layout Options
                </TabsTrigger>
                <TabsTrigger value="branding" className="flex items-center">
                  <Image className="mr-2 h-4 w-4" />
                  Branding
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="layout" className="space-y-4">
                <h3 className="font-medium mb-3">Template Selection</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <Button 
                    variant={template === 'standard' ? 'default' : 'outline'}
                    onClick={() => handleTemplateChange('standard')}
                    className="h-auto py-2"
                  >
                    Standard
                  </Button>
                  <Button 
                    variant={template === 'corporate' ? 'default' : 'outline'}
                    onClick={() => handleTemplateChange('corporate')}
                    className="h-auto py-2"
                  >
                    Corporate
                  </Button>
                  <Button 
                    variant={template === 'minimal' ? 'default' : 'outline'}
                    onClick={() => handleTemplateChange('minimal')}
                    className="h-auto py-2"
                  >
                    Minimal
                  </Button>
                  <Button 
                    variant={template === 'modern' ? 'default' : 'outline'}
                    onClick={() => handleTemplateChange('modern')}
                    className="h-auto py-2"
                  >
                    Modern
                  </Button>
                  <Button 
                    variant={template === 'elegant' ? 'default' : 'outline'}
                    onClick={() => handleTemplateChange('elegant')}
                    className="h-auto py-2"
                  >
                    Elegant
                  </Button>
                </div>
                
                <h3 className="font-medium mb-3">Accent Color</h3>
                <div className="flex flex-wrap gap-2">
                  {['#1a56db', '#047857', '#b91c1c', '#7c3aed', '#0369a1', '#0f766e', '#ea384c', '#9b87f5', '#f97316', '#33C3F0'].map(color => (
                    <div
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer border-2 ${accentColor === color ? 'border-black' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="branding" className="space-y-4">
                <h3 className="font-medium mb-3">Company Logo</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center border rounded-md p-4 bg-gray-50">
                    <img 
                      src={logoUrl} 
                      alt="Company Logo" 
                      className="h-20 max-w-full object-contain"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md cursor-pointer">
                      <FileImage className="h-4 w-4" />
                      <span>Upload Logo</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="sr-only" 
                        onChange={handleLogoChange}
                      />
                    </label>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setLogoUrl('/placeholder.svg')}
                    >
                      Reset Logo
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      <div id="invoice-container" className={currentTemplate.className}>
        {/* Header */}
        <div className={currentTemplate.headerClass} style={template === 'corporate' ? { backgroundColor: accentColor } : {}}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={currentTemplate.titleClass} style={template === 'elegant' ? { color: accentColor } : {}}>INVOICE</h1>
              <p className={`text-lg font-semibold ${template === 'corporate' ? 'text-white' : 'text-gray-700'} mt-1`}>
                #{invoice.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end mb-2">
                <img 
                  src={logoUrl} 
                  alt="Company Logo"
                  className="h-12"
                />
              </div>
              <div className={template === 'corporate' ? 'text-white' : 'text-gray-600'}>
                <p>Ambition Insurance</p>
                <p>123 Insurance St, Mumbai 400001</p>
                <p>contact@ambitioninsurance.com</p>
              </div>
            </div>
          </div>
          
          {template === 'standard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <h3 className="font-bold text-gray-700 mb-2">Bill To:</h3>
                <p className="font-medium">{invoice.clientName}</p>
                <p>{invoice.clientAddress}</p>
                <p>{invoice.clientEmail}</p>
                <p>{invoice.clientPhone}</p>
                {invoice.customFields?.["GST Number"] && (
                  <p>GST: {invoice.customFields["GST Number"]}</p>
                )}
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">Issue Date:</span> 
                    <span>{formatInvoiceDateForDisplay(invoice.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Due Date:</span> 
                    <span>{formatInvoiceDateForDisplay(invoice.dueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Status:</span> 
                    <span className="capitalize">{invoice.status}</span>
                  </div>
                  {invoice.policyNumber && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-semibold">Policy Number:</span> 
                        <span>{invoice.policyNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Insurance Type:</span> 
                        <span>{invoice.insuranceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Period:</span> 
                        <span>{invoice.premiumPeriod}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className={currentTemplate.contentClass}>
          {template !== 'standard' && (
            <>
              <div>
                <h3 className="font-bold text-gray-700 mb-2">Bill To:</h3>
                <p className="font-medium">{invoice.clientName}</p>
                <p>{invoice.clientAddress}</p>
                <p>{invoice.clientEmail}</p>
                <p>{invoice.clientPhone}</p>
                {invoice.customFields?.["GST Number"] && (
                  <p>GST: {invoice.customFields["GST Number"]}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-gray-700 mb-2">Invoice Details:</h3>
                <p><span className="font-semibold">Issue Date:</span> {formatInvoiceDateForDisplay(invoice.issueDate)}</p>
                <p><span className="font-semibold">Due Date:</span> {formatInvoiceDateForDisplay(invoice.dueDate)}</p>
                <p><span className="font-semibold">Status:</span> <span className="capitalize">{invoice.status}</span></p>
                {invoice.paymentMethod && (
                  <p><span className="font-semibold">Payment Method:</span> {invoice.paymentMethod}</p>
                )}
              </div>
              
              {invoice.policyNumber && (
                <div>
                  <h3 className="font-bold text-gray-700 mb-2">Policy Details:</h3>
                  <p><span className="font-semibold">Policy Number:</span> {invoice.policyNumber}</p>
                  <p><span className="font-semibold">Insurance Type:</span> {invoice.insuranceType}</p>
                  <p><span className="font-semibold">Period:</span> {invoice.premiumPeriod}</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Invoice Items Table */}
        <div className={currentTemplate.tableClass}>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.tax)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 flex justify-end">
            <div className="w-full md:w-1/2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="font-medium">-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(getPaidAmount())}</span>
                </div>
                <div className={`flex justify-between ${invoice.status === 'paid' ? 'text-green-600' : 'text-red-600'} font-bold`}>
                  <span>Balance Due:</span>
                  <span>{formatCurrency(getRemainingBalance())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className={currentTemplate.footerClass}>
          {invoice.notes && (
            <div className="mb-6">
              <h4 className="font-semibold mb-1">Notes</h4>
              <p className="text-gray-700">{invoice.notes}</p>
            </div>
          )}
          
          {invoice.paymentTerms && (
            <div className="mb-6">
              <h4 className="font-semibold mb-1">Payment Terms</h4>
              <p className="text-gray-700">{invoice.paymentTerms}</p>
            </div>
          )}
          
          {template !== 'minimal' && (
            <div className="text-center w-full pt-4 mt-8 border-t text-gray-600">
              <p>Thank you for your business!</p>
              {invoice.agentName && (
                <p className="mt-1">Your insurance agent: {invoice.agentName}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
