
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, Share2, Eye, EyeOff, Mail, MessageSquare, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ProfessionalInvoiceTemplate from './ProfessionalInvoiceTemplate';

const InvoicePreview = ({ invoice }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const invoiceRef = useRef(null);
  const { toast } = useToast();

  // Fallback invoice data
  const defaultInvoice = {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    clientName: 'Sample Client',
    clientEmail: 'client@example.com',
    clientPhone: '+91 98765 43210',
    clientAddress: '123 Sample Street, Mumbai, Maharashtra 400001',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { description: 'Health Insurance Premium', quantity: 1, unitPrice: 5000, tax: 900, total: 5900 },
      { description: 'Processing Fee', quantity: 1, unitPrice: 500, tax: 90, total: 590 }
    ],
    subtotal: 5500,
    discount: 0,
    tax: 990,
    total: 6490,
    paymentTerms: 'Due on Receipt'
  };

  const invoiceData = invoice || defaultInvoice;

  const generatePDFBlob = async () => {
    if (!invoiceRef.current) return null;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight
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
      return pdf;
    } catch (error) {
      console.error('PDF generation error:', error);
      return null;
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = await generatePDFBlob();
      if (pdf) {
        pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
        toast({
          title: "PDF Generated",
          description: "Invoice PDF has been downloaded successfully.",
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
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

  const handlePrint = async () => {
    try {
      const pdf = await generatePDFBlob();
      if (pdf) {
        const pdfBlob = pdf.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(url);
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
            URL.revokeObjectURL(url);
          };
        }
        toast({
          title: "Print Ready",
          description: "Invoice is ready for printing.",
        });
      }
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Error",
        description: "Failed to prepare invoice for printing.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    setShowSharePopup(true);
  };

  const handleEmailShare = () => {
    const invoiceText = `Invoice ${invoiceData.invoiceNumber} for ${invoiceData.clientName}
Amount: ₹${invoiceData.total}
Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}

Client Details:
${invoiceData.clientName}
${invoiceData.clientPhone}
${invoiceData.clientEmail}`;

    const emailSubject = encodeURIComponent(`Invoice ${invoiceData.invoiceNumber} - ${invoiceData.clientName}`);
    const emailBody = encodeURIComponent(invoiceText);
    const emailUrl = `mailto:${invoiceData.clientEmail}?subject=${emailSubject}&body=${emailBody}`;
    
    window.open(emailUrl, '_blank');
    setShowSharePopup(false);
    toast({
      title: "Email Opened",
      description: "Email client opened with invoice details.",
    });
  };

  const handleWhatsAppShare = () => {
    const invoiceText = `Invoice ${invoiceData.invoiceNumber} for ${invoiceData.clientName}
Amount: ₹${invoiceData.total}
Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}

Client Details:
${invoiceData.clientName}
${invoiceData.clientPhone}
${invoiceData.clientEmail}`;

    const whatsappText = encodeURIComponent(invoiceText);
    const whatsappPhone = invoiceData.clientPhone?.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappText}`;
    
    window.open(whatsappUrl, '_blank');
    setShowSharePopup(false);
    toast({
      title: "WhatsApp Opened",
      description: "WhatsApp opened with invoice details.",
    });
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
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 p-2 sm:p-4">
            <div className="bg-white shadow-lg mx-auto overflow-hidden" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
              <div ref={invoiceRef} className="w-full">
                <ProfessionalInvoiceTemplate 
                  invoice={invoiceData}
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

        {/* Share Popup */}
        {showSharePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Share Invoice</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSharePopup(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600 mb-6">
                Share invoice {invoiceData.invoiceNumber} with {invoiceData.clientName}
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={handleEmailShare}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send via Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleWhatsAppShare}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicePreview;
