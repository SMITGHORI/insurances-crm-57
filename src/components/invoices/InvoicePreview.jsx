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

  const handleDownloadHTML = () => {
    const invoiceElement = document.getElementById('invoice-container');
    if (invoiceElement) {
      const content = `
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f3f4f6; }
              .text-right { text-align: right; }
              .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px; }
              .company-info { text-align: right; }
              .client-info { margin: 20px 0; }
              .totals { margin-top: 20px; text-align: right; }
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
      toast.success('HTML downloaded successfully');
    }
  };

  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      
      // Helper function to convert hex to RGB
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 26, g: 86, b: 219 };
      };
      
      const accentRgb = hexToRgb(accentColor);
      
      // Header Section
      if (template === 'corporate') {
        pdf.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
        pdf.rect(0, 0, pageWidth, 50, 'F');
        pdf.setTextColor(255, 255, 255);
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      
      // Invoice Title
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', margin, 25);
      
      // Invoice Number
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`#${invoice.invoiceNumber}`, margin, 35);
      
      // Company Info (Right side)
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Ambition Insurance', pageWidth - margin, 20, { align: 'right' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('123 Insurance St, Mumbai 400001', pageWidth - margin, 26, { align: 'right' });
      pdf.text('contact@ambitioninsurance.com', pageWidth - margin, 32, { align: 'right' });
      pdf.text('+91 22 1234 5678', pageWidth - margin, 38, { align: 'right' });
      
      // Reset text color for main content
      pdf.setTextColor(0, 0, 0);
      
      let currentY = template === 'corporate' ? 65 : 55;
      
      // Client Information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', margin, currentY);
      currentY += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(invoice.clientName, margin, currentY);
      currentY += 5;
      if (invoice.clientAddress) {
        pdf.text(invoice.clientAddress, margin, currentY);
        currentY += 5;
      }
      if (invoice.clientEmail) {
        pdf.text(invoice.clientEmail, margin, currentY);
        currentY += 5;
      }
      if (invoice.clientPhone) {
        pdf.text(invoice.clientPhone, margin, currentY);
        currentY += 5;
      }
      
      // Invoice Details (Right side)
      let detailsY = template === 'corporate' ? 65 : 55;
      const detailsX = pageWidth - 80;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Invoice Details:', detailsX, detailsY);
      detailsY += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Issue Date: ${formatInvoiceDateForDisplay(invoice.issueDate)}`, detailsX, detailsY);
      detailsY += 5;
      pdf.text(`Due Date: ${formatInvoiceDateForDisplay(invoice.dueDate)}`, detailsX, detailsY);
      detailsY += 5;
      pdf.text(`Status: ${invoice.status.toUpperCase()}`, detailsX, detailsY);
      detailsY += 5;
      
      // Policy Details (if available)
      if (invoice.policyNumber) {
        detailsY += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Policy Details:', detailsX, detailsY);
        detailsY += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Policy: ${invoice.policyNumber}`, detailsX, detailsY);
        detailsY += 5;
        if (invoice.insuranceType) {
          pdf.text(`Type: ${invoice.insuranceType}`, detailsX, detailsY);
          detailsY += 5;
        }
        if (invoice.premiumPeriod) {
          pdf.text(`Period: ${invoice.premiumPeriod}`, detailsX, detailsY);
          detailsY += 5;
        }
      }
      
      // Items Table
      currentY = Math.max(currentY, detailsY) + 15;
      
      // Table Header
      const tableStartY = currentY;
      const rowHeight = 8;
      const headerHeight = 10;
      
      pdf.setFillColor(243, 244, 246);
      pdf.rect(margin, currentY, pageWidth - (margin * 2), headerHeight, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      
      // Table headers
      pdf.text('Description', margin + 2, currentY + 6);
      pdf.text('Qty', margin + 90, currentY + 6, { align: 'center' });
      pdf.text('Unit Price', margin + 115, currentY + 6, { align: 'center' });
      pdf.text('Tax', margin + 140, currentY + 6, { align: 'center' });
      pdf.text('Total', pageWidth - margin - 15, currentY + 6, { align: 'center' });
      
      currentY += headerHeight;
      
      // Table Items
      pdf.setFont('helvetica', 'normal');
      invoice.items.forEach((item, index) => {
        if (currentY > pageHeight - 60) {
          pdf.addPage();
          currentY = 20;
        }
        
        // Alternate row background
        if (index % 2 === 1) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(margin, currentY, pageWidth - (margin * 2), rowHeight, 'F');
        }
        
        pdf.setTextColor(0, 0, 0);
        pdf.text(item.description, margin + 2, currentY + 5);
        pdf.text(item.quantity.toString(), margin + 90, currentY + 5, { align: 'center' });
        pdf.text(formatCurrency(item.unitPrice), margin + 115, currentY + 5, { align: 'center' });
        pdf.text(formatCurrency(item.tax), margin + 140, currentY + 5, { align: 'center' });
        pdf.text(formatCurrency(item.total), pageWidth - margin - 15, currentY + 5, { align: 'center' });
        
        currentY += rowHeight;
      });
      
      // Totals Section
      currentY += 10;
      const totalsX = pageWidth - 80;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      // Subtotal
      pdf.text('Subtotal:', totalsX, currentY);
      pdf.text(formatCurrency(invoice.subtotal), pageWidth - margin, currentY, { align: 'right' });
      currentY += 6;
      
      // Discount (if any)
      if (invoice.discount > 0) {
        pdf.text('Discount:', totalsX, currentY);
        pdf.text(`-${formatCurrency(invoice.discount)}`, pageWidth - margin, currentY, { align: 'right' });
        currentY += 6;
      }
      
      // Tax
      pdf.text('Tax:', totalsX, currentY);
      pdf.text(formatCurrency(invoice.tax), pageWidth - margin, currentY, { align: 'right' });
      currentY += 6;
      
      // Line separator
      pdf.setDrawColor(0, 0, 0);
      pdf.line(totalsX, currentY, pageWidth - margin, currentY);
      currentY += 6;
      
      // Total
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Total:', totalsX, currentY);
      pdf.text(formatCurrency(invoice.total), pageWidth - margin, currentY, { align: 'right' });
      currentY += 8;
      
      // Payment Status
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Amount Paid:', totalsX, currentY);
      pdf.text(formatCurrency(getPaidAmount()), pageWidth - margin, currentY, { align: 'right' });
      currentY += 6;
      
      // Balance Due
      const balanceDue = getRemainingBalance();
      const balanceColor = invoice.status === 'paid' ? [0, 128, 0] : [204, 0, 0];
      pdf.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Balance Due:', totalsX, currentY);
      pdf.text(formatCurrency(balanceDue), pageWidth - margin, currentY, { align: 'right' });
      
      // Reset color
      pdf.setTextColor(0, 0, 0);
      currentY += 15;
      
      // Notes Section
      if (invoice.notes) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Notes:', margin, currentY);
        currentY += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - (margin * 2));
        pdf.text(notesLines, margin, currentY);
        currentY += notesLines.length * 4 + 5;
      }
      
      // Payment Terms
      if (invoice.paymentTerms) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Payment Terms:', margin, currentY);
        currentY += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        const termsLines = pdf.splitTextToSize(invoice.paymentTerms, pageWidth - (margin * 2));
        pdf.text(termsLines, margin, currentY);
        currentY += termsLines.length * 4 + 10;
      }
      
      // Footer
      const footerY = pageHeight - 30;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
      
      if (invoice.agentName) {
        pdf.setFontSize(9);
        pdf.text(`Your insurance agent: ${invoice.agentName}`, pageWidth / 2, footerY + 6, { align: 'center' });
      }
      
      // Save the PDF
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };
  
  const handleShare = () => {
    try {
      // Generate PDF as Blob for sharing
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Simplified PDF for sharing
      pdf.setFontSize(22);
      pdf.text('INVOICE', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`#${invoice.invoiceNumber}`, 20, 30);
      
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
            onClick={handleDownloadPDF}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadHTML}
            className="flex items-center"
          >
            <FileText className="mr-2 h-4 w-4" />
            Download HTML
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
