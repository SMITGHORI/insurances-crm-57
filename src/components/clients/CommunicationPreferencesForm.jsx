
import React from 'react';
import { Mail, MessageSquare, Phone, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

const CommunicationPreferencesForm = ({ preferences = {}, onChange }) => {
  const defaultPreferences = {
    email: {
      enabled: true,
      offers: true,
      newsletters: true,
      reminders: true,
      birthday: true,
      anniversary: true,
      policyUpdates: true
    },
    whatsapp: {
      enabled: false,
      offers: false,
      reminders: true,
      policyUpdates: true
    },
    sms: {
      enabled: false,
      reminders: true,
      policyUpdates: false
    }
  };

  const currentPreferences = { ...defaultPreferences, ...preferences };

  const updatePreference = (channel, type, value) => {
    const updated = {
      ...currentPreferences,
      [channel]: {
        ...currentPreferences[channel],
        [type]: value
      }
    };
    onChange(updated);
  };

  const toggleChannel = (channel, enabled) => {
    const updated = {
      ...currentPreferences,
      [channel]: {
        ...currentPreferences[channel],
        enabled
      }
    };
    onChange(updated);
  };

  const communicationChannels = [
    {
      id: 'email',
      title: 'Email Communications',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      options: [
        { id: 'offers', label: 'Special Offers & Promotions' },
        { id: 'newsletters', label: 'Monthly Newsletters' },
        { id: 'reminders', label: 'Payment & Renewal Reminders' },
        { id: 'birthday', label: 'Birthday Wishes' },
        { id: 'anniversary', label: 'Anniversary Greetings' },
        { id: 'policyUpdates', label: 'Policy Updates & Changes' }
      ]
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Messages',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      options: [
        { id: 'offers', label: 'Special Offers' },
        { id: 'reminders', label: 'Payment Reminders' },
        { id: 'policyUpdates', label: 'Policy Updates' }
      ]
    },
    {
      id: 'sms',
      title: 'SMS Notifications',
      icon: Phone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      options: [
        { id: 'reminders', label: 'Payment Reminders' },
        { id: 'policyUpdates', label: 'Critical Policy Updates' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        Configure how you'd like to receive communications from us. You can always change these preferences later.
      </div>
      
      {communicationChannels.map((channel) => (
        <Card key={channel.id} className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${channel.bgColor}`}>
                  <channel.icon className={`h-5 w-5 ${channel.color}`} />
                </div>
                <CardTitle className="text-base font-medium">{channel.title}</CardTitle>
              </div>
              <Switch
                checked={currentPreferences[channel.id]?.enabled || false}
                onCheckedChange={(checked) => toggleChannel(channel.id, checked)}
              />
            </div>
          </CardHeader>
          
          {currentPreferences[channel.id]?.enabled && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-3">
                {channel.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`${channel.id}-${option.id}`}
                      checked={currentPreferences[channel.id]?.[option.id] || false}
                      onCheckedChange={(checked) => 
                        updatePreference(channel.id, option.id, checked)
                      }
                    />
                    <label 
                      htmlFor={`${channel.id}-${option.id}`} 
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-blue-800 mb-1">Privacy Notice</div>
            <div className="text-blue-700">
              Your communication preferences are securely stored and will only be used to send you relevant information. 
              You can update these settings anytime from your profile.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationPreferencesForm;
