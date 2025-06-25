
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Calendar, Bell, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const QuotationSettings = ({ quotationId }) => {
  const [settings, setSettings] = useState({
    validUntil: '2025-07-01',
    autoReminders: true,
    reminderDays: 7,
    allowClientComments: true,
    requireSignature: false,
    trackViews: true,
    visibility: 'private'
  });

  const handleSaveSettings = () => {
    toast.success('Settings updated successfully');
  };

  const handleDeleteQuotation = () => {
    if (window.confirm('Are you sure you want to delete this quotation? This action cannot be undone.')) {
      toast.success('Quotation deleted successfully');
      // Navigate back to quotations list
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Quotation Settings</h3>
        <p className="text-sm text-gray-600">Configure quotation preferences and behaviors</p>
      </div>

      {/* Validity Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Validity Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid Until
            </label>
            <Input
              type="date"
              value={settings.validUntil}
              onChange={(e) => setSettings({ ...settings, validUntil: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Quotation will expire after this date
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Reminder Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Reminders</p>
              <p className="text-sm text-gray-600">Send automatic follow-up reminders</p>
            </div>
            <Switch
              checked={settings.autoReminders}
              onCheckedChange={(checked) => setSettings({ ...settings, autoReminders: checked })}
            />
          </div>

          {settings.autoReminders && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remind Before (Days)
              </label>
              <Select 
                value={settings.reminderDays.toString()} 
                onValueChange={(value) => setSettings({ ...settings, reminderDays: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Client Comments</p>
              <p className="text-sm text-gray-600">Let clients add comments to the quotation</p>
            </div>
            <Switch
              checked={settings.allowClientComments}
              onCheckedChange={(checked) => setSettings({ ...settings, allowClientComments: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Digital Signature</p>
              <p className="text-sm text-gray-600">Require client signature for acceptance</p>
            </div>
            <Switch
              checked={settings.requireSignature}
              onCheckedChange={(checked) => setSettings({ ...settings, requireSignature: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Track Views</p>
              <p className="text-sm text-gray-600">Track when client views the quotation</p>
            </div>
            <Switch
              checked={settings.trackViews}
              onCheckedChange={(checked) => setSettings({ ...settings, trackViews: checked })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <Select 
              value={settings.visibility} 
              onValueChange={(value) => setSettings({ ...settings, visibility: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="internal">Internal Only</SelectItem>
                <SelectItem value="client">Client Accessible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="destructive" onClick={handleDeleteQuotation}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Quotation
        </Button>
        
        <Button onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default QuotationSettings;
