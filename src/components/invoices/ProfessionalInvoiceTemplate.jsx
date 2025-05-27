
import React from 'react';

const ProfessionalInvoiceTemplate = ({ invoice, customizations }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white w-full h-full p-4 sm:p-6 md:p-8 font-sans text-xs sm:text-sm" style={{ minHeight: '297mm', maxWidth: '210mm' }}>
      <div className="max-w-full mx-auto h-full flex flex-col">
        {/* Header Section - Compact */}
        <div className="border-b-2 sm:border-b-4 border-blue-600 pb-3 sm:pb-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-lg md:text-xl">AI</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-800">AMBA INSURANCE</h1>
                <p className="text-blue-600 font-medium text-xs sm:text-sm">Professional Insurance Services</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-1 sm:mb-2">INVOICE</h2>
              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                <p className="text-xs text-gray-600">Invoice No.</p>
                <p className="text-sm sm:text-lg font-bold text-gray-800">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company & Client Information - Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6">
          <div className="bg-gray-50 p-3 sm:p-4 md:p-6 rounded-lg">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4 border-b border-gray-300 pb-1 sm:pb-2">
              From: Insurance Provider
            </h3>
            <div className="space-y-1 text-gray-700 text-xs sm:text-sm">
              <p className="font-medium">AMBA INSURANCE SERVICES</p>
              <p>Mumbai Corporate Office</p>
              <p>123 Business District, BKC</p>
              <p>Mumbai, Maharashtra 400051</p>
              <p>Phone: +91 22 6789 1234</p>
              <p>Email: info@ambainsurance.com</p>
              <p>GST: 27ABCDE1234F1Z5</p>
            </div>
          </div>

          <div className="bg-blue-50 p-3 sm:p-4 md:p-6 rounded-lg">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4 border-b border-blue-300 pb-1 sm:pb-2">
              Bill To: Client
            </h3>
            <div className="space-y-1 text-gray-700 text-xs sm:text-sm">
              <p className="font-medium text-blue-800">{invoice.clientName}</p>
              <p>{invoice.clientAddress}</p>
              <p>Phone: {invoice.clientPhone}</p>
              <p>Email: {invoice.clientEmail}</p>
              {invoice.customFields?.["GST Number"] && (
                <p>GST: {invoice.customFields["GST Number"]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Details - Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          <div className="bg-white border border-gray-200 p-2 sm:p-3 md:p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-600 text-xs uppercase tracking-wide mb-1">Issue Date</h4>
            <p className="text-sm sm:text-lg font-medium text-gray-800">{formatDate(invoice.issueDate)}</p>
          </div>
          <div className="bg-white border border-gray-200 p-2 sm:p-3 md:p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-600 text-xs uppercase tracking-wide mb-1">Due Date</h4>
            <p className="text-sm sm:text-lg font-medium text-gray-800">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="bg-white border border-gray-200 p-2 sm:p-3 md:p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-600 text-xs uppercase tracking-wide mb-1">Payment Terms</h4>
            <p className="text-sm sm:text-lg font-medium text-gray-800">{invoice.paymentTerms}</p>
          </div>
        </div>

        {/* Policy Information - Compact */}
        {invoice.policyNumber && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 rounded-lg mb-4 sm:mb-6 border-l-4 border-blue-600">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">Policy Information</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm">
              <div>
                <p className="text-gray-600">Policy Number</p>
                <p className="font-medium text-gray-800">{invoice.policyNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Insurance Type</p>
                <p className="font-medium text-gray-800">{invoice.insuranceType}</p>
              </div>
              <div>
                <p className="text-gray-600">Premium Type</p>
                <p className="font-medium text-gray-800">{invoice.premiumType}</p>
              </div>
              <div>
                <p className="text-gray-600">Coverage Period</p>
                <p className="font-medium text-gray-800">{invoice.premiumPeriod}</p>
              </div>
            </div>
          </div>
        )}

        {/* Agent Information - Compact */}
        {invoice.agentName && (
          <div className="bg-green-50 p-3 sm:p-4 md:p-6 rounded-lg mb-4 sm:mb-6 border-l-4 border-green-600">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-1">Agent Information</h3>
            <p className="font-medium text-gray-800 text-xs sm:text-sm">{invoice.agentName}</p>
          </div>
        )}

        {/* Invoice Items - Compact */}
        <div className="mb-4 sm:mb-6 flex-grow">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">Invoice Details</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left font-semibold text-xs sm:text-sm">Description</th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center font-semibold text-xs sm:text-sm">Qty</th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-semibold text-xs sm:text-sm">Unit Price</th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-semibold text-xs sm:text-sm">Tax</th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-semibold text-xs sm:text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-gray-800 text-xs sm:text-sm">{item.description}</td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center text-gray-800 text-xs sm:text-sm">{item.quantity}</td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-gray-800 text-xs sm:text-sm">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-gray-800 text-xs sm:text-sm">{formatCurrency(item.tax)}</td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-medium text-gray-800 text-xs sm:text-sm">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Section - Compact */}
        <div className="flex justify-end mb-4 sm:mb-6">
          <div className="w-full sm:w-80 md:w-96">
            <div className="bg-gray-50 p-3 sm:p-4 md:p-6 rounded-lg">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax Total (GST):</span>
                  <span>{formatCurrency(invoice.tax)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-800">
                    <span>Grand Total:</span>
                    <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section - Compact */}
        {invoice.notes && (
          <div className="bg-yellow-50 p-3 sm:p-4 md:p-6 rounded-lg mb-4 sm:mb-6 border-l-4 border-yellow-400">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-1">Notes</h3>
            <p className="text-gray-700 text-xs sm:text-sm">{invoice.notes}</p>
          </div>
        )}

        {/* Footer - Compact */}
        <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1 text-xs sm:text-sm">Terms & Conditions</h4>
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li>• Payment is due within the specified payment terms</li>
                <li>• Late payments may incur additional charges</li>
                <li>• All disputes must be reported within 30 days</li>
                <li>• This invoice is computer generated and does not require signature</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-gray-400 w-32 sm:w-48 mb-1 sm:mb-2"></div>
              <p className="text-xs text-gray-600">Authorized Signature</p>
              <p className="text-xs text-gray-500 mt-1">AMBA INSURANCE SERVICES</p>
            </div>
          </div>
        </div>

        {/* Watermark - Compact */}
        <div className="text-center mt-2 sm:mt-4 text-xs text-gray-400">
          <p>Generated on {formatDate(new Date())} | For any queries, contact us at info@ambainsurance.com</p>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInvoiceTemplate;
