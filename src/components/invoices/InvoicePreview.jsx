
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Printer, 
  Share, 
  FileText,
  Settings,
  Palette,
  Layout
} from 'lucide-react';
import { toast } from 'sonner';
import InvoiceCustomizer from './InvoiceCustomizer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoicePreview = ({ invoice }) => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizations, setCustomizations] = useState({
    // Layout Settings
    template: 'corporate',
    pageLayout: 'portrait',
    headerStyle: 'banner',
    showWatermark: true,
    showPageNumbers: true,
    
    // Color Settings
    colorPreset: 'Corporate Blue',
    primaryColor: '#1a56db',
    secondaryColor: '#3b82f6',
    accentColor: '#60a5fa',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    
    // Typography Settings
    fontFamily: 'Inter',
    baseFontSize: 12,
    headerFontSize: 24,
    titleFontSize: 16,
    lineHeight: 1.4,
    boldHeaders: true,
    uppercaseTitles: false,
    
    // Spacing Settings
    pageMargins: 20,
    sectionSpacing: 16,
    tableRowHeight: 8,
    headerHeight: 60,
    footerHeight: 25,
    showBorders: true,
    roundedCorners: true,
    
    // Branding Settings
    logoUrl: '/placeholder.svg',
    logoSize: 60,
    logoPosition: 'top-left',
    companyName: 'AMBA INSURANCE SERVICES',
    companyAddress: 'Mumbai Corporate Office\n123 Business District, Bandra Kurla Complex\nMumbai, Maharashtra 400051, India',
    companyPhone: '+91 22 6789 1234',
    companyEmail: 'info@ambainsurance.com',
    companyWebsite: 'www.ambainsurance.com',
    watermarkText: 'CONFIDENTIAL'
  });

  const invoiceRef = useRef();

  const handleCustomizationChange = (field, value) => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomizations(prev => ({
          ...prev,
          logoUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetCustomizations = () => {
    setCustomizations({
      template: 'corporate',
      pageLayout: 'portrait',
      headerStyle: 'banner',
      showWatermark: true,
      showPageNumbers: true,
      colorPreset: 'Corporate Blue',
      primaryColor: '#1a56db',
      secondaryColor: '#3b82f6',
      accentColor: '#60a5fa',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Inter',
      baseFontSize: 12,
      headerFontSize: 24,
      titleFontSize: 16,
      lineHeight: 1.4,
      boldHeaders: true,
      uppercaseTitles: false,
      pageMargins: 20,
      sectionSpacing: 16,
      tableRowHeight: 8,
      headerHeight: 60,
      footerHeight: 25,
      showBorders: true,
      roundedCorners: true,
      logoUrl: '/placeholder.svg',
      logoSize: 60,
      logoPosition: 'top-left',
      companyName: 'AMBA INSURANCE SERVICES',
      companyAddress: 'Mumbai Corporate Office\n123 Business District, Bandra Kurla Complex\nMumbai, Maharashtra 400051, India',
      companyPhone: '+91 22 6789 1234',
      companyEmail: 'info@ambainsurance.com',
      companyWebsite: 'www.ambainsurance.com',
      watermarkText: 'CONFIDENTIAL'
    });
    toast.success('Customizations reset to defaults');
  };

  const generateAdvancedPDF = async () => {
    try {
      const element = invoiceRef.current;
      if (!element) {
        toast.error('Invoice element not found');
        return;
      }

      // Create canvas with high quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: customizations.backgroundColor,
        letterRendering: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: customizations.pageLayout === 'landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - (customizations.pageMargins * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', customizations.pageMargins, customizations.pageMargins, imgWidth, imgHeight);

      // Add watermark if enabled
      if (customizations.showWatermark) {
        pdf.setTextColor(200, 200, 200);
        pdf.setFontSize(50);
        pdf.text(customizations.watermarkText, pageWidth / 2, pageHeight / 2, {
          angle: 45,
          align: 'center'
        });
      }

      // Add page numbers if enabled
      if (customizations.showPageNumbers) {
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(10);
        pdf.text('Page 1 of 1', pageWidth - customizations.pageMargins, pageHeight - 10, {
          align: 'right'
        });
      }

      const fileName = `${customizations.companyName.replace(/\s+/g, '-')}-Invoice-${invoice.invoiceNumber}.pdf`;
      pdf.save(fileName);
      toast.success('Advanced PDF generated successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.invoiceNumber}`,
        text: `Invoice from ${customizations.companyName}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderHeader = () => {
    const headerStyle = {
      backgroundColor: customizations.primaryColor,
      color: 'white',
      padding: `${customizations.headerHeight / 4}mm`,
      borderRadius: customizations.roundedCorners ? '8px 8px 0 0' : '0'
    };

    return (
      <div style={headerStyle} className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(45deg, ${customizations.secondaryColor} 25%, transparent 25%), 
                               linear-gradient(-45deg, ${customizations.secondaryColor} 25%, transparent 25%),
                               linear-gradient(45deg, transparent 75%, ${customizations.secondaryColor} 75%),
                               linear-gradient(-45deg, transparent 75%, ${customizations.secondaryColor} 75%)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          ></div>
        </div>

        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src={customizations.logoUrl} 
              alt="Company Logo" 
              style={{ 
                height: `${customizations.logoSize}px`,
                width: 'auto',
                maxWidth: '150px',
                objectFit: 'contain'
              }}
              className="bg-white p-2 rounded"
            />
            <div>
              <h1 
                style={{ 
                  fontSize: `${customizations.headerFontSize}px`,
                  fontFamily: customizations.fontFamily,
                  fontWeight: customizations.boldHeaders ? 'bold' : 'normal',
                  textTransform: customizations.uppercaseTitles ? 'uppercase' : 'none',
                  lineHeight: customizations.lineHeight,
                  letterSpacing: '0.5px'
                }}
                className="mb-1"
              >
                {customizations.companyName}
              </h1>
              <div 
                style={{ 
                  fontSize: `${customizations.baseFontSize}px`,
                  fontFamily: customizations.fontFamily,
                  lineHeight: customizations.lineHeight,
                  opacity: 0.9
                }}
              >
                {customizations.companyAddress.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div 
              style={{ 
                fontSize: `${customizations.titleFontSize + 4}px`,
                fontFamily: customizations.fontFamily,
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
              className="mb-2"
            >
              INVOICE
            </div>
            <div 
              style={{ 
                fontSize: `${customizations.baseFontSize - 1}px`,
                fontFamily: customizations.fontFamily,
                opacity: 0.8
              }}
              className="bg-white/20 px-2 py-1 rounded text-xs"
            >
              ID: {invoice.invoiceNumber}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInvoiceContent = () => {
    const contentStyle = {
      fontFamily: customizations.fontFamily,
      fontSize: `${customizations.baseFontSize}px`,
      lineHeight: customizations.lineHeight,
      color: customizations.textColor,
      letterSpacing: '0.2px'
    };

    return (
      <div style={contentStyle} className={`p-${customizations.sectionSpacing / 4}`}>
        {/* Invoice Details Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 
              style={{ 
                fontSize: `${customizations.titleFontSize}px`,
                fontWeight: customizations.boldHeaders ? 'bold' : 'normal',
                color: customizations.primaryColor,
                marginBottom: `${customizations.sectionSpacing / 2}px`
              }}
            >
              BILL TO
            </h3>
            <div className="space-y-1">
              <p style={{ fontWeight: '600', fontSize: `${customizations.baseFontSize + 1}px` }}>
                {invoice.clientName}
              </p>
              <p>{invoice.clientEmail}</p>
              <p>{invoice.clientPhone}</p>
              <p className="whitespace-pre-line">{invoice.clientAddress}</p>
              {invoice.customFields?.["GST Number"] && (
                <p><strong>GST:</strong> {invoice.customFields["GST Number"]}</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Invoice Number:</span>
                <span style={{ fontWeight: '600' }}>{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Issue Date:</span>
                <span>{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Due Date:</span>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status?.toUpperCase()}
                </Badge>
              </div>
              {invoice.policyNumber && (
                <div className="flex justify-between">
                  <span className="font-medium">Policy:</span>
                  <span>{invoice.policyNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Items Table */}
        <div className="mb-8">
          <h3 
            style={{ 
              fontSize: `${customizations.titleFontSize}px`,
              fontWeight: customizations.boldHeaders ? 'bold' : 'normal',
              color: customizations.primaryColor,
              marginBottom: `${customizations.sectionSpacing / 2}px`
            }}
          >
            INVOICE DETAILS
          </h3>
          
          <div 
            className={`overflow-hidden ${customizations.roundedCorners ? 'rounded-lg' : ''}`}
            style={{ border: customizations.showBorders ? `1px solid ${customizations.primaryColor}20` : 'none' }}
          >
            <table className="w-full">
              <thead>
                <tr 
                  style={{ 
                    backgroundColor: `${customizations.primaryColor}15`,
                    height: `${customizations.tableRowHeight + 2}mm`
                  }}
                >
                  <th 
                    className="text-left p-3"
                    style={{ 
                      fontSize: `${customizations.baseFontSize}px`,
                      fontWeight: customizations.boldHeaders ? 'bold' : '600',
                      color: customizations.primaryColor
                    }}
                  >
                    Description
                  </th>
                  <th 
                    className="text-center p-3"
                    style={{ 
                      fontSize: `${customizations.baseFontSize}px`,
                      fontWeight: customizations.boldHeaders ? 'bold' : '600',
                      color: customizations.primaryColor
                    }}
                  >
                    Quantity
                  </th>
                  <th 
                    className="text-right p-3"
                    style={{ 
                      fontSize: `${customizations.baseFontSize}px`,
                      fontWeight: customizations.boldHeaders ? 'bold' : '600',
                      color: customizations.primaryColor
                    }}
                  >
                    Rate
                  </th>
                  <th 
                    className="text-right p-3"
                    style={{ 
                      fontSize: `${customizations.baseFontSize}px`,
                      fontWeight: customizations.boldHeaders ? 'bold' : '600',
                      color: customizations.primaryColor
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr 
                    key={index}
                    style={{ 
                      height: `${customizations.tableRowHeight}mm`,
                      borderBottom: customizations.showBorders ? `1px solid ${customizations.primaryColor}10` : 'none'
                    }}
                  >
                    <td className="p-3">
                      <div>
                        <p style={{ fontWeight: '500' }}>{item.description}</p>
                        {item.details && (
                          <p 
                            style={{ 
                              fontSize: `${customizations.baseFontSize - 1}px`,
                              color: `${customizations.textColor}80`,
                              marginTop: '2px'
                            }}
                          >
                            {item.details}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="text-center p-3">{item.quantity}</td>
                    <td className="text-right p-3">{formatCurrency(item.rate)}</td>
                    <td className="text-right p-3" style={{ fontWeight: '600' }}>
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between py-1">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between py-1 text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              
              <Separator />
              
              <div 
                className="flex justify-between py-2"
                style={{ 
                  fontSize: `${customizations.titleFontSize}px`,
                  fontWeight: 'bold',
                  color: customizations.primaryColor
                }}
              >
                <span>Total Amount:</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Notes */}
        {(invoice.terms || invoice.notes) && (
          <div className="space-y-4">
            <Separator />
            {invoice.terms && (
              <div>
                <h4 
                  style={{ 
                    fontSize: `${customizations.baseFontSize + 1}px`,
                    fontWeight: customizations.boldHeaders ? 'bold' : '600',
                    color: customizations.primaryColor,
                    marginBottom: `${customizations.sectionSpacing / 4}px`
                  }}
                >
                  Terms & Conditions
                </h4>
                <p className="whitespace-pre-line">{invoice.terms}</p>
              </div>
            )}
            
            {invoice.notes && (
              <div>
                <h4 
                  style={{ 
                    fontSize: `${customizations.baseFontSize + 1}px`,
                    fontWeight: customizations.boldHeaders ? 'bold' : '600',
                    color: customizations.primaryColor,
                    marginBottom: `${customizations.sectionSpacing / 4}px`
                  }}
                >
                  Notes
                </h4>
                <p className="whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div 
        className="text-center py-4 border-t"
        style={{ 
          fontSize: `${customizations.baseFontSize - 1}px`,
          color: `${customizations.textColor}70`,
          borderColor: `${customizations.primaryColor}20`,
          height: `${customizations.footerHeight}mm`
        }}
      >
        <div className="flex justify-center items-center space-x-4">
          <span>📞 {customizations.companyPhone}</span>
          <span>✉️ {customizations.companyEmail}</span>
          <span>🌐 {customizations.companyWebsite}</span>
        </div>
        <div className="mt-1 text-xs">
          Thank you for your business with {customizations.companyName}
        </div>
      </div>
    );
  };

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No invoice data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={showCustomizer ? "default" : "outline"}
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="flex items-center"
              >
                <Settings className="mr-2 h-4 w-4" />
                {showCustomizer ? 'Hide' : 'Show'} Customizer
              </Button>
              <Badge variant="outline" className="ml-2">
                Template: {customizations.template}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={generateAdvancedPDF}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
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
                onClick={handleShare}
                className="flex items-center"
              >
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customizer */}
      {showCustomizer && (
        <InvoiceCustomizer
          customizations={customizations}
          onCustomizationChange={handleCustomizationChange}
          onLogoChange={handleLogoChange}
          onResetCustomizations={handleResetCustomizations}
        />
      )}

      {/* Invoice Preview */}
      <Card 
        className="print:shadow-none print:border-0"
        style={{ backgroundColor: customizations.backgroundColor }}
      >
        <CardContent className="p-0">
          <div 
            id="invoice-container"
            ref={invoiceRef}
            className={`
              ${customizations.roundedCorners ? 'rounded-lg' : ''} 
              overflow-hidden print:rounded-none
            `}
            style={{
              fontFamily: customizations.fontFamily,
              backgroundColor: customizations.backgroundColor,
              margin: `${customizations.pageMargins}px`,
              position: 'relative'
            }}
          >
            {/* Watermark */}
            {customizations.showWatermark && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                style={{ 
                  transform: 'rotate(-45deg)',
                  fontSize: '72px',
                  color: `${customizations.textColor}05`,
                  fontWeight: 'bold',
                  letterSpacing: '4px'
                }}
              >
                {customizations.watermarkText}
              </div>
            )}

            <div className="relative z-10">
              {renderHeader()}
              {renderInvoiceContent()}
              {renderFooter()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicePreview;
