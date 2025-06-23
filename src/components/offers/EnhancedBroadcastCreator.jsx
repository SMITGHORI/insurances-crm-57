
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  TestTube, 
  Clock, 
  Target,
  Plus,
  Trash2,
  Eye,
  Send,
  Save
} from 'lucide-react';
import { useCreateEnhancedBroadcast, useEligibleClients } from '@/hooks/useEnhancedBroadcastSystem';
import { useBroadcastTemplates } from '@/hooks/useEnhancedBroadcastSystem';

const EnhancedBroadcastCreator = () => {
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    description: '',
    type: 'offer',
    channels: ['email'],
    content: '',
    channelConfigs: {
      email: { subject: '', trackOpens: true, trackClicks: true },
      whatsapp: { template: '', mediaUrl: '' },
      sms: { provider: 'twilio', template: '', senderId: '' }
    },
    abTest: {
      enabled: false,
      variants: [],
      testDuration: 24,
      confidenceLevel: 95
    },
    targetAudience: {
      allClients: true,
      specificClients: [],
      clientTypes: [],
      tierLevels: [],
      locations: [],
      policyTypes: [],
      policyStatus: []
    },
    automation: {
      isAutomated: false,
      trigger: { type: '', conditions: {} },
      recurring: { enabled: false, pattern: 'daily' }
    },
    approval: { required: false },
    scheduledAt: '',
    campaign: { name: '', budget: 0 }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [previewClients, setPreviewClients] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const createBroadcast = useCreateEnhancedBroadcast();
  const getEligibleClients = useEligibleClients();
  const { data: templates } = useBroadcastTemplates();

  const handleInputChange = (field, value, nested = null) => {
    setBroadcastData(prev => {
      if (nested) {
        return {
          ...prev,
          [nested]: {
            ...prev[nested],
            [field]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleChannelChange = (channel, checked) => {
    setBroadcastData(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }));
  };

  const addAbTestVariant = () => {
    setBroadcastData(prev => ({
      ...prev,
      abTest: {
        ...prev.abTest,
        variants: [
          ...prev.abTest.variants,
          {
            name: `Variant ${prev.abTest.variants.length + 1}`,
            content: '',
            subject: '',
            percentage: 50
          }
        ]
      }
    }));
  };

  const removeAbTestVariant = (index) => {
    setBroadcastData(prev => ({
      ...prev,
      abTest: {
        ...prev.abTest,
        variants: prev.abTest.variants.filter((_, i) => i !== index)
      }
    }));
  };

  const handlePreviewClients = async () => {
    try {
      const result = await getEligibleClients.mutateAsync({
        targetAudience: broadcastData.targetAudience,
        channels: broadcastData.channels
      });
      setPreviewClients(result.data || []);
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing clients:', error);
    }
  };

  const handleSaveDraft = () => {
    const draftData = { ...broadcastData, status: 'draft' };
    createBroadcast.mutate(draftData);
  };

  const handleScheduleBroadcast = () => {
    const scheduledData = { 
      ...broadcastData, 
      status: broadcastData.approval.required ? 'pending_approval' : 'scheduled'
    };
    createBroadcast.mutate(scheduledData);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="targeting" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Targeting
          </TabsTrigger>
          <TabsTrigger value="abtest" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            A/B Test
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Set up the basic details of your broadcast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={broadcastData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter broadcast title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={broadcastData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={broadcastData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of this broadcast"
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Label>Channels</Label>
                <div className="flex flex-wrap gap-4">
                  {['email', 'whatsapp', 'sms', 'facebook', 'instagram', 'twitter'].map((channel) => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        id={channel}
                        checked={broadcastData.channels.includes(channel)}
                        onCheckedChange={(checked) => handleChannelChange(channel, checked)}
                      />
                      <Label htmlFor={channel} className="capitalize">{channel}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {broadcastData.channels.includes('email') && (
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input
                    id="email-subject"
                    value={broadcastData.channelConfigs.email.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value, 'channelConfigs.email')}
                    placeholder="Enter email subject line"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={broadcastData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter broadcast content. Use {{name}}, {{firstName}} for personalization."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>Define who should receive this broadcast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-clients"
                  checked={broadcastData.targetAudience.allClients}
                  onCheckedChange={(checked) => handleInputChange('allClients', checked, 'targetAudience')}
                />
                <Label htmlFor="all-clients">Send to all clients</Label>
              </div>

              {!broadcastData.targetAudience.allClients && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Client Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {['individual', 'corporate', 'group'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`client-${type}`}
                            checked={broadcastData.targetAudience.clientTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              const types = checked
                                ? [...broadcastData.targetAudience.clientTypes, type]
                                : broadcastData.targetAudience.clientTypes.filter(t => t !== type);
                              handleInputChange('clientTypes', types, 'targetAudience');
                            }}
                          />
                          <Label htmlFor={`client-${type}`} className="capitalize">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tier Levels</Label>
                    <div className="flex flex-wrap gap-2">
                      {['bronze', 'silver', 'gold', 'platinum'].map((tier) => (
                        <div key={tier} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tier-${tier}`}
                            checked={broadcastData.targetAudience.tierLevels.includes(tier)}
                            onCheckedChange={(checked) => {
                              const tiers = checked
                                ? [...broadcastData.targetAudience.tierLevels, tier]
                                : broadcastData.targetAudience.tierLevels.filter(t => t !== tier);
                              handleInputChange('tierLevels', tiers, 'targetAudience');
                            }}
                          />
                          <Label htmlFor={`tier-${tier}`} className="capitalize">{tier}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePreviewClients}
                  className="flex items-center gap-2"
                  disabled={getEligibleClients.isPending}
                >
                  <Eye className="h-4 w-4" />
                  Preview Eligible Clients
                </Button>
                {previewClients.length > 0 && (
                  <Badge variant="secondary">
                    {previewClients.length} eligible clients
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtest" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing</CardTitle>
              <CardDescription>Test different versions to optimize performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ab-test-enabled"
                  checked={broadcastData.abTest.enabled}
                  onCheckedChange={(checked) => handleInputChange('enabled', checked, 'abTest')}
                />
                <Label htmlFor="ab-test-enabled">Enable A/B Testing</Label>
              </div>

              {broadcastData.abTest.enabled && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Test Variants</h4>
                    <Button onClick={addAbTestVariant} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variant
                    </Button>
                  </div>

                  {broadcastData.abTest.variants.map((variant, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium">{variant.name}</h5>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAbTestVariant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label>Subject Line</Label>
                          <Input
                            value={variant.subject}
                            onChange={(e) => {
                              const variants = [...broadcastData.abTest.variants];
                              variants[index].subject = e.target.value;
                              handleInputChange('variants', variants, 'abTest');
                            }}
                            placeholder="Enter variant subject"
                          />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea
                            value={variant.content}
                            onChange={(e) => {
                              const variants = [...broadcastData.abTest.variants];
                              variants[index].content = e.target.value;
                              handleInputChange('variants', variants, 'abTest');
                            }}
                            placeholder="Enter variant content"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Traffic Percentage</Label>
                          <Input
                            type="number"
                            value={variant.percentage}
                            onChange={(e) => {
                              const variants = [...broadcastData.abTest.variants];
                              variants[index].percentage = parseInt(e.target.value) || 0;
                              handleInputChange('variants', variants, 'abTest');
                            }}
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Set up automated triggers and scheduling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="automation-enabled"
                  checked={broadcastData.automation.isAutomated}
                  onCheckedChange={(checked) => handleInputChange('isAutomated', checked, 'automation')}
                />
                <Label htmlFor="automation-enabled">Enable Automation</Label>
              </div>

              {broadcastData.automation.isAutomated && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Trigger Type</Label>
                    <Select 
                      value={broadcastData.automation.trigger.type} 
                      onValueChange={(value) => handleInputChange('type', value, 'automation.trigger')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="policy_expiry">Policy Expiry</SelectItem>
                        <SelectItem value="payment_due">Payment Due</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="claim_status">Claim Status</SelectItem>
                        <SelectItem value="new_client">New Client</SelectItem>
                        <SelectItem value="inactivity">Inactivity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring-enabled"
                      checked={broadcastData.automation.recurring.enabled}
                      onCheckedChange={(checked) => handleInputChange('enabled', checked, 'automation.recurring')}
                    />
                    <Label htmlFor="recurring-enabled">Recurring Broadcast</Label>
                  </div>
                </div>
              )}

              {!broadcastData.automation.isAutomated && (
                <div className="space-y-2">
                  <Label htmlFor="scheduled-at">Schedule Date & Time</Label>
                  <Input
                    id="scheduled-at"
                    type="datetime-local"
                    value={broadcastData.scheduledAt}
                    onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval & Compliance</CardTitle>
              <CardDescription>Configure approval workflow and compliance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="approval-required"
                  checked={broadcastData.approval.required}
                  onCheckedChange={(checked) => handleInputChange('required', checked, 'approval')}
                />
                <Label htmlFor="approval-required">Require Manager Approval</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={broadcastData.campaign.name}
                  onChange={(e) => handleInputChange('name', e.target.value, 'campaign')}
                  placeholder="Enter campaign name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-budget">Campaign Budget</Label>
                <Input
                  id="campaign-budget"
                  type="number"
                  value={broadcastData.campaign.budget}
                  onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0, 'campaign')}
                  placeholder="Enter budget amount"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button onClick={handleScheduleBroadcast} disabled={createBroadcast.isPending}>
          <Send className="h-4 w-4 mr-2" />
          {broadcastData.approval.required ? 'Submit for Approval' : 'Schedule Broadcast'}
        </Button>
      </div>

      {showPreview && previewClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Eligible Clients Preview</CardTitle>
            <CardDescription>
              {previewClients.length} clients will receive this broadcast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto">
              {previewClients.slice(0, 10).map((client) => (
                <div key={client._id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{client.displayName}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                  <Badge variant="outline">{client.tierLevel}</Badge>
                </div>
              ))}
              {previewClients.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">
                  ...and {previewClients.length - 10} more clients
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedBroadcastCreator;
