
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
    <div className="bg-white min-h-screen p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="border-b-4 border-blue-600 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">AMBA INSURANCE</h1>
                <p className="text-blue-600 font-medium">Professional Insurance Services</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">INVOICE</h2>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Invoice No.</p>
                <p className="text-lg font-bold text-gray-800">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company & Client Information */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
              From: Insurance Provider
            </h3>
            <div className="space-y-2 text-gray-700">
              <p className="font-medium">AMBA INSURANCE SERVICES</p>
              <p>Mumbai Corporate Office</p>
              <p>123 Business District, Bandra Kurla Complex</p>
              <p>Mumbai, Maharashtra 400051, India</p>
              <p>Phone: +91 22 6789 1234</p>
              <p>Email: info@ambainsurance.com</p>
              <p>Website: www.ambainsurance.com</p>
              <p>GST: 27ABCDE1234F1Z5</p>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-blue-300 pb-2">
              Bill To: Client
            </h3>
            <div className="space-y-2 text-gray-700">
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

        {/* Invoice Details */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-600 text-sm uppercase tracking-wide mb-2">Issue Date</h4>
            <p className="text-lg font-medium text-gray-800">{formatDate(invoice.issueDate)}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-600 text-sm uppercase tracking-wide mb-2">Due Date</h4>
            <p className="text-lg font-medium text-gray-800">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-600 text-sm uppercase tracking-wide mb-2">Payment Terms</h4>
            <p className="text-lg font-medium text-gray-800">{invoice.paymentTerms}</p>
          </div>
        </div>

        {/* Policy Information */}
        {invoice.policyNumber && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8 border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Policy Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Policy Number</p>
                <p className="font-medium text-gray-800">{invoice.policyNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Insurance Type</p>
                <p className="font-medium text-gray-800">{invoice.insuranceType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Premium Type</p>
                <p className="font-medium text-gray-800">{invoice.premiumType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Coverage Period</p>
                <p className="font-medium text-gray-800">{invoice.premiumPeriod}</p>
              </div>
            </div>
          </div>
        )}

        {/* Agent Information */}
        {invoice.agentName && (
          <div className="bg-green-50 p-6 rounded-lg mb-8 border-l-4 border-green-600">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Agent Information</h3>
            <p className="font-medium text-gray-800">{invoice.agentName}</p>
          </div>
        )}

        {/* Invoice Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Description</th>
                  <th className="px-6 py-4 text-center font-semibold">Quantity</th>
                  <th className="px-6 py-4 text-right font-semibold">Unit Price</th>
                  <th className="px-6 py-4 text-right font-semibold">Tax</th>
                  <th className="px-6 py-4 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{item.description}</td>
                    <td className="px-6 py-4 text-center text-gray-800">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-gray-800">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-6 py-4 text-right text-gray-800">{formatCurrency(item.tax)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-800">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="flex justify-end mb-8">
          <div className="w-96">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-3">
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
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Grand Total:</span>
                    <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {invoice.notes && (
          <div className="bg-yellow-50 p-6 rounded-lg mb-8 border-l-4 border-yellow-400">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes</h3>
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-end">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Terms & Conditions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Payment is due within the specified payment terms</li>
                <li>• Late payments may incur additional charges</li>
                <li>• All disputes must be reported within 30 days</li>
                <li>• This invoice is computer generated and does not require signature</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-gray-400 w-48 mb-2"></div>
              <p className="text-sm text-gray-600">Authorized Signature</p>
              <p className="text-xs text-gray-500 mt-2">AMBA INSURANCE SERVICES</p>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="text-center mt-8 text-xs text-gray-400">
          <p>Generated on {formatDate(new Date())} | For any queries, contact us at info@ambainsurance.com</p>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInvoiceTemplate;
