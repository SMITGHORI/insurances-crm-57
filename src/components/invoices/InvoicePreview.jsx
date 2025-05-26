
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, Share2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import InvoiceTemplateRenderer from './InvoiceTemplateRenderer';

const InvoicePreview = ({ 
  invoice, 
  customizations = {
    template: 'standard',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#60a5fa',
    backgroundColor: '#ffffff',
    baseFontSize: 14,
    headerFontSize: 24,
    lineHeight: 1.5,
    pageMargins: 20,
    sectionSpacing: 16,
    tableRowHeight: 8,
    headerHeight: 60,
    footerHeight: 30,
    logoSize: 60,
    logoPosition: 'top-left',
    logoUrl: '/placeholder.svg',
    companyName: 'AMBA INSURANCE SERVICES',
    companyAddress: 'Mumbai Corporate Office\n123 Business District, Bandra Kurla Complex\nMumbai, Maharashtra 400051, India',
    companyPhone: '+91 22 6789 1234',
    companyEmail: 'info@ambainsurance.com',
    companyWebsite: 'www.ambainsurance.com',
    watermarkText: 'CONFIDENTIAL',
    showBorders: true,
    roundedCorners: true,
    boldHeaders: true,
    uppercaseTitles: false,
    showWatermark: false,
    showPageNumbers: true
  }
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const invoiceRef = useRef(null);
  const { toast } = useToast();

  // Fallback invoice data
  const defaultInvoice = {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    clientName: 'Sample Client',
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    items: [
      { description: 'Consulting Services', amount: '5000' },
      { description: 'Project Management', amount: '3000' }
    ],
    total: '8000'
  };

  const invoiceData = invoice || defaultInvoice;

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    setIsGeneratingPDF(true);
    
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: customizations.backgroundColor || '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Dialog Opened",
      description: "Please use your browser's print dialog to print the invoice.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoiceData.invoiceNumber}`,
          text: `Invoice for ${invoiceData.clientName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Invoice link has been copied to clipboard.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Invoice Preview</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button 
              onClick={generatePDF} 
              disabled={isGeneratingPDF}
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {showPreview && (
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 p-4">
            <div className="bg-white shadow-lg mx-auto" style={{ maxWidth: '8.5in' }}>
              <div ref={invoiceRef}>
                <InvoiceTemplateRenderer 
                  template={customizations.template || 'standard'}
                  customizations={customizations}
                  invoice={invoiceData}
                  logo={customizations.logoUrl || '/placeholder.svg'}
                />
              </div>
            </div>
          </div>
        )}

        {!showPreview && (
          <div className="text-center py-12 text-gray-500">
            <Eye className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Preview is hidden. Click "Show Preview" to view the invoice.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicePreview;
