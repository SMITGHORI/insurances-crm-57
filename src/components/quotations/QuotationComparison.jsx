
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  FileImage, 
  Image, 
  Layout, 
  PaintBucket, 
  XCircle, 
  Download, 
  Share, 
  Printer 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const QuotationComparison = ({ comparisons }) => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [activeCustomizeTab, setActiveCustomizeTab] = useState('layout');
  const [accentColor, setAccentColor] = useState('#1a56db');
  const [logoUrl, setLogoUrl] = useState('/placeholder.svg');
  const [layoutStyle, setLayoutStyle] = useState('standard');
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Amba Insurance Services',
    address: '123 Insurance Plaza, Mumbai, 400001',
    phone: '+91 98765 43210',
    email: 'contact@ambainsurance.com',
    website: 'www.ambainsurance.com'
  });
  const quotationRef = useRef(null);

  const handleColorChange = (color) => {
    setAccentColor(color);
  };
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStyleChange = (style) => {
    setLayoutStyle(style);
  };

  const handleCompanyInfoChange = (field, value) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrint = () => {
    const printContent = document.getElementById('quotation-container');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Quotation - ${companyInfo.name}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .page-header {
              text-align: center;
              padding: 10px;
              border-bottom: 1px solid #ddd;
              margin-bottom: 20px;
            }
            .page-footer {
              text-align: center;
              padding: 10px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              margin-top: 20px;
              position: fixed;
              bottom: 0;
              width: 100%;
              background: white;
            }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: ${accentColor}; color: white; text-align: left; padding: 8px; }
            td { border-bottom: 1px solid #ddd; padding: 8px; }
            @media print {
              .page-footer {
                position: fixed;
                bottom: 0;
                width: 100%;
              }
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <div class="page-header">
            <img src="${logoUrl}" alt="${companyInfo.name}" style="max-height: 60px; max-width: 200px;" />
            <h2>${companyInfo.name}</h2>
          </div>
          ${printContent.innerHTML}
          <div class="page-footer">
            <p>${companyInfo.address} | Phone: ${companyInfo.phone} | Email: ${companyInfo.email}</p>
            <p>Website: ${companyInfo.website}</p>
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

  const handleDownload = () => {
    try {
      const element = quotationRef.current;
      
      // This is a placeholder for PDF generation
      // In a real implementation, you would use a library like jsPDF or html2pdf
      toast.success('PDF download started');
      toast.info('For full PDF functionality, please integrate a PDF library like jsPDF or html2pdf');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Insurance Plan Comparison',
        text: 'Check out this insurance plan comparison from Amba Insurance Services',
        // In a real app, you would generate a shareable URL here
        url: window.location.href,
      })
        .then(() => toast.success('Shared successfully'))
        .catch(() => toast.error('Failed to share'));
    } else {
      // Fallback for browsers that don't support the Web Share API
      toast.info('Sharing is not supported in this browser');
    }
  };

  const layoutStyles = {
    standard: {
      containerClass: "",
      headerClass: "",
      tableClass: "w-full min-w-[800px]",
      rowClass: "border-b",
      cellClass: "py-3",
      headerCellClass: "text-left font-medium pb-3"
    },
    modern: {
      containerClass: "rounded-xl overflow-hidden",
      headerClass: "bg-gradient-to-r from-gray-100 to-gray-200",
      tableClass: "w-full min-w-[800px]",
      rowClass: "border-b hover:bg-gray-50",
      cellClass: "py-4",
      headerCellClass: "text-left font-semibold pb-4"
    },
    compact: {
      containerClass: "border rounded-md",
      headerClass: "",
      tableClass: "w-full min-w-[800px] text-sm",
      rowClass: "border-b",
      cellClass: "py-2",
      headerCellClass: "text-left font-medium pb-2"
    },
    elegant: {
      containerClass: "shadow-md rounded-lg overflow-hidden",
      headerClass: "border-b",
      tableClass: "w-full min-w-[800px]",
      rowClass: "border-b hover:bg-gray-50 transition-colors",
      cellClass: "py-4",
      headerCellClass: "text-left font-medium pb-3"
    },
    colorful: {
      containerClass: "rounded-lg overflow-hidden",
      headerClass: "",
      tableClass: "w-full min-w-[800px]",
      rowClass: "border-b",
      cellClass: "py-3",
      headerCellClass: "text-left font-bold pb-3"
    },
    professional: {
      containerClass: "shadow-lg rounded-lg overflow-hidden",
      headerClass: "bg-gradient-to-r from-gray-50 to-gray-100",
      tableClass: "w-full min-w-[800px]",
      rowClass: "border-b hover:bg-gray-50 transition-colors",
      cellClass: "py-4",
      headerCellClass: "text-left font-semibold pb-4"
    }
  };

  const currentStyle = layoutStyles[layoutStyle] || layoutStyles.standard;

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
            onClick={handleDownload}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
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
        <Button 
          variant="outline" 
          onClick={() => setShowCustomizer(!showCustomizer)}
          className="flex items-center"
        >
          <PaintBucket className="mr-2 h-4 w-4" />
          {showCustomizer ? 'Hide Customizer' : 'Customize Layout'}
        </Button>
      </div>
      
      {showCustomizer && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <Tabs defaultValue="layout" value={activeCustomizeTab} onValueChange={setActiveCustomizeTab}>
              <TabsList className="mb-4 grid grid-cols-3 w-full md:w-auto">
                <TabsTrigger value="layout" className="flex items-center">
                  <Layout className="mr-2 h-4 w-4" />
                  Layout Options
                </TabsTrigger>
                <TabsTrigger value="branding" className="flex items-center">
                  <Image className="mr-2 h-4 w-4" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="company-info" className="flex items-center">
                  <FileImage className="mr-2 h-4 w-4" />
                  Company Info
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="layout" className="space-y-4">
                <h3 className="font-medium mb-3">Style Selection</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <Button 
                    variant={layoutStyle === 'standard' ? 'default' : 'outline'}
                    onClick={() => handleStyleChange('standard')}
                    className="h-auto py-2"
                  >
                    Standard
                  </Button>
                  <Button 
                    variant={layoutStyle === 'modern' ? 'default' : 'outline'}
                    onClick={() => handleStyleChange('modern')}
                    className="h-auto py-2"
                  >
                    Modern
                  </Button>
                  <Button 
                    variant={layoutStyle === 'compact' ? 'default' : 'outline'}
                    onClick={() => handleStyleChange('compact')}
                    className="h-auto py-2"
                  >
                    Compact
                  </Button>
                  <Button 
                    variant={layoutStyle === 'elegant' ? 'default' : 'outline'}
                    onClick={() => handleStyleChange('elegant')}
                    className="h-auto py-2"
                  >
                    Elegant
                  </Button>
                  <Button 
                    variant={layoutStyle === 'colorful' ? 'default' : 'outline'}
                    onClick={() => handleStyleChange('colorful')}
                    className="h-auto py-2"
                  >
                    Colorful
                  </Button>
                  <Button 
                    variant={layoutStyle === 'professional' ? 'default' : 'outline'}
                    onClick={() => handleStyleChange('professional')}
                    className="h-auto py-2"
                  >
                    Professional
                  </Button>
                </div>
                
                <h3 className="font-medium mb-3">Accent Color</h3>
                <div className="flex flex-wrap gap-2">
                  {['#1a56db', '#047857', '#b91c1c', '#7c3aed', '#0369a1', '#0f766e', '#ea384c', '#9b87f5', '#f97316', '#33C3F0'].map(color => (
                    <div
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer border-2 ${accentColor === color ? 'border-black' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="branding" className="space-y-4">
                <h3 className="font-medium mb-3">Company Logo</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center border rounded-md p-4 bg-gray-50">
                    <img 
                      src={logoUrl} 
                      alt="Company Logo" 
                      className="h-20 max-w-full object-contain"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md cursor-pointer">
                      <FileImage className="h-4 w-4" />
                      <span>Upload Logo</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="sr-only" 
                        onChange={handleLogoChange}
                      />
                    </label>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setLogoUrl('/placeholder.svg')}
                    >
                      Reset Logo
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="company-info" className="space-y-4">
                <h3 className="font-medium mb-3">Company Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <input
                      type="text"
                      value={companyInfo.name}
                      onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <input
                      type="text"
                      value={companyInfo.address}
                      onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <input
                        type="text"
                        value={companyInfo.phone}
                        onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <input
                      type="text"
                      value={companyInfo.website}
                      onChange={(e) => handleCompanyInfoChange('website', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <div 
        id="quotation-container" 
        ref={quotationRef} 
        className={currentStyle.containerClass}
      >
        <Card>
          <CardHeader className={currentStyle.headerClass} style={layoutStyle === 'colorful' ? { backgroundColor: accentColor, color: '#ffffff' } : {}}>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Insurance Plan Comparison</CardTitle>
                <p className="text-sm mt-1 text-gray-600">Prepared by {companyInfo.name}</p>
              </div>
              <img src={logoUrl} alt="Company Logo" className="h-12" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className={currentStyle.tableClass}>
                <thead>
                  <tr className={currentStyle.rowClass}>
                    <th className={currentStyle.headerCellClass} style={layoutStyle === 'colorful' ? { color: accentColor } : {}}>
                      Feature
                    </th>
                    {comparisons.map((plan, index) => (
                      <th key={index} className={currentStyle.headerCellClass} style={layoutStyle === 'colorful' ? { color: accentColor } : {}}>
                        {plan.company} - {plan.product}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className={currentStyle.rowClass}>
                    <td className={`${currentStyle.cellClass} font-medium`}>Premium</td>
                    {comparisons.map((plan, index) => (
                      <td key={index} className={currentStyle.cellClass}>{formatCurrency(plan.premium)}</td>
                    ))}
                  </tr>
                  <tr className={currentStyle.rowClass}>
                    <td className={`${currentStyle.cellClass} font-medium`}>Sum Insured</td>
                    {comparisons.map((plan, index) => (
                      <td key={index} className={currentStyle.cellClass}>{formatCurrency(plan.sumInsured)}</td>
                    ))}
                  </tr>
                  <tr className={currentStyle.rowClass}>
                    <td className={`${currentStyle.cellClass} font-medium`}>Co-pay</td>
                    {comparisons.map((plan, index) => (
                      <td key={index} className={currentStyle.cellClass}>{plan.copay}</td>
                    ))}
                  </tr>
                  <tr className={currentStyle.rowClass}>
                    <td className={`${currentStyle.cellClass} font-medium`}>Room Rent Limit</td>
                    {comparisons.map((plan, index) => (
                      <td key={index} className={currentStyle.cellClass}>{plan.roomRent}</td>
                    ))}
                  </tr>
                  <tr className={currentStyle.rowClass}>
                    <td className={`${currentStyle.cellClass} font-medium`}>Pre-existing Disease Waiting Period</td>
                    {comparisons.map((plan, index) => (
                      <td key={index} className={currentStyle.cellClass}>{plan.preExistingWaitingPeriod}</td>
                    ))}
                  </tr>
                  <tr className={currentStyle.rowClass}>
                    <td className={`${currentStyle.cellClass} font-medium`}>Maternity Benefit</td>
                    {comparisons.map((plan, index) => (
                      <td key={index} className={currentStyle.cellClass}>{plan.maternity}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className={`${currentStyle.cellClass} font-medium`}>Recommended Plan</td>
                    {comparisons.map((plan, index) => (
                      <td key={index} className={currentStyle.cellClass}>
                        {index === 0 ? 
                          <CheckCircle className="text-green-500 h-5 w-5" /> : 
                          <XCircle className="text-gray-300 h-5 w-5" />
                        }
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-8 border-t pt-4 text-sm text-gray-500">
              <p className="mb-2"><strong>Important Notes:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>This is a comparison only. Please refer to policy documents for complete details.</li>
                <li>Terms and conditions may apply. Please consult with your agent.</li>
                <li>Premium amounts are indicative and may vary based on individual profiles.</li>
              </ul>
            </div>
            <div className="mt-4 pt-4 border-t text-sm">
              <p className="font-medium">Contact Information:</p>
              <p>{companyInfo.address} | Phone: {companyInfo.phone}</p>
              <p>Email: {companyInfo.email} | Website: {companyInfo.website}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuotationComparison;
