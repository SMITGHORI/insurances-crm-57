
import React from 'react';

const InvoiceTemplateRenderer = ({ template, customizations, invoice, logo }) => {
  const renderExecutiveTemplate = () => (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8">
        <div className="flex justify-between items-start">
          <div>
            <img src={logo} alt="Logo" className="h-16 mb-4" />
            <h1 className="text-3xl font-bold tracking-wide">EXECUTIVE INVOICE</h1>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm opacity-90">Invoice Number</p>
              <p className="text-xl font-bold">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content with premium styling */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Bill To:</h3>
              <p className="text-gray-600">{invoice.clientName}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-gray-800 mb-2">Invoice Details:</h3>
              <p className="text-gray-600">Date: {invoice.date}</p>
              <p className="text-gray-600">Due: {invoice.dueDate}</p>
            </div>
          </div>
          
          {/* Premium table styling */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <tr>
                  <th className="p-4 text-left">Description</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4">{item.description}</td>
                    <td className="p-4 text-right">₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Premium total section */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-800">Total: ₹{invoice.total}</p>
            </div>
          </div>
          
          {/* Signature area */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600">Authorized Signature</p>
                <div className="mt-8 border-b border-gray-400 w-48"></div>
              </div>
              <div className="w-24 h-24 border-2 border-gray-300 rounded">
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">QR Code</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreativeAgencyTemplate = () => (
    <div className="bg-white min-h-screen relative overflow-hidden">
      {/* Creative asymmetric layout */}
      <div className="absolute top-0 right-0 w-1/3 h-64 bg-gradient-to-bl from-purple-500 to-pink-500 opacity-10"></div>
      
      {/* Bold header */}
      <div className="relative p-8">
        <div className="flex items-start justify-between">
          <div>
            <img src={logo} alt="Logo" className="h-12 mb-4" />
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">CREATIVE INVOICE</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mt-2"></div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg transform rotate-3">
            <p className="text-sm font-semibold">#{invoice.invoiceNumber}</p>
          </div>
        </div>
        
        {/* Asymmetric content layout */}
        <div className="mt-12 grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="bg-gray-900 text-white p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Client</h3>
              <p>{invoice.clientName}</p>
            </div>
            
            {/* Creative table */}
            <div className="mt-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-purple-500">
                    <th className="p-4 text-left text-lg font-black">Service</th>
                    <th className="p-4 text-right text-lg font-black">Investment</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="p-4 font-medium">{item.description}</td>
                      <td className="p-4 text-right font-bold">₹{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Invoice Date</h3>
              <p>{invoice.date}</p>
            </div>
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Due Date</h3>
              <p>{invoice.dueDate}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg text-center">
              <h3 className="font-bold text-lg">Total</h3>
              <p className="text-2xl font-black">₹{invoice.total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTechStartupTemplate = () => (
    <div className="bg-gray-900 text-green-400 min-h-screen font-mono">
      {/* Terminal-style header */}
      <div className="p-6 border-b border-green-500">
        <div className="flex items-center mb-4">
          <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-sm">invoice_generator.exe</span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <img src={logo} alt="Logo" className="h-10 mb-2 filter brightness-0 invert" />
            <h1 className="text-2xl font-bold">&gt; GENERATING INVOICE...</h1>
            <p className="text-green-300">&gt; Process ID: {invoice.invoiceNumber}</p>
          </div>
          <div className="bg-green-500/20 border border-green-500 p-3 rounded">
            <p className="text-xs">[STATUS: READY]</p>
          </div>
        </div>
      </div>
      
      {/* Code-style content */}
      <div className="p-6">
        <div className="mb-6">
          <p className="text-green-300"># Client Configuration</p>
          <p className="pl-4">client_name = "{invoice.clientName}"</p>
          <p className="pl-4">invoice_date = "{invoice.date}"</p>
          <p className="pl-4">due_date = "{invoice.dueDate}"</p>
        </div>
        
        <div className="mb-6">
          <p className="text-green-300"># Service Array</p>
          <div className="pl-4">
            <p>services = [</p>
            {invoice.items?.map((item, index) => (
              <p key={index} className="pl-8">
                {`{ "description": "${item.description}", "amount": ${item.amount} },`}
              </p>
            ))}
            <p>]</p>
          </div>
        </div>
        
        <div className="bg-green-500/10 border border-green-500 p-4 rounded">
          <p className="text-green-300"># Total Calculation</p>
          <p className="text-xl font-bold">total_amount = ₹{invoice.total}</p>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-green-300">[PRESS ANY KEY TO CONTINUE]</p>
          <div className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const renderLegalProfessionalTemplate = () => (
    <div className="bg-white min-h-screen">
      {/* Conservative header */}
      <div className="border-b-4 border-gray-800 p-8">
        <div className="flex justify-between items-start">
          <div>
            <img src={logo} alt="Logo" className="h-14 mb-4" />
            <h1 className="text-2xl font-serif font-bold text-gray-800 uppercase tracking-wide">Invoice</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Invoice No.</p>
            <p className="text-xl font-bold text-gray-800">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>
      
      {/* Formal content */}
      <div className="p-8">
        <div className="grid grid-cols-2 gap-12 mb-8">
          <div>
            <h3 className="font-serif font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">Bill To:</h3>
            <p className="text-gray-700 leading-relaxed">{invoice.clientName}</p>
          </div>
          <div>
            <h3 className="font-serif font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">Invoice Details:</h3>
            <div className="space-y-1 text-gray-700">
              <p>Date: {invoice.date}</p>
              <p>Due Date: {invoice.dueDate}</p>
            </div>
          </div>
        </div>
        
        {/* Formal table */}
        <table className="w-full border-2 border-gray-800">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-4 text-left font-serif">Description of Services</th>
              <th className="p-4 text-right font-serif">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="p-4 border-r border-gray-300">{item.description}</td>
                <td className="p-4 text-right">{item.amount}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="p-4 border-r border-gray-300 font-serif">TOTAL AMOUNT DUE</td>
              <td className="p-4 text-right text-lg">₹{invoice.total}</td>
            </tr>
          </tfoot>
        </table>
        
        {/* Legal footer */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-600 mb-4">Terms: Payment due within 30 days</p>
              <p className="text-xs text-gray-500">This invoice is governed by the laws of [Jurisdiction]</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-400 w-48 mb-2"></div>
              <p className="text-sm text-gray-600">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicalHealthcareTemplate = () => (
    <div className="bg-blue-50 min-h-screen">
      {/* Medical header */}
      <div className="bg-white border-b-4 border-blue-600 p-8">
        <div className="flex justify-between items-start">
          <div>
            <img src={logo} alt="Logo" className="h-12 mb-4" />
            <h1 className="text-2xl font-semibold text-blue-800">Medical Invoice</h1>
            <p className="text-blue-600">Professional Healthcare Services</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Invoice #</p>
            <p className="text-xl font-bold text-blue-800">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>
      
      {/* Clean content */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Patient Information
              </h3>
              <p className="text-gray-700">{invoice.clientName}</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Service Date
              </h3>
              <p className="text-gray-700">{invoice.date}</p>
              <p className="text-sm text-gray-600">Due: {invoice.dueDate}</p>
            </div>
          </div>
        </div>
        
        {/* Medical services table */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-4 text-left">Medical Service</th>
                <th className="p-4 text-right">Charge</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={index} className="border-b border-blue-100 hover:bg-blue-50">
                  <td className="p-4">{item.description}</td>
                  <td className="p-4 text-right font-medium">₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="bg-blue-50 p-4">
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-800">Total Amount: ₹{invoice.total}</p>
            </div>
          </div>
        </div>
        
        {/* Trust elements */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-blue-200 p-4">
          <div className="flex items-center justify-center space-x-8 text-sm text-blue-700">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Licensed Provider
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              HIPAA Compliant
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Secure Billing
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFashionRetailTemplate = () => (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 min-h-screen">
      {/* Stylish header */}
      <div className="bg-white p-8 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <img src={logo} alt="Logo" className="h-14 mb-4" />
            <h1 className="text-3xl font-light text-gray-800 tracking-widest">INVOICE</h1>
            <div className="w-20 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 mt-2"></div>
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-full">
              <p className="font-bold">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Elegant content */}
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-2 gap-12 mb-8">
            <div>
              <h3 className="font-light text-gray-800 mb-3 text-lg tracking-wide">Styled For</h3>
              <p className="text-gray-700 text-lg">{invoice.clientName}</p>
            </div>
            <div className="text-right">
              <h3 className="font-light text-gray-800 mb-3 text-lg tracking-wide">Collection Date</h3>
              <p className="text-gray-700">{invoice.date}</p>
              <p className="text-sm text-gray-500">Payment Due: {invoice.dueDate}</p>
            </div>
          </div>
          
          {/* Stylish table */}
          <div className="overflow-hidden rounded-xl">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                <tr>
                  <th className="p-6 text-left font-light tracking-wide">Item Description</th>
                  <th className="p-6 text-right font-light tracking-wide">Price</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-pink-50">
                    <td className="p-6 font-light">{item.description}</td>
                    <td className="p-6 text-right font-medium">₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Elegant total */}
          <div className="mt-8 text-right">
            <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-xl">
              <p className="font-light tracking-wide">Total Investment</p>
              <p className="text-2xl font-light">₹{invoice.total}</p>
            </div>
          </div>
          
          {/* Fashion elements */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-light tracking-widest text-sm">
              THANK YOU FOR CHOOSING OUR COLLECTION
            </p>
            <div className="flex justify-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-pink-300 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
              <div className="w-2 h-2 bg-pink-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStandardTemplate = () => (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Standard header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <img src={logo} alt="Logo" className="h-12 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Invoice</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Invoice Number</p>
            <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
          </div>
        </div>
        
        {/* Standard content */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Bill To:</h3>
            <p className="text-gray-600">{invoice.clientName}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Date: {invoice.date}</p>
            <p className="text-gray-600">Due Date: {invoice.dueDate}</p>
          </div>
        </div>
        
        {/* Standard table */}
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left border-b">Description</th>
              <th className="p-3 text-right border-b">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{item.description}</td>
                <td className="p-3 text-right">₹{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-6 text-right">
          <p className="text-xl font-bold">Total: ₹{invoice.total}</p>
        </div>
      </div>
    </div>
  );

  // Template selection logic
  switch (template) {
    case 'executive':
      return renderExecutiveTemplate();
    case 'creative-agency':
      return renderCreativeAgencyTemplate();
    case 'tech-startup':
      return renderTechStartupTemplate();
    case 'legal-professional':
      return renderLegalProfessionalTemplate();
    case 'medical-healthcare':
      return renderMedicalHealthcareTemplate();
    case 'fashion-retail':
      return renderFashionRetailTemplate();
    default:
      return renderStandardTemplate();
  }
};

export default InvoiceTemplateRenderer;
