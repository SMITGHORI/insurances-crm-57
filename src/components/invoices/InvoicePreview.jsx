import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ProfessionalInvoiceTemplate from './ProfessionalInvoiceTemplate';

const InvoicePreview = ({ invoice, onDownload, onPrint, onShare }) => {
  const [showPreview, setShowPreview] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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
    if (!invoiceRef.current) {
      toast.error('Invoice content not ready for PDF generation');
      return null;
    }

    setIsGeneratingPDF(true);
    
    try {
      // Dynamic imports to ensure libraries are loaded
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      console.log('Starting PDF generation...');
      
      // Create a dedicated PDF container with exact A4 dimensions
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'fixed';
      pdfContainer.style.top = '-10000px';
      pdfContainer.style.left = '-10000px';
      pdfContainer.style.width = '794px'; // A4 width at 96 DPI
      pdfContainer.style.minHeight = '1123px'; // A4 height at 96 DPI
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      pdfContainer.style.fontSize = '14px';
      pdfContainer.style.lineHeight = '1.4';
      pdfContainer.style.color = '#000000';
      pdfContainer.style.padding = '40px';
      pdfContainer.style.boxSizing = 'border-box';
      
      // Create the invoice template specifically for PDF
      const pdfInvoiceElement = document.createElement('div');
      pdfInvoiceElement.innerHTML = `
        <div style="background: white; width: 100%; height: auto; font-family: Arial, sans-serif; color: #000;">
          <div id="pdf-invoice-content"></div>
        </div>
      `;
      
      pdfContainer.appendChild(pdfInvoiceElement);
      document.body.appendChild(pdfContainer);
      
      // Render React component into the PDF container
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(pdfInvoiceElement.querySelector('#pdf-invoice-content'));
      
      // Render the invoice template with PDF-specific props
      await new Promise((resolve) => {
        root.render(
          React.createElement(ProfessionalInvoiceTemplate, {
            invoice: invoiceData,
            isPDF: true
          })
        );
        
        // Wait for rendering to complete
        setTimeout(resolve, 1000);
      });
      
      console.log('Invoice rendered for PDF generation');
      
      // Generate canvas with optimized settings for A4
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        logging: false,
        letterRendering: true,
        foreignObjectRendering: true,
        removeContainer: false
      });

      console.log('Canvas generated successfully', { width: canvas.width, height: canvas.height });

      // Create PDF with A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Add the image to PDF, fitting it to A4 size
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      // Clean up
      root.unmount();
      document.body.removeChild(pdfContainer);
      
      console.log('PDF generated successfully');
      return pdf;
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
      return null;
    } finally {
      setIsGeneratingPDF(false);
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

  const handleDirectDownload = async () => {
    const pdf = await generatePDFBlob();
    if (pdf) {
      pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
      toast.success('PDF downloaded successfully');
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Invoice Preview</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDirectDownload}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </Button>
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
        </div>

        {showPreview && (
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
            {/* Desktop Preview - A4 Container with proper scaling */}
            <div className="hidden md:block w-full overflow-x-auto">
              <div 
                className="bg-white shadow-lg mx-auto"
                style={{ 
                  width: '210mm',
                  minHeight: '297mm',
                  transform: 'scale(0.6)',
                  transformOrigin: 'top center',
                  margin: '0 auto'
                }}
              >
                <div ref={invoiceRef} className="w-full h-full">
                  <ProfessionalInvoiceTemplate 
                    invoice={invoiceData}
                    isPDF={false}
                  />
                </div>
              </div>
            </div>
            
            {/* Mobile responsive view */}
            <div className="block md:hidden">
              <div className="bg-white mx-2 my-4 rounded-lg shadow-lg overflow-hidden">
                <div className="w-full" ref={invoiceRef}>
                  <ProfessionalInvoiceTemplate 
                    invoice={invoiceData}
                    isPDF={false}
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
