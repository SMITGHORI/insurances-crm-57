
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  FileText,
  Mail,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { useBroadcastTemplates, useCreateBroadcastTemplate } from '@/hooks/useEnhancedBroadcastSystem';

const BroadcastTemplates = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'offer',
    channels: ['email'],
    templates: {
      email: { subject: '', html: '', text: '' },
      whatsapp: { text: '', mediaType: 'none' },
      sms: { text: '', unicode: false }
    },
    variables: [],
    complianceNotes: ''
  });

  const { data: templates, isLoading } = useBroadcastTemplates({ category: selectedCategory !== 'all' ? selectedCategory : undefined });
  const createTemplate = useCreateBroadcastTemplate();

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'policy_renewal', label: 'Policy Renewal' },
    { value: 'payment_reminder', label: 'Payment Reminder' },
    { value: 'claim_update', label: 'Claim Update' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'welcome', label: 'Welcome' },
    { value: 'offer', label: 'Offer' },
    { value: 'festival', label: 'Festival' },
    { value: 'compliance', label: 'Compliance' },
  ];

  const getCategoryColor = (category) => {
    const colors = {
      policy_renewal: 'bg-blue-100 text-blue-800',
      payment_reminder: 'bg-yellow-100 text-yellow-800',
      claim_update: 'bg-purple-100 text-purple-800',
      birthday: 'bg-pink-100 text-pink-800',
      anniversary: 'bg-green-100 text-green-800',
      welcome: 'bg-cyan-100 text-cyan-800',
      offer: 'bg-orange-100 text-orange-800',
      festival: 'bg-red-100 text-red-800',
      compliance: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateTemplate = () => {
    createTemplate.mutate(newTemplate, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setNewTemplate({
          name: '',
          category: 'offer',
          channels: ['email'],
          templates: {
            email: { subject: '', html: '', text: '' },
            whatsapp: { text: '', mediaType: 'none' },
            sms: { text: '', unicode: false }
          },
          variables: [],
          complianceNotes: ''
        });
      }
    });
  };

  const addVariable = () => {
    setNewTemplate(prev => ({
      ...prev,
      variables: [
        ...prev.variables,
        { name: '', description: '', source: 'client', required: false }
      ]
    }));
  };

  const removeVariable = (index) => {
    setNewTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Broadcast Templates</h3>
          <p className="text-sm text-gray-500">Manage reusable templates for different types of broadcasts</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a reusable template for broadcasts
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-category">Category</Label>
                  <Select 
                    value={newTemplate.category} 
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Channel Templates */}
              <Tabs defaultValue="email" className="w-full">
                <TabsList>
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    SMS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Subject</Label>
                    <Input
                      id="email-subject"
                      value={newTemplate.templates.email.subject}
                      onChange={(e) => setNewTemplate(prev => ({
                        ...prev,
                        templates: {
                          ...prev.templates,
                          email: { ...prev.templates.email, subject: e.target.value }
                        }
                      }))}
                      placeholder="Enter email subject template"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-content">Content</Label>
                    <Textarea
                      id="email-content"
                      value={newTemplate.templates.email.html}
                      onChange={(e) => setNewTemplate(prev => ({
                        ...prev,
                        templates: {
                          ...prev.templates,
                          email: { ...prev.templates.email, html: e.target.value }
                        }
                      }))}
                      placeholder="Enter email content template"
                      rows={8}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="whatsapp" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-content">Message Content</Label>
                    <Textarea
                      id="whatsapp-content"
                      value={newTemplate.templates.whatsapp.text}
                      onChange={(e) => setNewTemplate(prev => ({
                        ...prev,
                        templates: {
                          ...prev.templates,
                          whatsapp: { ...prev.templates.whatsapp, text: e.target.value }
                        }
                      }))}
                      placeholder="Enter WhatsApp message template"
                      rows={6}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sms" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sms-content">SMS Content</Label>
                    <Textarea
                      id="sms-content"
                      value={newTemplate.templates.sms.text}
                      onChange={(e) => setNewTemplate(prev => ({
                        ...prev,
                        templates: {
                          ...prev.templates,
                          sms: { ...prev.templates.sms, text: e.target.value }
                        }
                      }))}
                      placeholder="Enter SMS template (160 characters max)"
                      rows={4}
                      maxLength={160}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Variables */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Template Variables</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
                
                {newTemplate.variables.map((variable, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Variable name (e.g., name)"
                      value={variable.name}
                      onChange={(e) => {
                        const variables = [...newTemplate.variables];
                        variables[index].name = e.target.value;
                        setNewTemplate(prev => ({ ...prev, variables }));
                      }}
                    />
                    <Input
                      placeholder="Description"
                      value={variable.description}
                      onChange={(e) => {
                        const variables = [...newTemplate.variables];
                        variables[index].description = e.target.value;
                        setNewTemplate(prev => ({ ...prev, variables }));
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariable(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} disabled={createTemplate.isPending}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.data?.map((template) => (
          <Card key={template._id} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category.replace('_', ' ')}
                    </Badge>
                    {template.isCompliant && (
                      <Badge variant="outline" className="text-green-600">
                        Compliant
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Channels */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Channels:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.channels.map((channel) => (
                      <Badge key={channel} variant="outline" className="text-xs">
                        {channel === 'email' && <Mail className="h-3 w-3 mr-1" />}
                        {channel === 'whatsapp' && <MessageSquare className="h-3 w-3 mr-1" />}
                        {channel === 'sms' && <Smartphone className="h-3 w-3 mr-1" />}
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Variables */}
                {template.variables?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable) => (
                        <Badge key={variable.name} variant="secondary" className="text-xs">
                          {`{{${variable.name}}}`}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.variables.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-2">
                  <Button size="sm" variant="outline">
                    Use Template
                  </Button>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {templates?.data?.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            {selectedCategory !== 'all' 
              ? `No templates found in the ${categories.find(c => c.value === selectedCategory)?.label} category.`
              : 'Create your first template to get started with broadcast automation.'
            }
          </p>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Template
          </Button>
        </div>
      )}
    </div>
  );
};

export default BroadcastTemplates;
