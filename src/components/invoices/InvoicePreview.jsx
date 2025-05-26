import React, { useState, useRef } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatInvoiceDateForDisplay } from '@/utils/invoiceUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, Share, PaintBucket } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import InvoiceCustomizer from './InvoiceCustomizer';

const InvoicePreview = ({ invoice }) => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const invoiceRef = useRef(null);
  
  const [customizations, setCustomizations] = useState({
    template: invoice.layoutTemplate || 'standard',
    pageLayout: 'portrait',
    headerStyle: 'standard',
    primaryColor: '#1a56db',
    secondaryColor: '#3b82f6',
    accentColor: '#60a5fa',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontFamily: 'Inter',
    baseFontSize: 10,
    headerFontSize: 24,
    titleFontSize: 14,
    lineHeight: 1.4,
    boldHeaders: true,
    uppercaseTitles: false,
    pageMargins: 20,
    sectionSpacing: 16,
    tableRowHeight: 8,
    headerHeight: 60,
    footerHeight: 25,
    showBorders: true,
    roundedCorners: false,
    showWatermark: false,
    showPageNumbers: true,
    logoUrl: '/placeholder.svg',
    logoSize: 60,
    logoPosition: 'top-right',
    companyName: 'AMBA INSURANCE SERVICES',
    companyAddress: 'Mumbai Corporate Office\n123 Business District, Bandra Kurla Complex\nMumbai, Maharashtra 400051, India',
    companyPhone: '+91 22 6789 1234',
    companyEmail: 'info@ambainsurance.com',
    companyWebsite: 'www.ambainsurance.com',
    watermarkText: 'CONFIDENTIAL',
    colorPreset: 'Corporate Blue'
  });
  
  // Get total paid amount if payment details exist
  const getPaidAmount = () => {
    return invoice.status === 'paid' ? invoice.total : 0;
  };
  
  // Calculate remaining balance
  const getRemainingBalance = () => {
    const paidAmount = getPaidAmount();
    return invoice.total - paidAmount;
  };
  
  const handleCustomizationChange = (field, value) => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomizations(prev => ({
          ...prev,
          logoUrl: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCustomizations = () => {
    setCustomizations({
      template: 'standard',
      pageLayout: 'portrait',
      headerStyle: 'standard',
      primaryColor: '#1a56db',
      secondaryColor: '#3b82f6',
      accentColor: '#60a5fa',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Inter',
      baseFontSize: 10,
      headerFontSize: 24,
      titleFontSize: 14,
      lineHeight: 1.4,
      boldHeaders: true,
      uppercaseTitles: false,
      pageMargins: 20,
      sectionSpacing: 16,
      tableRowHeight: 8,
      headerHeight: 60,
      footerHeight: 25,
      showBorders: true,
      roundedCorners: false,
      showWatermark: false,
      showPageNumbers: true,
      logoUrl: '/placeholder.svg',
      logoSize: 60,
      logoPosition: 'top-right',
      companyName: 'AMBA INSURANCE SERVICES',
      companyAddress: 'Mumbai Corporate Office\n123 Business District, Bandra Kurla Complex\nMumbai, Maharashtra 400051, India',
      companyPhone: '+91 22 6789 1234',
      companyEmail: 'info@ambainsurance.com',
      companyWebsite: 'www.ambainsurance.com',
      watermarkText: 'CONFIDENTIAL',
      colorPreset: 'Corporate Blue'
    });
  };
  
  const getTemplateStyles = () => {
    const baseStyles = {
      fontFamily: customizations.fontFamily,
      fontSize: `${customizations.baseFontSize}px`,
      lineHeight: customizations.lineHeight,
      color: customizations.textColor,
      backgroundColor: customizations.backgroundColor
    };

    const templates = {
      standard: {
        ...baseStyles,
        className: "bg-white max-w-4xl mx-auto p-8 rounded shadow",
        headerClass: `mb-${customizations.sectionSpacing/4} ${customizations.showBorders ? 'border-b pb-6' : ''}`,
        titleClass: `text-${customizations.headerFontSize}px ${customizations.boldHeaders ? 'font-bold' : 'font-medium'}`,
        contentClass: `grid grid-cols-1 md:grid-cols-2 gap-${customizations.sectionSpacing/4} mt-${customizations.sectionSpacing/4}`,
        tableClass: `mt-${customizations.sectionSpacing/4}`,
        footerClass: `mt-${customizations.sectionSpacing/4} pt-${customizations.sectionSpacing/4} ${customizations.showBorders ? 'border-t' : ''}`,
      },
      corporate: {
        ...baseStyles,
        className: `bg-white max-w-4xl mx-auto p-8 ${customizations.roundedCorners ? 'rounded-lg' : 'rounded'} shadow-md`,
        headerClass: `mb-${customizations.sectionSpacing/4}`,
        titleClass: `text-${customizations.headerFontSize}px text-white ${customizations.boldHeaders ? 'font-bold' : 'font-medium'}`,
        contentClass: `grid grid-cols-1 md:grid-cols-2 gap-${customizations.sectionSpacing/4} mt-${customizations.sectionSpacing/4}`,
        tableClass: `mt-${customizations.sectionSpacing/2}`,
        footerClass: `mt-${customizations.sectionSpacing/2} pt-${customizations.sectionSpacing/4} ${customizations.showBorders ? 'border-t' : ''} flex justify-between`,
      },
      minimal: {
        ...baseStyles,
        className: "bg-white max-w-4xl mx-auto p-8",
        headerClass: `mb-${customizations.sectionSpacing/6}`,
        titleClass: `text-${Math.floor(customizations.headerFontSize * 0.7)}px font-medium`,
        contentClass: `grid grid-cols-1 md:grid-cols-3 gap-${customizations.sectionSpacing/6} mt-${customizations.sectionSpacing/6}`,
        tableClass: `mt-${customizations.sectionSpacing/6}`,
        footerClass: `mt-${customizations.sectionSpacing/6} pt-${customizations.sectionSpacing/6} ${customizations.showBorders ? 'border-t' : ''} text-sm`,
      },
      modern: {
        ...baseStyles,
        className: `bg-white max-w-4xl mx-auto p-8 ${customizations.roundedCorners ? 'rounded-xl' : 'rounded'} shadow-lg`,
        headerClass: `mb-${customizations.sectionSpacing/2}`,
        titleClass: `text-${customizations.headerFontSize}px ${customizations.boldHeaders ? 'font-bold' : 'font-medium'}`,
        contentClass: `grid grid-cols-1 md:grid-cols-2 gap-${customizations.sectionSpacing/2} mt-${customizations.sectionSpacing/2}`,
        tableClass: `mt-${Math.floor(customizations.sectionSpacing * 0.625)}`,
        footerClass: `mt-${Math.floor(customizations.sectionSpacing * 0.625)} pt-${customizations.sectionSpacing/6} ${customizations.showBorders ? 'border-t' : ''} flex flex-col md:flex-row justify-between`,
      },
      elegant: {
        ...baseStyles,
        className: `bg-white max-w-4xl mx-auto p-12 ${customizations.roundedCorners ? 'rounded' : ''} shadow-md ${customizations.showBorders ? 'border' : ''}`,
        headerClass: `text-center mb-${customizations.sectionSpacing/2}`,
        titleClass: `text-${Math.floor(customizations.headerFontSize * 1.2)}px font-light`,
        contentClass: `grid grid-cols-1 md:grid-cols-2 gap-${Math.floor(customizations.sectionSpacing * 0.75)} mt-${customizations.sectionSpacing/2}`,
        tableClass: `mt-${Math.floor(customizations.sectionSpacing * 0.75)}`,
        footerClass: `mt-${Math.floor(customizations.sectionSpacing * 0.75)} pt-${customizations.sectionSpacing/2} ${customizations.showBorders ? 'border-t' : ''} text-center`,
      },
      creative: {
        ...baseStyles,
        className: `bg-white max-w-4xl mx-auto p-8 ${customizations.roundedCorners ? 'rounded-2xl' : 'rounded'} shadow-xl relative overflow-hidden`,
        headerClass: `mb-${customizations.sectionSpacing/2} relative z-10`,
        titleClass: `text-${customizations.headerFontSize}px ${customizations.boldHeaders ? 'font-bold' : 'font-medium'} ${customizations.uppercaseTitles ? 'uppercase' : ''} transform -rotate-2`,
        contentClass: `grid grid-cols-1 md:grid-cols-2 gap-${customizations.sectionSpacing/2} mt-${customizations.sectionSpacing/2} relative z-10`,
        tableClass: `mt-${customizations.sectionSpacing/2} relative z-10`,
        footerClass: `mt-${customizations.sectionSpacing/2} pt-${customizations.sectionSpacing/4} ${customizations.showBorders ? 'border-t-2 border-dashed' : ''} relative z-10`,
      }
    };
    
    return templates[customizations.template] || templates.standard;
  };
  
  const currentTemplate = getTemplateStyles();
  
  // Render header with advanced customization
  const renderAdvancedHeader = () => {
    const isCorporate = customizations.template === 'corporate';
    const isElegant = customizations.template === 'elegant';
    const isCreative = customizations.template === 'creative';
    
    const headerStyle = {
      backgroundColor: isCorporate ? customizations.primaryColor : 'transparent',
      color: isCorporate ? '#ffffff' : customizations.textColor,
      minHeight: `${customizations.headerHeight}px`
    };

    const getLogoPosition = () => {
      switch (customizations.logoPosition) {
        case 'top-left':
          return isElegant ? 'flex-col items-center' : 'justify-between items-start';
        case 'top-center':
          return 'flex-col items-center justify-center';
        case 'center':
          return 'flex-col items-center justify-center';
        default:
          return isElegant ? 'flex-col items-center' : 'justify-between items-start';
      }
    };
    
    return (
      <div 
        className={`${currentTemplate.headerClass} ${isCorporate ? '-m-8 mb-8 p-8 text-white' : isElegant ? 'border-b pb-8' : 'border-b pb-6'} ${customizations.roundedCorners && isCorporate ? 'rounded-t-lg' : ''}`}
        style={headerStyle}
      >
        {isCreative && customizations.showWatermark && (
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"
            style={{ 
              fontSize: '120px', 
              fontWeight: 'bold',
              transform: 'rotate(-45deg)',
              color: customizations.primaryColor
            }}
          >
            {customizations.watermarkText}
          </div>
        )}
        
        <div className={`flex ${getLogoPosition()}`}>
          {/* Invoice title and number */}
          <div className={isElegant || customizations.logoPosition === 'top-center' ? 'text-center mb-6' : ''}>
            <h1 
              className={currentTemplate.titleClass}
              style={{ 
                color: isElegant ? customizations.primaryColor : isCorporate ? '#ffffff' : customizations.textColor,
                fontSize: `${customizations.headerFontSize}px`,
                fontWeight: customizations.boldHeaders ? 'bold' : 'normal'
              }}
            >
              INVOICE
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p 
                className={`text-lg font-semibold ${isCorporate ? 'text-white' : 'text-gray-700'}`}
                style={{ fontSize: `${customizations.titleFontSize}px` }}
              >
                #{invoice.invoiceNumber}
              </p>
              <span 
                className={`text-xs px-2 py-1 rounded ${isCorporate ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}
                style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.8)}px` }}
              >
                ID: {invoice.invoiceNumber}
              </span>
            </div>
          </div>
          
          {/* Company branding */}
          <div className={`${isElegant || customizations.logoPosition === 'top-center' ? 'text-center' : 'text-right'} ${isCorporate ? 'text-white' : 'text-gray-600'}`}>
            <div className={`flex items-center ${isElegant || customizations.logoPosition === 'top-center' ? 'justify-center' : 'justify-end'} mb-3`}>
              <img 
                src={customizations.logoUrl} 
                alt="Company Logo"
                className={`object-contain ${isCorporate ? 'bg-white/10 p-1 rounded' : ''}`}
                style={{ 
                  height: `${customizations.logoSize}px`,
                  maxWidth: `${customizations.logoSize * 2}px`
                }}
              />
            </div>
            <div className={`space-y-1 ${isElegant || customizations.logoPosition === 'top-center' ? 'text-center' : 'text-right'}`}>
              <h2 
                className={`font-bold ${isCorporate ? 'text-white' : ''}`}
                style={{ 
                  color: isCorporate ? '#ffffff' : customizations.primaryColor,
                  fontSize: `${customizations.titleFontSize}px`
                }}
              >
                {customizations.companyName}
              </h2>
              {customizations.companyAddress.split('\n').map((line, index) => (
                <p 
                  key={index} 
                  className="text-sm"
                  style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}
                >
                  {line}
                </p>
              ))}
              <div className="flex flex-col text-xs mt-2 space-y-1">
                <span style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.8)}px` }}>
                  📞 {customizations.companyPhone}
                </span>
                <span style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.8)}px` }}>
                  📧 {customizations.companyEmail}
                </span>
                <span style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.8)}px` }}>
                  🌐 {customizations.companyWebsite}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // PDF generation function
  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF(
        customizations.pageLayout === 'landscape' ? 'l' : 'p', 
        'mm', 
        customizations.pageLayout.includes('letter') ? 'letter' : 'a4'
      );
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = customizations.pageMargins;
      
      // Helper function to convert hex to RGB
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 26, g: 86, b: 219 };
      };
      
      const primaryRgb = hexToRgb(customizations.primaryColor);
      const secondaryRgb = hexToRgb(customizations.secondaryColor);
      const textRgb = hexToRgb(customizations.textColor);
      
      // Watermark
      if (customizations.showWatermark) {
        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.1);
        pdf.setFontSize(60);
        pdf.setFont('helvetica', 'bold');
        
        const watermarkX = pageWidth / 2;
        const watermarkY = pageHeight / 2;
        
        pdf.saveGraphicsState();
        pdf.setGState(pdf.GState({ opacity: 0.1 }));
        pdf.text(customizations.watermarkText, watermarkX, watermarkY, {
          align: 'center',
          angle: 45
        });
        pdf.restoreGraphicsState();
      }
      
      // Page border
      if (customizations.showBorders) {
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        if (customizations.roundedCorners) {
          pdf.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 3, 3);
        } else {
          pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
        }
      }
      
      // Header background
      const headerHeight = customizations.headerHeight;
      if (customizations.template === 'corporate') {
        pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        if (customizations.roundedCorners) {
          pdf.roundedRect(margin/2, margin/2, pageWidth - margin, headerHeight, 2, 2, 'F');
        } else {
          pdf.rect(margin/2, margin/2, pageWidth - margin, headerHeight, 'F');
        }
      } else {
        pdf.setFillColor(248, 250, 252);
        if (customizations.roundedCorners) {
          pdf.roundedRect(margin/2, margin/2, pageWidth - margin, headerHeight, 2, 2, 'F');
        } else {
          pdf.rect(margin/2, margin/2, pageWidth - margin, headerHeight, 'F');
      }
      
      // Header border
      pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.setLineWidth(1.5);
      if (customizations.roundedCorners) {
        pdf.roundedRect(margin/2, margin/2, pageWidth - margin, headerHeight, 2, 2);
      } else {
        pdf.rect(margin/2, margin/2, pageWidth - margin, headerHeight);
      }
      
      let currentY = margin;
      
      // Company Logo
      pdf.setFillColor(255, 255, 255);
      const logoSize = customizations.logoSize / 3;
      const logoX = customizations.logoPosition === 'top-right' ? pageWidth - margin - logoSize - 5 : margin + 5;
      const logoY = currentY + 5;
      
      if (customizations.roundedCorners) {
        pdf.roundedRect(logoX, logoY, logoSize, logoSize * 0.6, 1, 1, 'F');
      } else {
        pdf.rect(logoX, logoY, logoSize, logoSize * 0.6, 'F');
      }
      
      pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.setLineWidth(1);
      if (customizations.roundedCorners) {
        pdf.roundedRect(logoX, logoY, logoSize, logoSize * 0.6, 1, 1);
      } else {
        pdf.rect(logoX, logoY, logoSize, logoSize * 0.6);
      }
      
      // Logo text
      pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.setFontSize(Math.floor(customizations.baseFontSize * 1.2));
      pdf.setFont('helvetica', 'bold');
      const logoTextLines = customizations.companyName.split(' ');
      logoTextLines.forEach((line, index) => {
        pdf.text(line, logoX + logoSize/2, logoY + 8 + (index * 4), { align: 'center' });
      });
      
      // Company information
      const companyInfoX = customizations.logoPosition === 'top-right' ? pageWidth - margin : margin;
      const companyInfoAlign = customizations.logoPosition === 'top-right' ? 'right' : 'left';
      
      pdf.setTextColor(customizations.template === 'corporate' ? 255 : textRgb.r, 
                      customizations.template === 'corporate' ? 255 : textRgb.g, 
                      customizations.template === 'corporate' ? 255 : textRgb.b);
      pdf.setFontSize(Math.floor(customizations.titleFontSize * 1.2));
      pdf.setFont('helvetica', 'bold');
      pdf.text(customizations.companyName, companyInfoX, currentY + 12, { align: companyInfoAlign });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.9));
      const addressLines = customizations.companyAddress.split('\n');
      addressLines.forEach((line, index) => {
        if (line.trim()) {
          pdf.text(line.trim(), companyInfoX, currentY + 18 + (index * 4), { align: companyInfoAlign });
        }
      });
      
      const contactY = currentY + 18 + (addressLines.length * 4) + 2;
      pdf.text(`📞 ${customizations.companyPhone}  📧 ${customizations.companyEmail}`, companyInfoX, contactY, { align: companyInfoAlign });
      pdf.text(`🌐 ${customizations.companyWebsite}`, companyInfoX, contactY + 4, { align: companyInfoAlign });
      
      // Invoice title and number
      const titleX = customizations.logoPosition === 'top-right' ? margin : pageWidth - margin;
      const titleAlign = customizations.logoPosition === 'top-right' ? 'left' : 'right';
      
      pdf.setTextColor(customizations.template === 'corporate' ? 255 : primaryRgb.r, 
                      customizations.template === 'corporate' ? 255 : primaryRgb.g, 
                      customizations.template === 'corporate' ? 255 : primaryRgb.b);
      pdf.setFontSize(customizations.headerFontSize);
      pdf.setFont('helvetica', customizations.boldHeaders ? 'bold' : 'normal');
      const invoiceTitle = customizations.uppercaseTitles ? 'INVOICE' : 'Invoice';
      pdf.text(invoiceTitle, titleX, currentY + 25, { align: titleAlign });
      
      // Invoice ID
      pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.7));
      pdf.setTextColor(120, 120, 120);
      pdf.text(`ID: ${invoice.invoiceNumber}`, titleX, currentY + 15, { align: titleAlign });
      
      // Main invoice number
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      pdf.setFontSize(customizations.titleFontSize);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`#${invoice.invoiceNumber}`, titleX, currentY + 35, { align: titleAlign });
      
      currentY = headerHeight + margin + 10;
      
      // Separator line
      pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.setLineWidth(0.8);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += customizations.sectionSpacing;
      
      // Two-column layout for client and invoice details
      const leftColumnX = margin;
      const rightColumnX = pageWidth / 2 + 5;
      
      // Bill To section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(customizations.baseFontSize);
      pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.text('BILL TO:', leftColumnX, currentY);
      
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      pdf.setFont('helvetica', customizations.boldHeaders ? 'bold' : 'normal');
      pdf.setFontSize(customizations.baseFontSize);
      pdf.text(invoice.clientName, leftColumnX, currentY + 6);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.9));
      let addressY = currentY + 11;
      
      if (invoice.clientAddress) {
        const clientAddressLines = invoice.clientAddress.split(',');
        clientAddressLines.forEach(line => {
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
      }
      
      // Invoice details section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(customizations.baseFontSize);
      pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.text('INVOICE DETAILS:', rightColumnX, currentY);
      
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.9));
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
        pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
        detailCurrentY += 5;
      });
      
      // Policy information
      if (invoice.policyNumber) {
        detailCurrentY += 3;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(customizations.baseFontSize);
        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.text('POLICY INFO:', rightColumnX, detailCurrentY);
        
        pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.9));
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
      currentY = Math.max(addressY, detailCurrentY) + customizations.sectionSpacing;
      
      // Table header
      const tableHeaderHeight = customizations.tableRowHeight + 2;
      pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      if (customizations.roundedCorners) {
        pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), tableHeaderHeight, 1, 1, 'F');
      } else {
        pdf.rect(margin, currentY, pageWidth - (margin * 2), tableHeaderHeight, 'F');
      }
      
      if (customizations.showBorders) {
        pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.setLineWidth(1);
        if (customizations.roundedCorners) {
          pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), tableHeaderHeight, 1, 1);
        } else {
          pdf.rect(margin, currentY, pageWidth - (margin * 2), tableHeaderHeight);
        }
      }
      
      // Table column positions
      const colWidth = (pageWidth - (margin * 2)) / 5;
      const col1X = margin + 2;
      const col2X = margin + colWidth + 2;
      const col3X = margin + (colWidth * 2) + 2;
      const col4X = margin + (colWidth * 3) + 2;
      const col5X = margin + (colWidth * 4) + 2;
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.9));
      
      pdf.text('DESCRIPTION', col1X, currentY + 7);
      pdf.text('QTY', col2X, currentY + 7, { align: 'center' });
      pdf.text('UNIT PRICE', col3X, currentY + 7, { align: 'center' });
      pdf.text('TAX', col4X, currentY + 7, { align: 'center' });
      pdf.text('TOTAL', col5X, currentY + 7, { align: 'center' });
      
      currentY += tableHeaderHeight;
      
      // Table items
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.9));
      
      const rowHeight = customizations.tableRowHeight;
      invoice.items.forEach((item, index) => {
        if (currentY > pageHeight - 70) {
          pdf.addPage();
          currentY = 25;
        }
        
        // Alternate row background
        if (index % 2 === 1) {
          pdf.setFillColor(248, 249, 250);
          if (customizations.roundedCorners) {
            pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), rowHeight, 0.5, 0.5, 'F');
          } else {
            pdf.rect(margin, currentY, pageWidth - (margin * 2), rowHeight, 'F');
          }
        }
        
        // Row border
        if (customizations.showBorders) {
          pdf.setDrawColor(230, 230, 230);
          pdf.setLineWidth(0.2);
          pdf.line(margin, currentY, pageWidth - margin, currentY);
        }
        
        const itemY = currentY + 6;
        
        // Description
        const maxDescWidth = colWidth - 4;
        const descLines = pdf.splitTextToSize(item.description, maxDescWidth);
        pdf.text(descLines[0], col1X, itemY);
        
        // Quantity
        pdf.text(item.quantity.toString(), col2X + (colWidth/2), itemY, { align: 'center' });
        
        // Unit price
        pdf.text(formatCurrency(item.unitPrice), col3X + (colWidth/2), itemY, { align: 'center' });
        
        // Tax
        pdf.text(formatCurrency(item.tax), col4X + (colWidth/2), itemY, { align: 'center' });
        
        // Total
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatCurrency(item.total), col5X + (colWidth/2), itemY, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        
        currentY += rowHeight;
      });
      
      // Table bottom border
      if (customizations.showBorders) {
        pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.setLineWidth(1);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
      }
      
      // Summary section
      currentY += customizations.sectionSpacing;
      const summaryBoxX = pageWidth - 75;
      const summaryBoxY = currentY - 3;
      const summaryBoxWidth = 70;
      const summaryBoxHeight = 45;
      
      // Summary box styling
      pdf.setFillColor(252, 252, 252);
      if (customizations.roundedCorners) {
        pdf.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 2, 2, 'F');
      } else {
        pdf.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 'F');
      }
      
      if (customizations.showBorders) {
        pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.setLineWidth(0.8);
        if (customizations.roundedCorners) {
          pdf.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 2, 2);
        } else {
          pdf.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight);
        }
      }
      
      const summaryX = summaryBoxX + 3;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.9));
      
      // Subtotal
      pdf.text('Subtotal:', summaryX, currentY);
      pdf.text(formatCurrency(invoice.subtotal), pageWidth - margin - 3, currentY, { align: 'right' });
      currentY += 5;
      
      // Discount
      if (invoice.discount > 0) {
        pdf.text('Discount:', summaryX, currentY);
        pdf.setTextColor(220, 20, 60);
        pdf.text(`-${formatCurrency(invoice.discount)}`, pageWidth - margin - 3, currentY, { align: 'right' });
        pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
        currentY += 5;
      }
      
      // Tax
      pdf.text('Tax:', summaryX, currentY);
      pdf.text(formatCurrency(invoice.tax), pageWidth - margin - 3, currentY, { align: 'right' });
      currentY += 6;
      
      // Total separator line
      if (customizations.showBorders) {
        pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.setLineWidth(0.6);
        pdf.line(summaryX, currentY - 1, pageWidth - margin - 3, currentY - 1);
      }
      
      // Total amount
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(customizations.baseFontSize);
      pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.text('TOTAL:', summaryX, currentY);
      pdf.text(formatCurrency(invoice.total), pageWidth - margin - 3, currentY, { align: 'right' });
      currentY += 6;
      
      // Payment status
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.9));
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      pdf.text('Amount Paid:', summaryX, currentY);
      pdf.text(formatCurrency(getPaidAmount()), pageWidth - margin - 3, currentY, { align: 'right' });
      currentY += 5;
      
      // Balance due
      const balanceDue = getRemainingBalance();
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(Math.floor(customizations.baseFontSize * 1.1));
      
      if (invoice.status === 'paid') {
        pdf.setTextColor(0, 150, 0);
      } else if (balanceDue > 0) {
        pdf.setTextColor(220, 20, 60);
      }
      
      pdf.text('Balance Due:', summaryX, currentY);
      pdf.text(formatCurrency(balanceDue), pageWidth - margin - 3, currentY, { align: 'right' });
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      
      currentY += 15;
      
      // Notes and terms section
      if (invoice.notes || invoice.paymentTerms) {
        if (currentY > pageHeight - customizations.footerHeight - 20) {
          pdf.addPage();
          currentY = 25;
        }
        
        if (invoice.notes) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(Math.floor(customizations.baseFontSize * 1.1));
          pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          pdf.text('NOTES & REMARKS:', margin, currentY);
          currentY += 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.9));
          pdf.setTextColor(60, 60, 60);
          const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - (margin * 2));
          notesLines.forEach(line => {
            pdf.text(line, margin, currentY);
            currentY += Math.floor(customizations.lineHeight * 4);
          });
          currentY += 4;
        }
        
        if (invoice.paymentTerms) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(Math.floor(customizations.baseFontSize * 1.1));
          pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          pdf.text('PAYMENT TERMS & CONDITIONS:', margin, currentY);
          currentY += 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.9));
          pdf.setTextColor(60, 60, 60);
          const termsLines = pdf.splitTextToSize(invoice.paymentTerms, pageWidth - (margin * 2));
          termsLines.forEach(line => {
            pdf.text(line, margin, currentY);
            currentY += Math.floor(customizations.lineHeight * 4);
          });
        }
      }
      
      // Footer section
      const footerY = pageHeight - customizations.footerHeight;
      
      // Footer separator
      if (customizations.showBorders) {
        pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.setLineWidth(0.4);
        pdf.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
      }
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(Math.floor(customizations.baseFontSize * 1.1));
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Thank you for choosing ${customizations.companyName}!`, pageWidth / 2, footerY, { align: 'center' });
      
      if (invoice.agentName) {
        pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.8));
        pdf.text(`Your dedicated insurance representative: ${invoice.agentName}`, pageWidth / 2, footerY + 4, { align: 'center' });
      }
      
      // Page number
      if (customizations.showPageNumbers) {
        pdf.setFontSize(Math.floor(customizations.baseFontSize * 0.7));
        pdf.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | Page 1 of 1`, pageWidth - margin, footerY + 6, { align: 'right' });
      }
      
      // Save the PDF
      pdf.save(`${customizations.companyName.replace(/\s+/g, '-')}-Invoice-${invoice.invoiceNumber}.pdf`);
      toast.success('Advanced PDF generated successfully!');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  // Print functionality
  const handlePrint = () => {
    const printContent = document.getElementById('invoice-container');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber}</title>
          <style>
            body { 
              font-family: ${customizations.fontFamily}, Arial, sans-serif; 
              margin: 0; 
              padding: 0; 
              font-size: ${customizations.baseFontSize}px;
              line-height: ${customizations.lineHeight};
              color: ${customizations.textColor};
            }
            .page-header {
              padding: 20px;
              border-bottom: 1px solid #ddd;
              margin-bottom: 20px;
              background-color: ${customizations.template === 'corporate' ? customizations.primaryColor : '#ffffff'};
              color: ${customizations.template === 'corporate' ? '#ffffff' : customizations.textColor};
            }
            .page-footer {
              text-align: center;
              padding: 10px;
              border-top: 1px solid #ddd;
              font-size: ${Math.floor(customizations.baseFontSize * 0.9)}px;
              margin-top: 20px;
              position: fixed;
              bottom: 0;
              width: 100%;
              background: white;
            }
            table { width: 100%; border-collapse: collapse; }
            th { 
              background-color: ${customizations.primaryColor}; 
              color: white;
              text-align: left; 
              padding: 8px; 
              font-size: ${Math.floor(customizations.baseFontSize * 0.9)}px;
            }
            td { 
              border-bottom: 1px solid #ddd; 
              padding: 8px; 
              font-size: ${Math.floor(customizations.baseFontSize * 0.9)}px;
            }
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
                <h1 style="font-size: ${customizations.headerFontSize}px; font-weight: ${customizations.boldHeaders ? 'bold' : 'normal'};">INVOICE</h1>
                <p>#${invoice.invoiceNumber}</p>
              </div>
              <div style="text-align: right;">
                <img src="${customizations.logoUrl}" alt="Company Logo" style="height: ${customizations.logoSize}px; max-width: 200px; background: white; padding: 5px; border-radius: 5px;" />
                <p>${customizations.companyName}</p>
                ${customizations.companyAddress.split('\n').map(line => `<p>${line}</p>`).join('')}
                <p>${customizations.companyEmail}</p>
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
            onClick={() => {
              const invoiceElement = document.getElementById('invoice-container');
              if (invoiceElement) {
                const content = `
                  <html>
                    <head>
                      <title>Invoice ${invoice.invoiceNumber}</title>
                      <style>
                        body { 
                          font-family: ${customizations.fontFamily}, Arial, sans-serif; 
                          margin: 0; 
                          padding: 20px; 
                          font-size: ${customizations.baseFontSize}px;
                          line-height: ${customizations.lineHeight};
                          color: ${customizations.textColor};
                          background-color: ${customizations.backgroundColor};
                        }
                        .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: ${customizations.primaryColor}; color: white; }
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
            }}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Download HTML
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              try {
                if (navigator.share) {
                  navigator.share({
                    title: `Invoice #${invoice.invoiceNumber}`,
                    text: `Invoice from ${customizations.companyName} for ${formatCurrency(invoice.total)}`,
                    url: window.location.href
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
            }}
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
          {showCustomizer ? 'Hide Customizer' : 'Advanced Customizer'}
        </Button>
      </div>
      
      {showCustomizer && (
        <InvoiceCustomizer
          customizations={customizations}
          onCustomizationChange={handleCustomizationChange}
          onLogoChange={handleLogoChange}
          onResetCustomizations={resetCustomizations}
        />
      )}
      
      <div 
        id="invoice-container" 
        ref={invoiceRef} 
        className={currentTemplate.className}
        style={{
          fontFamily: customizations.fontFamily,
          fontSize: `${customizations.baseFontSize}px`,
          lineHeight: customizations.lineHeight,
          color: customizations.textColor,
          backgroundColor: customizations.backgroundColor
        }}
      >
        {/* Render advanced header for all templates */}
        {renderAdvancedHeader()}
        
        {/* Content */}
        <div className={currentTemplate.contentClass} style={{ marginTop: `${customizations.sectionSpacing}px` }}>
          <div>
            <h3 
              className="font-bold text-gray-700 mb-2"
              style={{ 
                color: customizations.primaryColor, 
                fontSize: `${customizations.titleFontSize}px`,
                fontWeight: customizations.boldHeaders ? 'bold' : 'normal'
              }}
            >
              Bill To:
            </h3>
            <p className="font-medium" style={{ fontSize: `${customizations.baseFontSize}px` }}>{invoice.clientName}</p>
            <p style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}>{invoice.clientAddress}</p>
            <p style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}>{invoice.clientEmail}</p>
            <p style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}>{invoice.clientPhone}</p>
            {invoice.customFields?.["GST Number"] && (
              <p style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}>GST: {invoice.customFields["GST Number"]}</p>
            )}
          </div>
          
          <div>
            <h3 
              className="font-bold text-gray-700 mb-2"
              style={{ 
                color: customizations.primaryColor, 
                fontSize: `${customizations.titleFontSize}px`,
                fontWeight: customizations.boldHeaders ? 'bold' : 'normal'
              }}
            >
              Invoice Details:
            </h3>
            <p style={{ fontSize: `${customizations.baseFontSize}px` }}>
              <span className="font-semibold">Issue Date:</span> {formatInvoiceDateForDisplay(invoice.issueDate)}
            </p>
            <p style={{ fontSize: `${customizations.baseFontSize}px` }}>
              <span className="font-semibold">Due Date:</span> {formatInvoiceDateForDisplay(invoice.dueDate)}
            </p>
            <p style={{ fontSize: `${customizations.baseFontSize}px` }}>
              <span className="font-semibold">Status:</span> <span className="capitalize">{invoice.status}</span>
            </p>
            {invoice.paymentMethod && (
              <p style={{ fontSize: `${customizations.baseFontSize}px` }}>
                <span className="font-semibold">Payment Method:</span> {invoice.paymentMethod}
              </p>
            )}
          </div>
          
          {invoice.policyNumber && (
            <div>
              <h3 
                className="font-bold text-gray-700 mb-2"
                style={{ 
                  color: customizations.primaryColor, 
                  fontSize: `${customizations.titleFontSize}px`,
                  fontWeight: customizations.boldHeaders ? 'bold' : 'normal'
                }}
              >
                Policy Details:
              </h3>
              <p style={{ fontSize: `${customizations.baseFontSize}px` }}>
                <span className="font-semibold">Policy Number:</span> {invoice.policyNumber}
              </p>
              <p style={{ fontSize: `${customizations.baseFontSize}px` }}>
                <span className="font-semibold">Insurance Type:</span> {invoice.insuranceType}
              </p>
              <p style={{ fontSize: `${customizations.baseFontSize}px` }}>
                <span className="font-semibold">Period:</span> {invoice.premiumPeriod}
              </p>
            </div>
          )}
        </div>
        
        {/* Invoice Items Table */}
        <div className={currentTemplate.tableClass} style={{ marginTop: `${customizations.sectionSpacing}px` }}>
          <Table>
            <TableHeader>
              <TableRow 
                style={{ 
                  backgroundColor: customizations.primaryColor,
                  color: '#ffffff'
                }}
              >
                <TableHead style={{ color: '#ffffff', fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}>Description</TableHead>
                <TableHead className="text-right" style={{ color: '#ffffff', fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}>Qty</TableHead>
                <TableHead className="text-right" style={{ color: '#ffffff', fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}>Unit Price</TableHead>
                <TableHead className="text-right" style={{ color: '#ffffff', fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}>Tax</TableHead>
                <TableHead className="text-right" style={{ color: '#ffffff', fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow 
                  key={index}
                  style={{ 
                    backgroundColor: index % 2 === 1 ? '#f8f9fa' : 'transparent',
                    minHeight: `${customizations.tableRowHeight * 4}px`
                  }}
                >
                  <TableCell 
                    className="font-medium" 
                    style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}
                  >
                    {item.description}
                  </TableCell>
                  <TableCell 
                    className="text-right" 
                    style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}
                  >
                    {item.quantity}
                  </TableCell>
                  <TableCell 
                    className="text-right" 
                    style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}
                  >
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell 
                    className="text-right" 
                    style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}
                  >
                    {formatCurrency(item.tax)}
                  </TableCell>
                  <TableCell 
                    className="text-right" 
                    style={{ fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px` }}
                  >
                    {formatCurrency(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 flex justify-end">
            <div className="w-full md:w-1/2">
              <div 
                className={`space-y-2 p-4 ${customizations.showBorders ? 'border' : ''} ${customizations.roundedCorners ? 'rounded-lg' : ''}`}
                style={{ 
                  backgroundColor: '#fcfcfc',
                  borderColor: customizations.primaryColor
                }}
              >
                <div className="flex justify-between" style={{ fontSize: `${customizations.baseFontSize}px` }}>
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between" style={{ fontSize: `${customizations.baseFontSize}px` }}>
                    <span>Discount:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between" style={{ fontSize: `${customizations.baseFontSize}px` }}>
                  <span>Tax:</span>
                  <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                </div>
                <div 
                  className={`flex justify-between pt-2 ${customizations.showBorders ? 'border-t' : ''}`}
                  style={{ 
                    borderColor: customizations.primaryColor,
                    fontSize: `${Math.floor(customizations.baseFontSize * 1.1)}px`
                  }}
                >
                  <span className="font-bold">Total:</span>
                  <span className="font-bold" style={{ color: customizations.primaryColor }}>
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
                <div className="flex justify-between" style={{ fontSize: `${customizations.baseFontSize}px` }}>
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(getPaidAmount())}</span>
                </div>
                <div 
                  className={`flex justify-between ${invoice.status === 'paid' ? 'text-green-600' : 'text-red-600'} font-bold`}
                  style={{ fontSize: `${customizations.baseFontSize}px` }}
                >
                  <span>Balance Due:</span>
                  <span>{formatCurrency(getRemainingBalance())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div 
          className={currentTemplate.footerClass}
          style={{ 
            marginTop: `${customizations.sectionSpacing}px`,
            paddingTop: `${customizations.sectionSpacing/4}px`,
            minHeight: `${customizations.footerHeight}px`
          }}
        >
          {invoice.notes && (
            <div className="mb-6">
              <h4 
                className="font-semibold mb-1"
                style={{ 
                  color: customizations.primaryColor,
                  fontSize: `${customizations.titleFontSize}px`,
                  fontWeight: customizations.boldHeaders ? 'bold' : 'normal'
                }}
              >
                Notes
              </h4>
              <p 
                className="text-gray-700"
                style={{ 
                  fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px`,
                  lineHeight: customizations.lineHeight
                }}
              >
                {invoice.notes}
              </p>
            </div>
          )}
          
          {invoice.paymentTerms && (
            <div className="mb-6">
              <h4 
                className="font-semibold mb-1"
                style={{ 
                  color: customizations.primaryColor,
                  fontSize: `${customizations.titleFontSize}px`,
                  fontWeight: customizations.boldHeaders ? 'bold' : 'normal'
                }}
              >
                Payment Terms
              </h4>
              <p 
                className="text-gray-700"
                style={{ 
                  fontSize: `${Math.floor(customizations.baseFontSize * 0.9)}px`,
                  lineHeight: customizations.lineHeight
                }}
              >
                {invoice.paymentTerms}
              </p>
            </div>
          )}
          
          {customizations.template !== 'minimal' && (
            <div 
              className={`text-center w-full pt-4 mt-8 ${customizations.showBorders ? 'border-t' : ''} text-gray-600`}
              style={{ 
                borderColor: customizations.primaryColor,
                fontSize: `${customizations.baseFontSize}px`
              }}
            >
              <p>Thank you for choosing {customizations.companyName}!</p>
              {invoice.agentName && (
                <p className="mt-1">Your insurance representative: {invoice.agentName}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Watermark overlay for screen view */}
        {customizations.showWatermark && customizations.template !== 'creative' && (
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"
            style={{ 
              fontSize: '120px', 
              fontWeight: 'bold',
              transform: 'rotate(-45deg)',
              color: customizations.primaryColor,
              zIndex: -1
            }}
          >
            {customizations.watermarkText}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;
