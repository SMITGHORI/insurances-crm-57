
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileImage, Image, Layout, PaintBucket, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const QuotationComparison = ({ comparisons }) => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [activeCustomizeTab, setActiveCustomizeTab] = useState('layout');
  const [accentColor, setAccentColor] = useState('#1a56db');
  const [logoUrl, setLogoUrl] = useState('/placeholder.svg');
  const [layoutStyle, setLayoutStyle] = useState('standard');

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
    }
  };

  const currentStyle = layoutStyles[layoutStyle] || layoutStyles.standard;

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end">
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
              <TabsList className="mb-4 grid grid-cols-2 w-full md:w-auto">
                <TabsTrigger value="layout" className="flex items-center">
                  <Layout className="mr-2 h-4 w-4" />
                  Layout Options
                </TabsTrigger>
                <TabsTrigger value="branding" className="flex items-center">
                  <Image className="mr-2 h-4 w-4" />
                  Branding
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="layout" className="space-y-4">
                <h3 className="font-medium mb-3">Style Selection</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
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
            </Tabs>
          </CardContent>
        </Card>
      )}

      <div id="quotation-container" className={currentStyle.containerClass}>
        <Card>
          <CardHeader className={currentStyle.headerClass} style={layoutStyle === 'colorful' ? { backgroundColor: accentColor, color: '#ffffff' } : {}}>
            <div className="flex justify-between items-center">
              <CardTitle>Insurance Plan Comparison</CardTitle>
              {(layoutStyle === 'modern' || layoutStyle === 'elegant' || layoutStyle === 'colorful') && (
                <img src={logoUrl} alt="Company Logo" className="h-10" />
              )}
            </div>
            {layoutStyle === 'standard' && (
              <div className="flex justify-end mt-2">
                <img src={logoUrl} alt="Company Logo" className="h-8" />
              </div>
            )}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuotationComparison;
