
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Mail, MessageCircle, Smartphone } from 'lucide-react';

const ClientAnniversaryForm = ({ formData, setFormData, clientType }) => {
  const handleDateChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      importantDates: {
        ...prev.importantDates,
        [field]: value
      }
    }));
  };

  const handleCommunicationPreferenceChange = (channel, type, value) => {
    setFormData(prev => ({
      ...prev,
      communicationPreferences: {
        ...prev.communicationPreferences,
        [channel]: {
          ...prev.communicationPreferences?.[channel],
          [type]: value
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clientType === 'Individual' && (
            <div>
              <Label htmlFor="marriageAnniversary">Marriage Anniversary</Label>
              <Input
                id="marriageAnniversary"
                type="date"
                value={formData.importantDates?.marriageAnniversary || ''}
                onChange={(e) => handleDateChange('marriageAnniversary', e.target.value)}
                className="mt-1"
              />
            </div>
          )}
          
          {clientType === 'Corporate' && (
            <div>
              <Label htmlFor="incorporationDate">Incorporation Date</Label>
              <Input
                id="incorporationDate"
                type="date"
                value={formData.importantDates?.incorporationDate || ''}
                onChange={(e) => handleDateChange('incorporationDate', e.target.value)}
                className="mt-1"
              />
            </div>
          )}
          
          {clientType === 'Group' && (
            <div>
              <Label htmlFor="groupAnniversary">Group Formation Date</Label>
              <Input
                id="groupAnniversary"
                type="date"
                value={formData.importantDates?.groupAnniversary || ''}
                onChange={(e) => handleDateChange('groupAnniversary', e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Preferences */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email Communications
              </Label>
              <Switch
                checked={formData.communicationPreferences?.email?.enabled || false}
                onCheckedChange={(checked) => handleCommunicationPreferenceChange('email', 'enabled', checked)}
              />
            </div>
            
            {formData.communicationPreferences?.email?.enabled && (
              <div className="ml-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Birthday greetings</span>
                  <Switch
                    checked={formData.communicationPreferences?.email?.birthday || false}
                    onCheckedChange={(checked) => handleCommunicationPreferenceChange('email', 'birthday', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anniversary wishes</span>
                  <Switch
                    checked={formData.communicationPreferences?.email?.anniversary || false}
                    onCheckedChange={(checked) => handleCommunicationPreferenceChange('email', 'anniversary', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Special offers</span>
                  <Switch
                    checked={formData.communicationPreferences?.email?.offers || false}
                    onCheckedChange={(checked) => handleCommunicationPreferenceChange('email', 'offers', checked)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Preferences */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp Communications
              </Label>
              <Switch
                checked={formData.communicationPreferences?.whatsapp?.enabled || false}
                onCheckedChange={(checked) => handleCommunicationPreferenceChange('whatsapp', 'enabled', checked)}
              />
            </div>
            
            {formData.communicationPreferences?.whatsapp?.enabled && (
              <div className="ml-6 space-y-2">
                <div>
                  <Label htmlFor="whatsappNumber" className="text-sm">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    placeholder="+91 9999999999"
                    value={formData.communicationPreferences?.whatsapp?.number || ''}
                    onChange={(e) => handleCommunicationPreferenceChange('whatsapp', 'number', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Birthday greetings</span>
                  <Switch
                    checked={formData.communicationPreferences?.whatsapp?.birthday || false}
                    onCheckedChange={(checked) => handleCommunicationPreferenceChange('whatsapp', 'birthday', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anniversary wishes</span>
                  <Switch
                    checked={formData.communicationPreferences?.whatsapp?.anniversary || false}
                    onCheckedChange={(checked) => handleCommunicationPreferenceChange('whatsapp', 'anniversary', checked)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SMS Preferences */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                <Smartphone className="h-4 w-4 mr-2" />
                SMS Communications
              </Label>
              <Switch
                checked={formData.communicationPreferences?.sms?.enabled || false}
                onCheckedChange={(checked) => handleCommunicationPreferenceChange('sms', 'enabled', checked)}
              />
            </div>
            
            {formData.communicationPreferences?.sms?.enabled && (
              <div className="ml-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Birthday greetings</span>
                  <Switch
                    checked={formData.communicationPreferences?.sms?.birthday || false}
                    onCheckedChange={(checked) => handleCommunicationPreferenceChange('sms', 'birthday', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anniversary wishes</span>
                  <Switch
                    checked={formData.communicationPreferences?.sms?.anniversary || false}
                    onCheckedChange={(checked) => handleCommunicationPreferenceChange('sms', 'anniversary', checked)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAnniversaryForm;
