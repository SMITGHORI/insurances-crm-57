
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Send, Save, Users, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useCreateBroadcast, useUpdateBroadcast, useBroadcast, useEligibleClients } from '@/hooks/useBroadcast';
import { useClients } from '@/hooks/useClients';
import { cn } from '@/lib/utils';

const BroadcastForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // MongoDB-connected hooks
  const { data: existingBroadcast, isLoading: loadingBroadcast } = useBroadcast(id);
  const { data: clientsData } = useClients({ limit: 1000 });
  const createBroadcastMutation = useCreateBroadcast();
  const updateBroadcastMutation = useUpdateBroadcast();
  const eligibleClientsMutation = useEligibleClients();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    channels: [],
    subject: '',
    content: '',
    mediaUrl: '',
    targetAudience: {
      allClients: false,
      specificClients: [],
      clientTypes: [],
      tierLevels: [],
      locations: []
    },
    scheduledAt: null
  });

  const [eligibleClients, setEligibleClients] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Populate form data when editing
  useEffect(() => {
    if (isEditing && existingBroadcast) {
      console.log('Loading existing broadcast from MongoDB:', existingBroadcast);
      setFormData({
        title: existingBroadcast.title || '',
        description: existingBroadcast.description || '',
        type: existingBroadcast.type || '',
        channels: existingBroadcast.channels || [],
        subject: existingBroadcast.subject || '',
        content: existingBroadcast.content || '',
        mediaUrl: existingBroadcast.mediaUrl || '',
        targetAudience: existingBroadcast.targetAudience || {
          allClients: false,
          specificClients: [],
          clientTypes: [],
          tierLevels: [],
          locations: []
        },
        scheduledAt: existingBroadcast.scheduledAt ? new Date(existingBroadcast.scheduledAt) : null
      });
    }
  }, [isEditing, existingBroadcast]);

  // Get eligible clients when target audience changes
  useEffect(() => {
    if (formData.targetAudience && formData.channels.length > 0) {
      eligibleClientsMutation.mutate(
        { 
          targetAudience: formData.targetAudience, 
          channels: formData.channels 
        },
        {
          onSuccess: (data) => {
            console.log('Eligible clients fetched from MongoDB:', data);
            setEligibleClients(data.clients || []);
          }
        }
      );
    }
  }, [formData.targetAudience, formData.channels]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChannelChange = (channel, isChecked) => {
    const updatedChannels = isChecked 
      ? [...formData.channels, channel]
      : formData.channels.filter(c => c !== channel);
    
    setFormData(prev => ({
      ...prev,
      channels: updatedChannels
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

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();

    const broadcastData = {
      ...formData,
      status: isDraft ? 'draft' : 'scheduled'
    };

    console.log('Submitting broadcast to MongoDB:', broadcastData);

    try {
      if (isEditing) {
        await updateBroadcastMutation.mutateAsync({
          broadcastId: id,
          broadcastData
        });
      } else {
        await createBroadcastMutation.mutateAsync(broadcastData);
      }
      
      navigate('/broadcasts');
    } catch (error) {
      console.error('Error saving broadcast to MongoDB:', error);
    }
  };

  const clients = clientsData?.clients || [];

  if (isEditing && loadingBroadcast) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/broadcasts')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Broadcast' : 'Create New Broadcast'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connected to MongoDB • Real-time database operations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter broadcast title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter broadcast description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select broadcast type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Channels */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Channels *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['email', 'whatsapp'].map((channel) => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        id={channel}
                        checked={formData.channels.includes(channel)}
                        onCheckedChange={(checked) => handleChannelChange(channel, checked)}
                      />
                      <Label htmlFor={channel} className="capitalize">
                        {channel === 'whatsapp' ? 'WhatsApp' : channel}
                      </Label>
                    </div>
                  ))}
                </div>

                {formData.channels.includes('email') && (
                  <div className="mt-4">
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
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Enter your message content"
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mediaUrl">Media URL (Optional)</Label>
                  <Input
                    id="mediaUrl"
                    value={formData.mediaUrl}
                    onChange={(e) => handleInputChange('mediaUrl', e.target.value)}
                    placeholder="Enter image or media URL"
                    type="url"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card>
              <CardHeader>
                <CardTitle>Target Audience *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allClients"
                    checked={formData.targetAudience.allClients}
                    onCheckedChange={(checked) => handleTargetAudienceChange('allClients', checked)}
                  />
                  <Label htmlFor="allClients">All Clients</Label>
                </div>

                {!formData.targetAudience.allClients && (
                  <div className="space-y-4">
                    <div>
                      <Label>Specific Clients</Label>
                      <div className="mt-2 max-h-32 overflow-y-auto border rounded p-2">
                        {clients.map((client) => (
                          <div key={client._id} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              id={`client-${client._id}`}
                              checked={formData.targetAudience.specificClients.includes(client._id)}
                              onCheckedChange={(checked) => {
                                const updatedClients = checked
                                  ? [...formData.targetAudience.specificClients, client._id]
                                  : formData.targetAudience.specificClients.filter(id => id !== client._id);
                                handleTargetAudienceChange('specificClients', updatedClients);
                              }}
                            />
                            <Label htmlFor={`client-${client._id}`} className="text-sm">
                              {client.displayName || client.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Schedule Date & Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !formData.scheduledAt && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduledAt ? format(formData.scheduledAt, "PPP p") : "Schedule for later"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.scheduledAt}
                        onSelect={(date) => handleInputChange('scheduledAt', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={createBroadcastMutation.isLoading || updateBroadcastMutation.isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={createBroadcastMutation.isLoading || updateBroadcastMutation.isLoading}
              >
                <Send className="mr-2 h-4 w-4" />
                {isEditing ? 'Update & Schedule' : 'Create & Schedule'}
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Title:</p>
                  <p className="text-sm text-gray-600">{formData.title || 'Enter title'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Content:</p>
                  <p className="text-sm text-gray-600">{formData.content || 'Enter content'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Channels:</p>
                  <div className="flex gap-1 mt-1">
                    {formData.channels.map(channel => (
                      <Badge key={channel} variant="secondary" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligible Clients */}
          {eligibleClients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Eligible Recipients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {eligibleClients.length} client(s) will receive this broadcast
                  </p>
                  <div className="max-h-32 overflow-y-auto">
                    {eligibleClients.slice(0, 5).map((client, index) => (
                      <p key={client._id || index} className="text-xs text-gray-500">
                        {client.displayName || client.name || client.email}
                      </p>
                    ))}
                    {eligibleClients.length > 5 && (
                      <p className="text-xs text-gray-400">
                        +{eligibleClients.length - 5} more...
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BroadcastForm;
