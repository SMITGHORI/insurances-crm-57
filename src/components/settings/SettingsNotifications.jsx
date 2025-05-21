
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const SettingsNotifications = ({ notificationSettings, setNotificationSettings, handleNotificationUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Control how you receive notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch 
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(checked) => {
                setNotificationSettings({...notificationSettings, emailNotifications: checked});
                handleNotificationUpdate();
              }}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">SMS Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via SMS</p>
            </div>
            <Switch 
              checked={notificationSettings.smsNotifications}
              onCheckedChange={(checked) => {
                setNotificationSettings({...notificationSettings, smsNotifications: checked});
                handleNotificationUpdate();
              }}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-gray-500">Receive push notifications on your devices</p>
            </div>
            <Switch 
              checked={notificationSettings.pushNotifications}
              onCheckedChange={(checked) => {
                setNotificationSettings({...notificationSettings, pushNotifications: checked});
                handleNotificationUpdate();
              }}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Marketing Emails</h3>
              <p className="text-sm text-gray-500">Receive marketing and promotional emails</p>
            </div>
            <Switch 
              checked={notificationSettings.marketingEmails}
              onCheckedChange={(checked) => {
                setNotificationSettings({...notificationSettings, marketingEmails: checked});
                handleNotificationUpdate();
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsNotifications;
