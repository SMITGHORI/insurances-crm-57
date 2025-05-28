
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ProfessionalInvoiceTemplate from './ProfessionalInvoiceTemplate';

const InvoicePreview = ({ invoice, onDownload, onPrint, onShare }) => {
  const [showPreview, setShowPreview] = useState(true);
  const invoiceRef = useRef(null);

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

  // Expose PDF generation to parent component
  React.useImperativeHandle(onDownload, () => ({
    generatePDF: async () => {
      const pdf = await generatePDFBlob();
      if (pdf) {
        pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
        return true;
      }
      return false;
    }
  }));

  React.useImperativeHandle(onPrint, () => ({
    printInvoice: async () => {
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
        return true;
      }
      return false;
    }
  }));

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Invoice Preview</h3>
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
        </div>

        {showPreview && (
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
            {/* A4 Container with proper scaling */}
            <div className="w-full overflow-x-auto">
              <div 
                className="bg-white shadow-lg mx-auto"
                style={{ 
                  width: '210mm',
                  minHeight: '297mm',
                  transform: 'scale(0.8)',
                  transformOrigin: 'top center',
                  margin: '0 auto'
                }}
              >
                <div ref={invoiceRef} className="w-full h-full">
                  <ProfessionalInvoiceTemplate 
                    invoice={invoiceData}
                  />
                </div>
              </div>
            </div>
            
            {/* Mobile responsive view */}
            <div className="block md:hidden">
              <div className="bg-white mx-2 my-4 rounded-lg shadow-lg overflow-hidden">
                <div ref={invoiceRef} className="w-full">
                  <ProfessionalInvoiceTemplate 
                    invoice={invoiceData}
                  />
                </div>
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
