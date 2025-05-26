import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Layout, 
  Image, 
  Palette, 
  Type, 
  Move, 
  FileImage, 
  Download,
  Upload,
  RotateCcw,
  Paintbrush,
  Settings2
} from 'lucide-react';

const InvoiceCustomizer = ({ 
  customizations, 
  onCustomizationChange, 
  onLogoChange, 
  onResetCustomizations 
}) => {
  const [activeTab, setActiveTab] = useState('layout');

  const handleInputChange = (field, value) => {
    onCustomizationChange(field, value);
  };

  const colorPresets = [
    { name: 'Corporate Blue', primary: '#1a56db', secondary: '#3b82f6', accent: '#60a5fa' },
    { name: 'Professional Green', primary: '#047857', secondary: '#059669', accent: '#10b981' },
    { name: 'Executive Red', primary: '#b91c1c', secondary: '#dc2626', accent: '#ef4444' },
    { name: 'Premium Purple', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
    { name: 'Ocean Blue', primary: '#0369a1', secondary: '#0284c7', accent: '#0ea5e9' },
    { name: 'Forest Green', primary: '#0f766e', secondary: '#0d9488', accent: '#14b8a6' },
    { name: 'Sunset Orange', primary: '#ea384c', secondary: '#f97316', accent: '#fb923c' },
    { name: 'Royal Purple', primary: '#9b87f5', secondary: '#a855f7', accent: '#c084fc' }
  ];

  const fontFamilies = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
    'Poppins', 'Source Sans Pro', 'Nunito', 'Ubuntu', 'Playfair Display'
  ];

  const templates = [
    { 
      id: 'standard', 
      name: 'Standard', 
      description: 'Clean and professional layout',
      preview: '📄'
    },
    { 
      id: 'corporate', 
      name: 'Corporate', 
      description: 'Bold header with company branding',
      preview: '🏢'
    },
    { 
      id: 'minimal', 
      name: 'Minimal', 
      description: 'Simple and clean design',
      preview: '✨'
    },
    { 
      id: 'modern', 
      name: 'Modern', 
      description: 'Contemporary layout with rounded elements',
      preview: '🎨'
    },
    { 
      id: 'elegant', 
      name: 'Elegant', 
      description: 'Sophisticated centered design',
      preview: '👑'
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      description: 'Unique asymmetric layout',
      preview: '🎭'
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <Settings2 className="mr-2 h-5 w-5" />
            Advanced Invoice Customization
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onResetCustomizations}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset All
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full mb-6">
            <TabsTrigger value="layout" className="flex items-center">
              <Layout className="mr-2 h-4 w-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center">
              <Palette className="mr-2 h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center">
              <Type className="mr-2 h-4 w-4" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="spacing" className="flex items-center">
              <Move className="mr-2 h-4 w-4" />
              Spacing
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center">
              <Image className="mr-2 h-4 w-4" />
              Branding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Template Selection</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div 
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      customizations.template === template.id 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('template', template.id)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{template.preview}</div>
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Page Layout</Label>
                <Select 
                  value={customizations.pageLayout} 
                  onValueChange={(value) => handleInputChange('pageLayout', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select page layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait (A4)</SelectItem>
                    <SelectItem value="landscape">Landscape (A4)</SelectItem>
                    <SelectItem value="letter">Letter Size</SelectItem>
                    <SelectItem value="legal">Legal Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Header Style</Label>
                <Select 
                  value={customizations.headerStyle} 
                  onValueChange={(value) => handleInputChange('headerStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select header style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="centered">Centered</SelectItem>
                    <SelectItem value="split">Split Layout</SelectItem>
                    <SelectItem value="banner">Full Banner</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show Watermark</Label>
                <Switch 
                  checked={customizations.showWatermark}
                  onCheckedChange={(checked) => handleInputChange('showWatermark', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show Page Numbers</Label>
                <Switch 
                  checked={customizations.showPageNumbers}
                  onCheckedChange={(checked) => handleInputChange('showPageNumbers', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Color Presets</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {colorPresets.map(preset => (
                  <div
                    key={preset.name}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      customizations.colorPreset === preset.name
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      handleInputChange('colorPreset', preset.name);
                      handleInputChange('primaryColor', preset.primary);
                      handleInputChange('secondaryColor', preset.secondary);
                      handleInputChange('accentColor', preset.accent);
                    }}
                  >
                    <div className="flex space-x-1 mb-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }}></div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondary }}></div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.accent }}></div>
                    </div>
                    <p className="text-xs font-medium">{preset.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={customizations.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customizations.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    placeholder="#1a56db"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={customizations.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customizations.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Accent Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={customizations.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customizations.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    placeholder="#60a5fa"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Background Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={customizations.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customizations.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Text Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={customizations.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customizations.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Font Family</Label>
                <Select 
                  value={customizations.fontFamily} 
                  onValueChange={(value) => handleInputChange('fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map(font => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Base Font Size</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.baseFontSize]}
                    onValueChange={(value) => handleInputChange('baseFontSize', value[0])}
                    min={8}
                    max={16}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8">{customizations.baseFontSize}px</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Header Font Size</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.headerFontSize]}
                    onValueChange={(value) => handleInputChange('headerFontSize', value[0])}
                    min={16}
                    max={48}
                    step={2}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{customizations.headerFontSize}px</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Title Font Size</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.titleFontSize]}
                    onValueChange={(value) => handleInputChange('titleFontSize', value[0])}
                    min={12}
                    max={24}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{customizations.titleFontSize}px</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Line Height</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.lineHeight]}
                    onValueChange={(value) => handleInputChange('lineHeight', value[0])}
                    min={1.0}
                    max={2.0}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8">{customizations.lineHeight}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Bold Headers</Label>
                <Switch 
                  checked={customizations.boldHeaders}
                  onCheckedChange={(checked) => handleInputChange('boldHeaders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Uppercase Titles</Label>
                <Switch 
                  checked={customizations.uppercaseTitles}
                  onCheckedChange={(checked) => handleInputChange('uppercaseTitles', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Page Margins</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.pageMargins]}
                    onValueChange={(value) => handleInputChange('pageMargins', value[0])}
                    min={10}
                    max={50}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{customizations.pageMargins}mm</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Section Spacing</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.sectionSpacing]}
                    onValueChange={(value) => handleInputChange('sectionSpacing', value[0])}
                    min={5}
                    max={30}
                    step={2}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{customizations.sectionSpacing}px</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Table Row Height</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.tableRowHeight]}
                    onValueChange={(value) => handleInputChange('tableRowHeight', value[0])}
                    min={6}
                    max={15}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{customizations.tableRowHeight}mm</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Header Height</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.headerHeight]}
                    onValueChange={(value) => handleInputChange('headerHeight', value[0])}
                    min={40}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{customizations.headerHeight}mm</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Footer Height</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.footerHeight]}
                    onValueChange={(value) => handleInputChange('footerHeight', value[0])}
                    min={15}
                    max={50}
                    step={2}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{customizations.footerHeight}mm</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show Borders</Label>
                <Switch 
                  checked={customizations.showBorders}
                  onCheckedChange={(checked) => handleInputChange('showBorders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Rounded Corners</Label>
                <Switch 
                  checked={customizations.roundedCorners}
                  onCheckedChange={(checked) => handleInputChange('roundedCorners', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Company Logo</Label>
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="text-center">
                  <img 
                    src={customizations.logoUrl} 
                    alt="Company Logo" 
                    className="h-20 max-w-full object-contain mx-auto mb-4"
                  />
                  <div className="flex items-center gap-2 justify-center">
                    <label className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span>Upload Logo</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="sr-only" 
                        onChange={onLogoChange}
                      />
                    </label>
                    <Button 
                      variant="outline"
                      onClick={() => handleInputChange('logoUrl', '/placeholder.svg')}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Logo Size</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.logoSize]}
                    onValueChange={(value) => handleInputChange('logoSize', value[0])}
                    min={20}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{customizations.logoSize}px</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Logo Position</Label>
                <Select 
                  value={customizations.logoPosition} 
                  onValueChange={(value) => handleInputChange('logoPosition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select logo position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="top-center">Top Center</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Company Name</Label>
                <Input
                  value={customizations.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="AMBA INSURANCE SERVICES"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Company Address</Label>
                <Textarea
                  value={customizations.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  placeholder="Mumbai Corporate Office&#10;123 Business District, Bandra Kurla Complex&#10;Mumbai, Maharashtra 400051, India"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Phone Number</Label>
                  <Input
                    value={customizations.companyPhone}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    placeholder="+91 22 6789 1234"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Email Address</Label>
                  <Input
                    value={customizations.companyEmail}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                    placeholder="info@ambainsurance.com"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Website</Label>
                <Input
                  value={customizations.companyWebsite}
                  onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                  placeholder="www.ambainsurance.com"
                />
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium mb-2 block">Watermark Text</Label>
              <Input
                value={customizations.watermarkText}
                onChange={(e) => handleInputChange('watermarkText', e.target.value)}
                placeholder="CONFIDENTIAL"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InvoiceCustomizer;
