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
      headerClass: "mb-8",
      titleClass: "text-2xl font-bold",
      contentClass: "grid grid-cols-1 md:grid-cols-2 gap-8 mt-8",
      tableClass: "mt-6",
      footerClass: "mt-8 pt-8 border-t",
    },
    corporate: {
      className: "bg-white max-w-4xl mx-auto p-8 rounded-lg shadow-md",
      headerClass: "mb-8",
      titleClass: "text-3xl font-bold text-white",
      contentClass: "grid grid-cols-1 md:grid-cols-2 gap-8 mt-8",
      tableClass: "mt-8",
      footerClass: "mt-8 pt-8 border-t flex justify-between",
    },
    minimal: {
      className: "bg-white max-w-4xl mx-auto p-8",
      headerClass: "mb-6",
      titleClass: "text-xl font-medium",
      contentClass: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-4",
      tableClass: "mt-6",
      footerClass: "mt-4 pt-4 border-t text-sm",
    },
    modern: {
      className: "bg-white max-w-4xl mx-auto p-8 rounded-xl shadow-lg",
      headerClass: "mb-8",
      titleClass: "text-3xl font-bold",
      contentClass: "grid grid-cols-1 md:grid-cols-2 gap-8 mt-8",
      tableClass: "mt-10",
      footerClass: "mt-10 pt-6 border-t flex flex-col md:flex-row justify-between",
    },
    elegant: {
      className: "bg-white max-w-4xl mx-auto p-12 rounded shadow-md border",
      headerClass: "text-center mb-8",
      titleClass: "text-4xl font-light",
      contentClass: "grid grid-cols-1 md:grid-cols-2 gap-12 mt-8",
      tableClass: "mt-12",
      footerClass: "mt-12 pt-8 border-t text-center",
    }
  };
  
  const currentTemplate = templates[template] || templates.standard;
  
  // Common header component for all templates
  const renderHeader = () => {
    const isElegant = template === 'elegant';
    const isCorporate = template === 'corporate';
    
    return (
      <div className={`${currentTemplate.headerClass} ${isCorporate ? `bg-[${accentColor}] -m-8 mb-8 p-8 text-white rounded-t-lg` : isElegant ? 'border-b pb-8' : 'border-b pb-6'}`}>
        <div className={`flex ${isElegant ? 'flex-col items-center' : 'justify-between items-start'}`}>
          {/* Left side - Invoice title and number */}
          <div className={isElegant ? 'text-center mb-6' : ''}>
            <h1 className={`${currentTemplate.titleClass} ${isElegant ? `text-[${accentColor}]` : isCorporate ? 'text-white' : 'text-gray-900'}`}>
              INVOICE
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className={`text-lg font-semibold ${isCorporate ? 'text-white' : 'text-gray-700'}`}>
                #{invoice.invoiceNumber}
              </p>
              <span className={`text-xs px-2 py-1 rounded ${isCorporate ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                ID: {invoice.invoiceNumber}
              </span>
            </div>
          </div>
          
          {/* Right side - Company branding */}
          <div className={`${isElegant ? 'text-center' : 'text-right'} ${isCorporate ? 'text-white' : 'text-gray-600'}`}>
            <div className={`flex items-center ${isElegant ? 'justify-center' : 'justify-end'} mb-3`}>
              <img 
                src={logoUrl} 
                alt="Amba Insurance Logo"
                className={`h-12 max-w-32 object-contain ${isCorporate ? 'bg-white/10 p-1 rounded' : ''}`}
              />
            </div>
            <div className={`space-y-1 ${isElegant ? 'text-center' : 'text-right'}`}>
              <h2 className={`font-bold text-lg ${isCorporate ? 'text-white' : `text-[${accentColor}]`}`}>
                AMBA INSURANCE SERVICES
              </h2>
              <p className="text-sm">Mumbai Corporate Office</p>
              <p className="text-sm">123 Business District, Bandra Kurla Complex</p>
              <p className="text-sm">Mumbai, Maharashtra 400051, India</p>
              <div className="flex flex-col text-xs mt-2 space-y-1">
                <span>📞 +91 22 6789 1234</span>
                <span>📧 info@ambainsurance.com</span>
                <span>🌐 www.ambainsurance.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
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
                <p>Amba Insurance Services</p>
                <p>123 Insurance St, Mumbai 400001</p>
                <p>contact@ambainsurance.com</p>
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
      const margin = 15;
      
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
      
      // Page border with rounded corners effect
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
      
      // Header background section
      pdf.setFillColor(248, 250, 252);
      pdf.rect(10, 10, pageWidth - 20, 55, 'F');
      pdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.setLineWidth(1.5);
      pdf.rect(10, 10, pageWidth - 20, 55);
      
      let currentY = 20;
      
      // Company Logo placeholder (top left)
      pdf.setFillColor(255, 255, 255);
      pdf.rect(15, 15, 45, 22, 'F');
      pdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.setLineWidth(1);
      pdf.rect(15, 15, 45, 22);
      
      // Logo text
      pdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AMBA', 25, 23);
      pdf.setFontSize(7);
      pdf.text('INSURANCE', 18, 29);
      pdf.text('SERVICES', 20, 34);
      
      // Company information (top right)
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AMBA INSURANCE SERVICES', pageWidth - margin, 18, { align: 'right' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('Mumbai Corporate Office', pageWidth - margin, 24, { align: 'right' });
      pdf.text('123 Business District, Bandra Kurla Complex', pageWidth - margin, 28, { align: 'right' });
      pdf.text('Mumbai, Maharashtra 400051, India', pageWidth - margin, 32, { align: 'right' });
      pdf.text('📞 +91 22 6789 1234  📧 info@ambainsurance.com', pageWidth - margin, 36, { align: 'right' });
      pdf.text('🌐 www.ambainsurance.com', pageWidth - margin, 40, { align: 'right' });
      
      // Invoice title and number section
      currentY = 50;
      pdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', margin, currentY);
      
      // Small invoice ID
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`ID: ${invoice.invoiceNumber}`, margin + 75, currentY - 10);
      
      // Main invoice number
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`#${invoice.invoiceNumber}`, margin, currentY + 6);
      
      currentY = 78;
      
      // Separator line
      pdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.setLineWidth(0.8);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;
      
      // Two-column layout
      const leftColumnX = margin;
      const rightColumnX = pageWidth / 2 + 5;
      
      // Bill To section (left column)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.text('BILL TO:', leftColumnX, currentY);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      const billToY = currentY + 6;
      pdf.text(invoice.clientName, leftColumnX, billToY);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      let addressY = billToY + 5;
      
      if (invoice.clientAddress) {
        const addressLines = invoice.clientAddress.split(',');
        addressLines.forEach(line => {
          if (line.trim()) {
            pdf.text(line.trim(), leftColumnX, addressY);
            addressY += 4;
          }
        });
      }
      
      if (invoice.clientEmail) {
        pdf.text(`📧 ${invoice.clientEmail}`, leftColumnX, addressY);
        addressY += 4;
      }
      
      if (invoice.clientPhone) {
        pdf.text(`📞 ${invoice.clientPhone}`, leftColumnX, addressY);
        addressY += 4;
      }
      
      if (invoice.customFields?.["GST Number"]) {
        pdf.text(`GST: ${invoice.customFields["GST Number"]}`, leftColumnX, addressY);
        addressY += 4;
      }
      
      // Invoice details section (right column)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.text('INVOICE DETAILS:', rightColumnX, currentY);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      const detailsY = currentY + 6;
      
      const details = [
        { label: 'Issue Date:', value: formatInvoiceDateForDisplay(invoice.issueDate) },
        { label: 'Due Date:', value: formatInvoiceDateForDisplay(invoice.dueDate) },
        { label: 'Status:', value: invoice.status.toUpperCase() }
      ];
      
      let detailCurrentY = detailsY;
      details.forEach((detail) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(detail.label, rightColumnX, detailCurrentY);
        pdf.setFont('helvetica', 'normal');
        
        // Color-code status
        if (detail.label === 'Status:') {
          if (invoice.status === 'paid') {
            pdf.setTextColor(0, 150, 0);
          } else if (invoice.status === 'overdue') {
            pdf.setTextColor(220, 20, 60);
          } else {
            pdf.setTextColor(0, 100, 200);
          }
        }
        
        pdf.text(detail.value, rightColumnX + 22, detailCurrentY);
        pdf.setTextColor(0, 0, 0);
        detailCurrentY += 5;
      });
      
      // Policy information
      if (invoice.policyNumber) {
        detailCurrentY += 3;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
        pdf.text('POLICY INFO:', rightColumnX, detailCurrentY);
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        detailCurrentY += 5;
        
        pdf.text(`Policy: ${invoice.policyNumber}`, rightColumnX, detailCurrentY);
        detailCurrentY += 4;
        if (invoice.insuranceType) {
          pdf.text(`Type: ${invoice.insuranceType}`, rightColumnX, detailCurrentY);
          detailCurrentY += 4;
        }
        if (invoice.premiumPeriod) {
          pdf.text(`Period: ${invoice.premiumPeriod}`, rightColumnX, detailCurrentY);
        }
      }
      
      // Items table section
      currentY = Math.max(addressY, detailCurrentY) + 12;
      
      // Table header
      const tableHeaderHeight = 10;
      pdf.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.rect(margin, currentY, pageWidth - (margin * 2), tableHeaderHeight, 'F');
      
      pdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.setLineWidth(1);
      pdf.rect(margin, currentY, pageWidth - (margin * 2), tableHeaderHeight);
      
      // Table column positions
      const col1X = margin + 2;
      const col2X = margin + 80;
      const col3X = margin + 105;
      const col4X = margin + 130;
      const col5X = pageWidth - margin - 20;
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      
      pdf.text('DESCRIPTION', col1X, currentY + 7);
      pdf.text('QTY', col2X, currentY + 7, { align: 'center' });
      pdf.text('UNIT PRICE', col3X, currentY + 7, { align: 'center' });
      pdf.text('TAX', col4X, currentY + 7, { align: 'center' });
      pdf.text('TOTAL', col5X, currentY + 7, { align: 'center' });
      
      currentY += tableHeaderHeight;
      
      // Table items
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      
      const rowHeight = 8;
      invoice.items.forEach((item, index) => {
        if (currentY > pageHeight - 70) {
          pdf.addPage();
          currentY = 25;
        }
        
        // Alternate row background
        if (index % 2 === 1) {
          pdf.setFillColor(248, 249, 250);
          pdf.rect(margin, currentY, pageWidth - (margin * 2), rowHeight, 'F');
        }
        
        // Row border
        pdf.setDrawColor(230, 230, 230);
        pdf.setLineWidth(0.2);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        
        const itemY = currentY + 6;
        
        // Description (truncate if too long)
        const maxDescWidth = 70;
        const descLines = pdf.splitTextToSize(item.description, maxDescWidth);
        pdf.text(descLines[0], col1X, itemY);
        
        // Quantity (formatted as integer)
        pdf.text(item.quantity.toString(), col2X, itemY, { align: 'center' });
        
        // Unit price (properly formatted currency)
        pdf.text(formatCurrency(item.unitPrice), col3X, itemY, { align: 'center' });
        
        // Tax (properly formatted currency)
        pdf.text(formatCurrency(item.tax), col4X, itemY, { align: 'center' });
        
        // Total (bold, properly formatted currency)
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatCurrency(item.total), col5X, itemY, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        
        currentY += rowHeight;
      });
      
      // Table bottom border
      pdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.setLineWidth(1);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      
      // Summary section
      currentY += 12;
      const summaryBoxX = pageWidth - 75;
      const summaryBoxY = currentY - 3;
      const summaryBoxWidth = 70;
      const summaryBoxHeight = 45;
      
      // Summary box styling
      pdf.setFillColor(252, 252, 252);
      pdf.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 'F');
      pdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.setLineWidth(0.8);
      pdf.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight);
      
      const summaryX = summaryBoxX + 3;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      
      // Subtotal
      pdf.text('Subtotal:', summaryX, currentY);
      pdf.text(formatCurrency(invoice.subtotal), pageWidth - margin - 3, currentY, { align: 'right' });
      currentY += 5;
      
      // Discount (if any)
      if (invoice.discount > 0) {
        pdf.text('Discount:', summaryX, currentY);
        pdf.setTextColor(220, 20, 60);
        pdf.text(`-${formatCurrency(invoice.discount)}`, pageWidth - margin - 3, currentY, { align: 'right' });
        pdf.setTextColor(0, 0, 0);
        currentY += 5;
      }
      
      // Tax
      pdf.text('Tax:', summaryX, currentY);
      pdf.text(formatCurrency(invoice.tax), pageWidth - margin - 3, currentY, { align: 'right' });
      currentY += 6;
      
      // Total separator line
      pdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.setLineWidth(0.6);
      pdf.line(summaryX, currentY - 1, pageWidth - margin - 3, currentY - 1);
      
      // Total amount
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.text('TOTAL:', summaryX, currentY);
      pdf.text(formatCurrency(invoice.total), pageWidth - margin - 3, currentY, { align: 'right' });
      currentY += 6;
      
      // Payment status
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Amount Paid:', summaryX, currentY);
      pdf.text(formatCurrency(getPaidAmount()), pageWidth - margin - 3, currentY, { align: 'right' });
      currentY += 5;
      
      // Balance due
      const balanceDue = getRemainingBalance();
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      
      if (invoice.status === 'paid') {
        pdf.setTextColor(0, 150, 0);
      } else if (balanceDue > 0) {
        pdf.setTextColor(220, 20, 60);
      }
      
      pdf.text('Balance Due:', summaryX, currentY);
      pdf.text(formatCurrency(balanceDue), pageWidth - margin - 3, currentY, { align: 'right' });
      pdf.setTextColor(0, 0, 0);
      
      currentY += 15;
      
      // Notes and terms section
      if (invoice.notes || invoice.paymentTerms) {
        if (currentY > pageHeight - 50) {
          pdf.addPage();
          currentY = 25;
        }
        
        if (invoice.notes) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
          pdf.text('NOTES & REMARKS:', margin, currentY);
          currentY += 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(60, 60, 60);
          const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - (margin * 2));
          notesLines.forEach(line => {
            pdf.text(line, margin, currentY);
            currentY += 3.5;
          });
          currentY += 4;
        }
        
        if (invoice.paymentTerms) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
          pdf.text('PAYMENT TERMS & CONDITIONS:', margin, currentY);
          currentY += 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(60, 60, 60);
          const termsLines = pdf.splitTextToSize(invoice.paymentTerms, pageWidth - (margin * 2));
          termsLines.forEach(line => {
            pdf.text(line, margin, currentY);
            currentY += 3.5;
          });
        }
      }
      
      // Footer section
      const footerY = pageHeight - 20;
      
      // Footer separator
      pdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
      pdf.setLineWidth(0.4);
      pdf.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text('Thank you for choosing Amba Insurance Services!', pageWidth / 2, footerY, { align: 'center' });
      
      if (invoice.agentName) {
        pdf.setFontSize(7);
        pdf.text(`Your dedicated insurance representative: ${invoice.agentName}`, pageWidth / 2, footerY + 4, { align: 'center' });
      }
      
      // Generation info
      pdf.setFontSize(6);
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | Page 1 of 1`, pageWidth - margin, footerY + 6, { align: 'right' });
      
      // Save the PDF
      pdf.save(`Amba-Invoice-${invoice.invoiceNumber}.pdf`);
      toast.success('Professional PDF downloaded successfully!');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };
  
  const handleShare = () => {
    try {
      // Generate a simplified PDF for sharing
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', 20, 25);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`#${invoice.invoiceNumber}`, 20, 35);
      
      // Client info
      pdf.setFontSize(12);
      pdf.text(`Client: ${invoice.clientName}`, 20, 50);
      pdf.text(`Amount: ${formatCurrency(invoice.total)}`, 20, 60);
      pdf.text(`Status: ${invoice.status.toUpperCase()}`, 20, 70);
      
      // Company info
      pdf.text('Amba Insurance Services', pageWidth - 20, 25, { align: 'right' });
      pdf.setFontSize(10);
      pdf.text('Mumbai, India', pageWidth - 20, 35, { align: 'right' });
      
      const pdfBlob = pdf.output('blob');
      
      if (navigator.share) {
        const file = new File([pdfBlob], `Amba-Invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });
        
        navigator.share({
          title: `Invoice #${invoice.invoiceNumber}`,
          text: `Invoice from Amba Insurance Services for ${formatCurrency(invoice.total)}`,
          files: [file]
        })
          .then(() => toast.success('Invoice shared successfully!'))
          .catch((error) => {
            console.error('Sharing failed:', error);
            toast.error('Failed to share invoice');
          });
      } else {
        toast.info('Direct sharing not supported. Please use Download instead.');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share invoice');
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
        {/* Render header for all templates */}
        {renderHeader()}
        
        {/* Content */}
        <div className={currentTemplate.contentClass}>
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
