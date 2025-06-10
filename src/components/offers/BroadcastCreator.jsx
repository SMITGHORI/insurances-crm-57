
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Eye, Calendar, Users } from 'lucide-react';
import { useCreateBroadcast, useEligibleClients } from '@/hooks/useBroadcast';

const BroadcastCreator = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    channels: [],
    subject: '',
    content: '',
    targetAudience: {
      allClients: true,
      specificClients: [],
      clientTypes: [],
      tierLevels: [],
      locations: []
    },
    scheduledAt: ''
  });

  const [eligibleClients, setEligibleClients] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const createBroadcast = useCreateBroadcast();
  const getEligibleClients = useEligibleClients();

  const broadcastTypes = [
    { value: 'offer', label: 'Special Offer' },
    { value: 'festival', label: 'Festival Greeting' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'reminder', label: 'Reminder' }
  ];

  const clientTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'group', label: 'Group' }
  ];

  const tierLevels = [
    { value: 'bronze', label: 'Bronze' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTargetAudienceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [field]: value
      }
    }));
  };

  const handleChannelChange = (channel, checked) => {
    setFormData(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }));
  };

  const handleArrayFieldChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [field]: checked
          ? [...prev.targetAudience[field], value]
          : prev.targetAudience[field].filter(item => item !== value)
      }
    }));
  };

  const handlePreviewClients = async () => {
    if (formData.channels.length === 0) {
      toast.error('Please select at least one communication channel');
      return;
    }

    try {
      const response = await getEligibleClients.mutateAsync({
        targetAudience: formData.targetAudience,
        channels: formData.channels
      });
      setEligibleClients(response.data || []);
      setShowPreview(true);
    } catch (error) {
      console.error('Error fetching eligible clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || formData.channels.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createBroadcast.mutateAsync(formData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: '',
        channels: [],
        subject: '',
        content: '',
        targetAudience: {
          allClients: true,
          specificClients: [],
          clientTypes: [],
          tierLevels: [],
          locations: []
        },
        scheduledAt: ''
      });
      setEligibleClients([]);
      setShowPreview(false);
    } catch (error) {
      console.error('Error creating broadcast:', error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter broadcast title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select broadcast type" />
              </SelectTrigger>
              <SelectContent>
                {broadcastTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of the broadcast"
          />
        </div>

        {/* Communication Channels */}
        <div className="space-y-2">
          <Label>Communication Channels *</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email"
                checked={formData.channels.includes('email')}
                onCheckedChange={(checked) => handleChannelChange('email', checked)}
              />
              <Label htmlFor="email">Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="whatsapp"
                checked={formData.channels.includes('whatsapp')}
                onCheckedChange={(checked) => handleChannelChange('whatsapp', checked)}
              />
              <Label htmlFor="whatsapp">WhatsApp</Label>
            </div>
          </div>
        </div>

        {/* Email Subject (if email is selected) */}
        {formData.channels.includes('email') && (
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Enter email subject"
              required
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Message Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Enter your message content. Use {{name}}, {{firstName}} for personalization"
            className="min-h-32"
            required
          />
          <p className="text-sm text-gray-500">
            Use placeholders: {{name}}, {{firstName}}, {{email}}, {{phone}} for personalization
          </p>
        </div>

        {/* Target Audience */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Target Audience</CardTitle>
            <CardDescription>Select who should receive this broadcast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allClients"
                checked={formData.targetAudience.allClients}
                onCheckedChange={(checked) => handleTargetAudienceChange('allClients', checked)}
              />
              <Label htmlFor="allClients">All Active Clients</Label>
            </div>

            {!formData.targetAudience.allClients && (
              <div className="space-y-4 pl-6">
                {/* Client Types */}
                <div className="space-y-2">
                  <Label>Client Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {clientTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`clientType-${type.value}`}
                          checked={formData.targetAudience.clientTypes.includes(type.value)}
                          onCheckedChange={(checked) => handleArrayFieldChange('clientTypes', type.value, checked)}
                        />
                        <Label htmlFor={`clientType-${type.value}`}>{type.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tier Levels */}
                <div className="space-y-2">
                  <Label>Loyalty Tiers</Label>
                  <div className="flex flex-wrap gap-2">
                    {tierLevels.map((tier) => (
                      <div key={tier.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tier-${tier.value}`}
                          checked={formData.targetAudience.tierLevels.includes(tier.value)}
                          onCheckedChange={(checked) => handleArrayFieldChange('tierLevels', tier.value, checked)}
                        />
                        <Label htmlFor={`tier-${tier.value}`}>{tier.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule */}
        <div className="space-y-2">
          <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="text-sm text-gray-500">
            Leave empty to send immediately
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreviewClients}
            disabled={getEligibleClients.isPending}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview Recipients ({eligibleClients.length})
          </Button>
          
          <Button
            type="submit"
            disabled={createBroadcast.isPending}
            className="flex items-center gap-2"
          >
            {formData.scheduledAt ? (
              <>
                <Calendar className="h-4 w-4" />
                Schedule Broadcast
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Now
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Preview Recipients */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Eligible Recipients ({eligibleClients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eligibleClients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                {eligibleClients.map((client) => (
                  <div key={client._id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{client.displayName}</h4>
                    <p className="text-sm text-gray-500">{client.email}</p>
                    <p className="text-sm text-gray-500">{client.phone}</p>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {client.clientType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {client.tierLevel || 'bronze'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No eligible clients found for the selected criteria
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BroadcastCreator;
