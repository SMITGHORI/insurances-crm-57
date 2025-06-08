
import React, { useState } from 'react';
import { Send, User, Mail, Phone, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSendCommunication } from '@/hooks/useCommunication';
import { useClients } from '@/hooks/useClients';

const SendCommunicationDialog = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    type: 'custom',
    channel: 'email',
    subject: '',
    content: '',
    scheduledFor: ''
  });

  const [clientSearch, setClientSearch] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);

  const sendCommunication = useSendCommunication();
  const { data: clients } = useClients({ search: clientSearch, limit: 10 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.content) {
      return;
    }

    try {
      await sendCommunication.mutateAsync(formData);
      
      // Reset form and close dialog
      setFormData({
        clientId: '',
        type: 'custom',
        channel: 'email',
        subject: '',
        content: '',
        scheduledFor: ''
      });
      setClientSearch('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending communication:', error);
    }
  };

  const handleClientSelect = (client) => {
    setFormData(prev => ({ ...prev, clientId: client._id }));
    setClientSearch(client.displayName);
    setShowClientSearch(false);
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'whatsapp':
        return <Phone className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Send className="h-5 w-5 mr-2 text-blue-600" />
            Send Communication
          </DialogTitle>
          <DialogDescription>
            Send a custom message to a client via email, WhatsApp, or SMS.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Select Client *</Label>
            <div className="relative">
              <div className="flex items-center border rounded-md px-3 py-2">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <Input
                  placeholder="Search for a client..."
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientSearch(true);
                    setFormData(prev => ({ ...prev, clientId: '' }));
                  }}
                  onFocus={() => setShowClientSearch(true)}
                  className="border-0 p-0 focus:ring-0"
                />
              </div>
              
              {showClientSearch && clientSearch && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {clients?.data?.length > 0 ? (
                    clients.data.map((client) => (
                      <div
                        key={client._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleClientSelect(client)}
                      >
                        <div className="font-medium">{client.displayName}</div>
                        <div className="text-sm text-gray-500">
                          {client.email} • {client.phone}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {client.clientType}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No clients found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Communication Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Communication Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Message</SelectItem>
                <SelectItem value="birthday">Birthday Greeting</SelectItem>
                <SelectItem value="anniversary">Anniversary Greeting</SelectItem>
                <SelectItem value="offer">Offer Notification</SelectItem>
                <SelectItem value="points">Points Update</SelectItem>
                <SelectItem value="renewal_reminder">Renewal Reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Channel Selection */}
          <div className="space-y-2">
            <Label htmlFor="channel">Channel *</Label>
            <div className="grid grid-cols-3 gap-2">
              {['email', 'whatsapp', 'sms'].map((channel) => (
                <Button
                  key={channel}
                  type="button"
                  variant={formData.channel === channel ? 'default' : 'outline'}
                  className="flex items-center justify-center"
                  onClick={() => setFormData(prev => ({ ...prev, channel }))}
                >
                  {getChannelIcon(channel)}
                  <span className="ml-2 capitalize">{channel}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Subject (for email) */}
          {formData.channel === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Enter email subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>
          )}

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Message Content *</Label>
            <Textarea
              id="content"
              placeholder="Enter your message here..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              required
            />
            <p className="text-xs text-gray-500">
              Character count: {formData.content.length}/2000
            </p>
          </div>

          {/* Scheduled Send (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="scheduledFor">Schedule for Later (Optional)</Label>
            <Input
              id="scheduledFor"
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500">
              Leave empty to send immediately
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sendCommunication.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.clientId || !formData.content || sendCommunication.isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendCommunication.isLoading ? (
                'Sending...'
              ) : formData.scheduledFor ? (
                'Schedule Message'
              ) : (
                'Send Now'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendCommunicationDialog;
