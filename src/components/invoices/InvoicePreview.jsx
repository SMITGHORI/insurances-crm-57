import React, { useState, useRef } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatInvoiceDateForDisplay } from '@/utils/invoiceUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileImage, FileText, Image, Layout, PaintBucket, Printer, Share } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoicePreview = ({ invoice }) => {
  const [template, setTemplate] = useState(invoice.layoutTemplate || 'standard');
  const [accentColor, setAccentColor] = useState('#1a56db');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [activeCustomizeTab, setActiveCustomizeTab] = useState('layout');
  const [logoUrl, setLogoUrl] = useState('/placeholder.svg');
  const invoiceRef = useRef(null);
  
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

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-container');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .page-header {
              padding: 20px;
              border-bottom: 1px solid #ddd;
              margin-bottom: 20px;
              background-color: ${template === 'corporate' ? accentColor : '#ffffff'};
              color: ${template === 'corporate' ? '#ffffff' : '#000000'};
            }
            .page-footer {
              text-align: center;
              padding: 10px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              margin-top: 20px;
              position: fixed;
              bottom: 0;
              width: 100%;
              background: white;
            }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #f3f4f6; text-align: left; padding: 8px; }
            td { border-bottom: 1px solid #ddd; padding: 8px; }
            .text-right { text-align: right; }
            @media print {
              .page-header { position: fixed; top: 0; width: 100%; }
              .page-footer { position: fixed; bottom: 0; width: 100%; }
              .content { margin-top: 150px; margin-bottom: 100px; }
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <div class="page-header">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <h1>INVOICE</h1>
                <p>#${invoice.invoiceNumber}</p>
              </div>
              <div style="text-align: right;">
                <img src="${logoUrl}" alt="Company Logo" style="height: 60px; max-width: 200px; background: white; padding: 5px; border-radius: 5px;" />
                <p>Ambition Insurance</p>
                <p>123 Insurance St, Mumbai 400001</p>
                <p>contact@ambitioninsurance.com</p>
              </div>
            </div>
          </div>
          <div class="content">
            ${printContent.innerHTML}
          </div>
          <div class="page-footer">
            <p>Thank you for your business!</p>
            ${invoice.agentName ? `<p>Your insurance agent: ${invoice.agentName}</p>` : ''}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleDownload = () => {
    try {
      const element = invoiceRef.current;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Define page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Create header
      if (template === 'corporate') {
        pdf.setFillColor(accentColor.replace('#', ''));
        pdf.rect(0, 0, pageWidth, 40, 'F');
        pdf.setTextColor(255, 255, 255);
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      
      // Add invoice title and number
      pdf.setFontSize(22);
      pdf.text('INVOICE', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`#${invoice.invoiceNumber}`, 20, 30);
      
      // Add logo 
      html2canvas(document.querySelector('img[alt="Company Logo"]')).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', pageWidth - 60, 10, 40, 20);
        
        // Add company info
        pdf.setFontSize(10);
        if (template === 'corporate') {
          pdf.setTextColor(255, 255, 255);
        } else {
          pdf.setTextColor(0, 0, 0);
        }
        pdf.text('Ambition Insurance', pageWidth - 20, 20, { align: 'right' });
        pdf.text('123 Insurance St, Mumbai 400001', pageWidth - 20, 25, { align: 'right' });
        pdf.text('contact@ambitioninsurance.com', pageWidth - 20, 30, { align: 'right' });
        
        // Add client and invoice details
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.text('Bill To:', 20, 50);
        pdf.setFontSize(10);
        pdf.text(invoice.clientName, 20, 57);
        pdf.text(invoice.clientAddress || '', 20, 62);
        pdf.text(invoice.clientEmail || '', 20, 67);
        pdf.text(invoice.clientPhone || '', 20, 72);
        
        pdf.text('Invoice Details:', pageWidth - 80, 50);
        pdf.text(`Issue Date: ${formatInvoiceDateForDisplay(invoice.issueDate)}`, pageWidth - 80, 57);
        pdf.text(`Due Date: ${formatInvoiceDateForDisplay(invoice.dueDate)}`, pageWidth - 80, 62);
        pdf.text(`Status: ${invoice.status}`, pageWidth - 80, 67);
        
        if (invoice.policyNumber) {
          pdf.text('Policy Details:', pageWidth - 80, 77);
          pdf.text(`Policy Number: ${invoice.policyNumber}`, pageWidth - 80, 84);
          pdf.text(`Insurance Type: ${invoice.insuranceType}`, pageWidth - 80, 89);
          pdf.text(`Period: ${invoice.premiumPeriod}`, pageWidth - 80, 94);
        }
        
        // Add table header
        pdf.setFillColor(243, 244, 246);
        pdf.rect(20, 105, pageWidth - 40, 10, 'F');
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Description', 25, 111);
        pdf.text('Qty', 110, 111, { align: 'right' });
        pdf.text('Unit Price', 130, 111, { align: 'right' });
        pdf.text('Tax', 150, 111, { align: 'right' });
        pdf.text('Total', 170, 111, { align: 'right' });
        
        // Add table items
        let yPosition = 120;
        invoice.items.forEach((item, index) => {
          pdf.text(item.description, 25, yPosition);
          pdf.text(item.quantity.toString(), 110, yPosition, { align: 'right' });
          pdf.text(formatCurrency(item.unitPrice), 130, yPosition, { align: 'right' });
          pdf.text(formatCurrency(item.tax), 150, yPosition, { align: 'right' });
          pdf.text(formatCurrency(item.total), 170, yPosition, { align: 'right' });
          
          // Add line separator
          pdf.setDrawColor(220, 220, 220);
          yPosition += 5;
          pdf.line(20, yPosition, pageWidth - 20, yPosition);
          yPosition += 5;
        });
        
        // Add totals
        yPosition += 5;
        pdf.text('Subtotal:', 140, yPosition);
        pdf.text(formatCurrency(invoice.subtotal), 170, yPosition, { align: 'right' });
        
        if (invoice.discount > 0) {
          yPosition += 5;
          pdf.text('Discount:', 140, yPosition);
          pdf.text(`-${formatCurrency(invoice.discount)}`, 170, yPosition, { align: 'right' });
        }
        
        yPosition += 5;
        pdf.text('Tax:', 140, yPosition);
        pdf.text(formatCurrency(invoice.tax), 170, yPosition, { align: 'right' });
        
        yPosition += 5;
        pdf.setDrawColor(220, 220, 220);
        pdf.line(140, yPosition, 170, yPosition);
        yPosition += 5;
        
        pdf.setFontSize(10);
        pdf.text('Total:', 140, yPosition);
        pdf.text(formatCurrency(invoice.total), 170, yPosition, { align: 'right' });
        
        yPosition += 5;
        pdf.text('Amount Paid:', 140, yPosition);
        pdf.text(formatCurrency(getPaidAmount()), 170, yPosition, { align: 'right' });
        
        yPosition += 5;
        pdf.setTextColor(invoice.status === 'paid' ? 0x008000 : 0xcc0000);
        pdf.text('Balance Due:', 140, yPosition);
        pdf.text(formatCurrency(getRemainingBalance()), 170, yPosition, { align: 'right' });
        
        // Add notes
        if (invoice.notes) {
          yPosition += 15;
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
          pdf.text('Notes:', 20, yPosition);
          pdf.setFontSize(9);
          pdf.text(invoice.notes, 20, yPosition + 6);
        }
        
        // Add payment terms
        if (invoice.paymentTerms) {
          yPosition += 15;
          pdf.setFontSize(10);
          pdf.text('Payment Terms:', 20, yPosition);
          pdf.setFontSize(9);
          pdf.text(invoice.paymentTerms, 20, yPosition + 6);
        }
        
        // Add footer
        pdf.setFontSize(10);
        pdf.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });
        
        if (invoice.agentName) {
          pdf.setFontSize(9);
          pdf.text(`Your insurance agent: ${invoice.agentName}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
        }
        
        // Save PDF
        pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
        toast.success('PDF downloaded successfully');
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };
  
  const handleShare = () => {
    try {
      // Generate PDF as Blob for sharing
      const element = invoiceRef.current;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Define page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Create basic invoice (simplified for sharing)
      pdf.setFontSize(22);
      pdf.text('INVOICE', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`#${invoice.invoiceNumber}`, 20, 30);
      
      // Convert the invoice element to canvas
      html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate scaling
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add the image
        pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
        
        // Convert to blob for sharing
        const pdfBlob = pdf.output('blob');
        
        // Use Web Share API if available
        if (navigator.share) {
          const file = new File([pdfBlob], `invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });
          
          navigator.share({
            title: `Invoice #${invoice.invoiceNumber}`,
            text: 'Please find attached invoice from Ambition Insurance',
            files: [file]
          })
            .then(() => toast.success('Shared successfully'))
            .catch((error) => {
              console.error('Sharing failed:', error);
              toast.error('Failed to share');
            });
        } else {
          // Fallback for browsers without Web Share API
          toast.info('Direct sharing not supported in this browser. Please use the Download option instead.');
        }
      });
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    }
  };

  return (
    <div className="relative">
      <div className="mb-4 flex justify-between">
        <div className="flex gap-2">
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
            Download PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleShare}
            className="flex items-center"
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
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
      
      <div id="invoice-container" ref={invoiceRef} className={currentTemplate.className}>
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
