
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
      
      // Create a temporary container for PDF generation with A4 dimensions
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.style.minHeight = '297mm';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.fontSize = '12px';
      tempContainer.style.lineHeight = '1.4';
      tempContainer.style.color = '#000000';
      
      // Clone the invoice content
      const clonedContent = invoiceRef.current.cloneNode(true);
      
      // Ensure proper styling for PDF
      clonedContent.style.width = '100%';
      clonedContent.style.height = 'auto';
      clonedContent.style.padding = '20mm';
      clonedContent.style.boxSizing = 'border-box';
      clonedContent.style.backgroundColor = '#ffffff';
      clonedContent.style.color = '#000000';
      
      // Override any problematic styles for PDF
      const allElements = clonedContent.querySelectorAll('*');
      allElements.forEach(el => {
        // Ensure text is black and backgrounds are white
        if (el.style) {
          if (el.style.color && el.style.color !== '#000000') {
            el.style.color = '#000000';
          }
          if (el.style.backgroundColor && el.style.backgroundColor.includes('gray')) {
            el.style.backgroundColor = '#f8f9fa';
          }
        }
        
        // Override specific class-based styles
        if (el.classList) {
          if (el.classList.contains('text-white')) {
            el.style.color = '#000000';
          }
          if (el.classList.contains('bg-blue-600') || el.classList.contains('bg-blue-700')) {
            el.style.backgroundColor = '#1e40af';
            el.style.color = '#ffffff';
          }
        }
      });
      
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);
      
      // Generate canvas with higher quality settings
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        logging: false,
        letterRendering: true,
        dpi: 300,
        foreignObjectRendering: true
      });

      console.log('Canvas generated successfully');

      // Create PDF with exact A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculate proper scaling to fit A4
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Convert pixels to mm (assuming 96 DPI)
      const mmPerPx = 25.4 / 96;
      const imgWidthMM = imgWidth * mmPerPx / 2; // Divide by 2 because of scale: 2
      const imgHeightMM = imgHeight * mmPerPx / 2;
      
      // Scale to fit within A4 margins (leaving 10mm margin on each side)
      const maxWidth = pdfWidth - 20;
      const maxHeight = pdfHeight - 20;
      
      let finalWidth = imgWidthMM;
      let finalHeight = imgHeightMM;
      
      if (imgWidthMM > maxWidth) {
        const ratio = maxWidth / imgWidthMM;
        finalWidth = maxWidth;
        finalHeight = imgHeightMM * ratio;
      }
      
      if (finalHeight > maxHeight) {
        const ratio = maxHeight / finalHeight;
        finalHeight = maxHeight;
        finalWidth = finalWidth * ratio;
      }
      
      // Center the image on the page
      const x = (pdfWidth - finalWidth) / 2;
      const y = 10; // 10mm from top
      
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');
      
      // Clean up
      document.body.removeChild(tempContainer);
      
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
            {/* A4 Container with proper scaling */}
            <div className="w-full overflow-x-auto">
              <div 
                className="bg-white shadow-lg mx-auto"
                style={{ 
                  width: '210mm',
                  minHeight: '297mm',
                  transform: 'scale(0.7)',
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
                <div className="w-full">
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
