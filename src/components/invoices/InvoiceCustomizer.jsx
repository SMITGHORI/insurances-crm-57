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
import { Checkbox } from '@/components/ui/checkbox';
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
  Settings2,
  Zap,
  Eye,
  Code,
  Globe,
  QrCode,
  PenTool,
  Filter,
  Layers,
  Grid,
  Sparkles,
  Wand2,
  MonitorSpeaker,
  Package,
  Calculator,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Banknote,
  CreditCard,
  Shield,
  Award,
  Star,
  Heart,
  Lightbulb,
  Target,
  Zap as ZapIcon
} from 'lucide-react';

const InvoiceCustomizer = ({ 
  customizations, 
  onCustomizationChange, 
  onLogoChange, 
  onResetCustomizations 
}) => {
  const [activeTab, setActiveTab] = useState('layout');
  const [previewMode, setPreviewMode] = useState('desktop');

  const handleInputChange = (field, value) => {
    onCustomizationChange(field, value);
  };

  // Advanced Color Presets with Gradients and Themes
  const advancedColorPresets = [
    { 
      name: 'Corporate Blue', 
      primary: '#1a56db', 
      secondary: '#3b82f6', 
      accent: '#60a5fa',
      gradient: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
      theme: 'professional'
    },
    { 
      name: 'Sunset Gradient', 
      primary: '#ff6b6b', 
      secondary: '#feca57', 
      accent: '#ff9ff3',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
      theme: 'creative'
    },
    { 
      name: 'Ocean Breeze', 
      primary: '#0891b2', 
      secondary: '#06b6d4', 
      accent: '#67e8f9',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)',
      theme: 'modern'
    },
    { 
      name: 'Forest Premium', 
      primary: '#059669', 
      secondary: '#10b981', 
      accent: '#6ee7b7',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      theme: 'eco'
    },
    { 
      name: 'Royal Purple', 
      primary: '#7c3aed', 
      secondary: '#a855f7', 
      accent: '#c084fc',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      theme: 'luxury'
    },
    { 
      name: 'Midnight Dark', 
      primary: '#1f2937', 
      secondary: '#374151', 
      accent: '#6b7280',
      gradient: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      theme: 'dark'
    },
    { 
      name: 'Golden Elegance', 
      primary: '#d97706', 
      secondary: '#f59e0b', 
      accent: '#fbbf24',
      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      theme: 'premium'
    },
    { 
      name: 'Rose Quartz', 
      primary: '#e11d48', 
      secondary: '#f43f5e', 
      accent: '#fb7185',
      gradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
      theme: 'feminine'
    }
  ];

  // Advanced Font Combinations
  const fontCombinations = [
    { name: 'Modern Professional', heading: 'Inter', body: 'Inter', style: 'sans-serif' },
    { name: 'Classic Elegant', heading: 'Playfair Display', body: 'Lora', style: 'serif' },
    { name: 'Tech Minimalist', heading: 'JetBrains Mono', body: 'Roboto', style: 'mono' },
    { name: 'Creative Bold', heading: 'Montserrat', body: 'Open Sans', style: 'sans-serif' },
    { name: 'Corporate Standard', heading: 'Arial', body: 'Helvetica', style: 'sans-serif' },
    { name: 'Designer Choice', heading: 'Poppins', body: 'Nunito', style: 'sans-serif' },
    { name: 'Editorial Style', heading: 'Crimson Text', body: 'Source Serif Pro', style: 'serif' },
    { name: 'Startup Fresh', heading: 'Space Grotesk', body: 'DM Sans', style: 'sans-serif' }
  ];

  // Advanced Layout Templates
  const advancedTemplates = [
    { 
      id: 'executive', 
      name: 'Executive Suite', 
      description: 'Premium layout with sophisticated styling',
      preview: '👔',
      features: ['Premium Header', 'Signature Area', 'QR Code'],
      complexity: 'advanced'
    },
    { 
      id: 'creative-agency', 
      name: 'Creative Agency', 
      description: 'Bold design with creative elements',
      preview: '🎨',
      features: ['Asymmetric Layout', 'Color Blocks', 'Custom Graphics'],
      complexity: 'advanced'
    },
    { 
      id: 'tech-startup', 
      name: 'Tech Startup', 
      description: 'Modern tech-focused design',
      preview: '💻',
      features: ['Code-Style Elements', 'Gradient Backgrounds', 'Icons'],
      complexity: 'intermediate'
    },
    { 
      id: 'legal-professional', 
      name: 'Legal Professional', 
      description: 'Conservative and trustworthy design',
      preview: '⚖️',
      features: ['Traditional Layout', 'Security Elements', 'Formal Styling'],
      complexity: 'standard'
    },
    { 
      id: 'medical-healthcare', 
      name: 'Medical & Healthcare', 
      description: 'Clean and professional medical styling',
      preview: '🏥',
      features: ['Medical Icons', 'Clean Typography', 'Trust Elements'],
      complexity: 'standard'
    },
    { 
      id: 'fashion-retail', 
      name: 'Fashion & Retail', 
      description: 'Stylish and trendy design',
      preview: '👗',
      features: ['Fashion Elements', 'Elegant Typography', 'Lifestyle Imagery'],
      complexity: 'intermediate'
    }
  ];

  // Animation Presets
  const animationPresets = [
    { name: 'None', value: 'none', description: 'No animations' },
    { name: 'Subtle Fade', value: 'fade', description: 'Gentle fade-in effects' },
    { name: 'Slide In', value: 'slide', description: 'Elements slide into view' },
    { name: 'Scale Up', value: 'scale', description: 'Elements scale into view' },
    { name: 'Bounce', value: 'bounce', description: 'Playful bounce effects' },
    { name: 'Professional', value: 'professional', description: 'Smooth professional transitions' }
  ];

  // Conditional Formatting Rules
  const conditionalRules = [
    { condition: 'amount_over_10000', action: 'highlight_total', label: 'Highlight totals over ₹10,000' },
    { condition: 'overdue_status', action: 'red_border', label: 'Red border for overdue invoices' },
    { condition: 'vip_client', action: 'premium_styling', label: 'Premium styling for VIP clients' },
    { condition: 'first_time_client', action: 'welcome_message', label: 'Welcome message for new clients' }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Sparkles className="mr-2 h-6 w-6 text-blue-600" />
            Advanced Invoice Customization
            <span className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full">PRO</span>
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}>
              <MonitorSpeaker className="mr-2 h-4 w-4" />
              {previewMode === 'desktop' ? 'Mobile' : 'Desktop'} Preview
            </Button>
            <Button variant="outline" size="sm" onClick={onResetCustomizations}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset All
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-8 w-full mb-6">
            <TabsTrigger value="layout" className="flex items-center text-xs">
              <Layout className="mr-1 h-3 w-3" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center text-xs">
              <Palette className="mr-1 h-3 w-3" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center text-xs">
              <Type className="mr-1 h-3 w-3" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="spacing" className="flex items-center text-xs">
              <Move className="mr-1 h-3 w-3" />
              Spacing
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center text-xs">
              <Image className="mr-1 h-3 w-3" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="effects" className="flex items-center text-xs">
              <Wand2 className="mr-1 h-3 w-3" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="conditional" className="flex items-center text-xs">
              <Filter className="mr-1 h-3 w-3" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center text-xs">
              <Code className="mr-1 h-3 w-3" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Advanced Template Selection</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advancedTemplates.map(template => (
                  <div 
                    key={template.id}
                    className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                      customizations.template === template.id 
                        ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10 ring-2 ring-primary/20 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('template', template.id)}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-3">{template.preview}</div>
                      <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                      <div className="flex flex-wrap gap-1 justify-center mb-2">
                        {template.features.map(feature => (
                          <span key={feature} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        template.complexity === 'advanced' ? 'bg-red-100 text-red-800' :
                        template.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {template.complexity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <SelectItem value="letter">Letter Size (US)</SelectItem>
                    <SelectItem value="legal">Legal Size (US)</SelectItem>
                    <SelectItem value="a3">A3 Large Format</SelectItem>
                    <SelectItem value="custom">Custom Size</SelectItem>
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
                    <SelectItem value="gradient">Gradient Background</SelectItem>
                    <SelectItem value="image">Image Background</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Footer Style</Label>
                <Select 
                  value={customizations.footerStyle || 'standard'} 
                  onValueChange={(value) => handleInputChange('footerStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select footer style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="contact-focused">Contact Focused</SelectItem>
                    <SelectItem value="social-media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Watermark</Label>
                <Switch 
                  checked={customizations.showWatermark}
                  onCheckedChange={(checked) => handleInputChange('showWatermark', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Page Numbers</Label>
                <Switch 
                  checked={customizations.showPageNumbers}
                  onCheckedChange={(checked) => handleInputChange('showPageNumbers', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">QR Code</Label>
                <Switch 
                  checked={customizations.showQRCode || false}
                  onCheckedChange={(checked) => handleInputChange('showQRCode', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Signature Area</Label>
                <Switch 
                  checked={customizations.showSignature || false}
                  onCheckedChange={(checked) => handleInputChange('showSignature', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Advanced Color Themes</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {advancedColorPresets.map(preset => (
                  <div
                    key={preset.name}
                    className={`border rounded-xl p-3 cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                      customizations.colorPreset === preset.name
                        ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      handleInputChange('colorPreset', preset.name);
                      handleInputChange('primaryColor', preset.primary);
                      handleInputChange('secondaryColor', preset.secondary);
                      handleInputChange('accentColor', preset.accent);
                      handleInputChange('gradientBackground', preset.gradient);
                    }}
                  >
                    <div 
                      className="w-full h-8 rounded-lg mb-2"
                      style={{ background: preset.gradient }}
                    ></div>
                    <div className="flex space-x-1 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }}></div>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }}></div>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }}></div>
                    </div>
                    <p className="text-xs font-medium mb-1">{preset.name}</p>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {preset.theme}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Primary Color</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={customizations.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={customizations.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      placeholder="#1a56db"
                      className="flex-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Opacity</Label>
                    <Slider
                      value={[customizations.primaryOpacity || 100]}
                      onValueChange={(value) => handleInputChange('primaryOpacity', value[0])}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Secondary Color</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={customizations.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={customizations.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Opacity</Label>
                    <Slider
                      value={[customizations.secondaryOpacity || 100]}
                      onValueChange={(value) => handleInputChange('secondaryOpacity', value[0])}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Accent Color</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={customizations.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
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

              <div>
                <Label className="text-sm font-medium mb-2 block">Background</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={customizations.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={customizations.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={customizations.useGradientBackground || false}
                      onCheckedChange={(checked) => handleInputChange('useGradientBackground', checked)}
                    />
                    <Label className="text-xs">Use Gradient</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Font Combinations</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {fontCombinations.map(combo => (
                  <div
                    key={combo.name}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      customizations.fontCombination === combo.name
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      handleInputChange('fontCombination', combo.name);
                      handleInputChange('headingFont', combo.heading);
                      handleInputChange('bodyFont', combo.body);
                    }}
                  >
                    <div className="text-center">
                      <h4 className="font-semibold text-sm mb-2" style={{ fontFamily: combo.heading }}>
                        {combo.name}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2" style={{ fontFamily: combo.body }}>
                        Sample text with this combination
                      </p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {combo.style}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Base Font Size</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.baseFontSize]}
                    onValueChange={(value) => handleInputChange('baseFontSize', value[0])}
                    min={8}
                    max={20}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{customizations.baseFontSize}px</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Heading Size</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.headerFontSize]}
                    onValueChange={(value) => handleInputChange('headerFontSize', value[0])}
                    min={16}
                    max={64}
                    step={2}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{customizations.headerFontSize}px</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Line Height</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.lineHeight]}
                    onValueChange={(value) => handleInputChange('lineHeight', value[0])}
                    min={1.0}
                    max={3.0}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8">{customizations.lineHeight}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Letter Spacing</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customizations.letterSpacing || 0]}
                    onValueChange={(value) => handleInputChange('letterSpacing', value[0])}
                    min={-2}
                    max={5}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{customizations.letterSpacing || 0}px</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Text Shadows</Label>
                <Switch 
                  checked={customizations.textShadows || false}
                  onCheckedChange={(checked) => handleInputChange('textShadows', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Italic Accents</Label>
                <Switch 
                  checked={customizations.italicAccents || false}
                  onCheckedChange={(checked) => handleInputChange('italicAccents', checked)}
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

          <TabsContent value="effects" className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Visual Effects & Animations</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Animation Style</Label>
                  <Select 
                    value={customizations.animationStyle || 'none'} 
                    onValueChange={(value) => handleInputChange('animationStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select animation style" />
                    </SelectTrigger>
                    <SelectContent>
                      {animationPresets.map(preset => (
                        <SelectItem key={preset.value} value={preset.value}>
                          <div>
                            <div className="font-medium">{preset.name}</div>
                            <div className="text-xs text-gray-500">{preset.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Shadow Intensity</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[customizations.shadowIntensity || 0]}
                      onValueChange={(value) => handleInputChange('shadowIntensity', value[0])}
                      min={0}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">{customizations.shadowIntensity || 0}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Hover Effects</Label>
                  <Switch 
                    checked={customizations.hoverEffects || false}
                    onCheckedChange={(checked) => handleInputChange('hoverEffects', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Gradient Overlays</Label>
                  <Switch 
                    checked={customizations.gradientOverlays || false}
                    onCheckedChange={(checked) => handleInputChange('gradientOverlays', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Pattern Background</Label>
                  <Switch 
                    checked={customizations.patternBackground || false}
                    onCheckedChange={(checked) => handleInputChange('patternBackground', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Glowing Elements</Label>
                  <Switch 
                    checked={customizations.glowingElements || false}
                    onCheckedChange={(checked) => handleInputChange('glowingElements', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conditional" className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Conditional Formatting Rules</Label>
              <p className="text-sm text-gray-600 mb-4">
                Set up rules that automatically apply different styling based on invoice data
              </p>
              
              <div className="space-y-4">
                {conditionalRules.map((rule, index) => (
                  <div key={rule.condition} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-medium">{rule.label}</Label>
                      <Switch 
                        checked={customizations.conditionalRules?.[rule.condition] || false}
                        onCheckedChange={(checked) => {
                          const newRules = { ...customizations.conditionalRules, [rule.condition]: checked };
                          handleInputChange('conditionalRules', newRules);
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      When {rule.condition.replace(/_/g, ' ')}, apply {rule.action.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Advanced Features</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <QrCode className="mr-2 h-4 w-4" />
                    QR Code Settings
                  </h4>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">QR Code Content</Label>
                    <Select 
                      value={customizations.qrCodeContent || 'invoice_url'} 
                      onValueChange={(value) => handleInputChange('qrCodeContent', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select QR content" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invoice_url">Invoice URL</SelectItem>
                        <SelectItem value="payment_link">Payment Link</SelectItem>
                        <SelectItem value="company_website">Company Website</SelectItem>
                        <SelectItem value="contact_info">Contact Information</SelectItem>
                        <SelectItem value="custom">Custom Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {customizations.qrCodeContent === 'custom' && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Custom QR Content</Label>
                      <Textarea
                        value={customizations.customQRContent || ''}
                        onChange={(e) => handleInputChange('customQRContent', e.target.value)}
                        placeholder="Enter custom QR code content..."
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <PenTool className="mr-2 h-4 w-4" />
                    Digital Signature
                  </h4>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Signature Position</Label>
                    <Select 
                      value={customizations.signaturePosition || 'bottom_right'} 
                      onValueChange={(value) => handleInputChange('signaturePosition', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select signature position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom_left">Bottom Left</SelectItem>
                        <SelectItem value="bottom_right">Bottom Right</SelectItem>
                        <SelectItem value="bottom_center">Bottom Center</SelectItem>
                        <SelectItem value="custom">Custom Position</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Signature Text</Label>
                    <Input
                      value={customizations.signatureText || 'Authorized Signature'}
                      onChange={(e) => handleInputChange('signatureText', e.target.value)}
                      placeholder="Signature line text"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  Multi-Language Support
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Primary Language</Label>
                    <Select 
                      value={customizations.primaryLanguage || 'en'} 
                      onValueChange={(value) => handleInputChange('primaryLanguage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                        <SelectItem value="gu">Gujarati</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Currency Format</Label>
                    <Select 
                      value={customizations.currencyFormat || 'INR'} 
                      onValueChange={(value) => handleInputChange('currencyFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">₹ Indian Rupee</SelectItem>
                        <SelectItem value="USD">$ US Dollar</SelectItem>
                        <SelectItem value="EUR">€ Euro</SelectItem>
                        <SelectItem value="GBP">£ British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Date Format</Label>
                    <Select 
                      value={customizations.dateFormat || 'DD/MM/YYYY'} 
                      onValueChange={(value) => handleInputChange('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Print Optimization</Label>
                  <Switch 
                    checked={customizations.printOptimization || false}
                    onCheckedChange={(checked) => handleInputChange('printOptimization', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Mobile Responsive</Label>
                  <Switch 
                    checked={customizations.mobileResponsive || true}
                    onCheckedChange={(checked) => handleInputChange('mobileResponsive', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Dark Mode Support</Label>
                  <Switch 
                    checked={customizations.darkModeSupport || false}
                    onCheckedChange={(checked) => handleInputChange('darkModeSupport', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Accessibility Features</Label>
                  <Switch 
                    checked={customizations.accessibilityFeatures || false}
                    onCheckedChange={(checked) => handleInputChange('accessibilityFeatures', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InvoiceCustomizer;
