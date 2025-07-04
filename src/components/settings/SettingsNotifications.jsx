
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Smartphone, TrendingUp, Shield, FileText, Calendar } from 'lucide-react';

const SettingsNotifications = ({ notificationSettings, setNotificationSettings, handleNotificationUpdate }) => {
  
  const handleToggle = (key, value) => {
    const updatedSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(updatedSettings);
    handleNotificationUpdate();
  };

  const notificationCategories = [
    {
      title: "Communication Channels",
      description: "Choose how you want to receive notifications",
      icon: <MessageSquare className="h-5 w-5" />,
      items: [
        {
          key: "emailNotifications",
          title: "Email Notifications",
          description: "Receive notifications via email",
          icon: <Mail className="h-4 w-4 text-blue-500" />
        },
        {
          key: "smsNotifications", 
          title: "SMS Notifications",
          description: "Receive notifications via SMS",
          icon: <Smartphone className="h-4 w-4 text-green-500" />
        },
        {
          key: "pushNotifications",
          title: "Push Notifications", 
          description: "Receive push notifications on your devices",
          icon: <Bell className="h-4 w-4 text-purple-500" />
        }
      ]
    },
    {
      title: "Content & Marketing",
      description: "Control promotional and marketing communications",
      icon: <TrendingUp className="h-5 w-5" />,
      items: [
        {
          key: "marketingEmails",
          title: "Marketing Emails",
          description: "Receive marketing and promotional emails",
          icon: <Mail className="h-4 w-4 text-orange-500" />
        }
      ]
    },
    {
      title: "System & Activity",
      description: "Stay informed about system events and activities",
      icon: <Shield className="h-5 w-5" />,
      items: [
        {
          key: "activityNotifications",
          title: "Activity Notifications",
          description: "Get notified about important activities in your account",
          icon: <Bell className="h-4 w-4 text-indigo-500" />
        },
        {
          key: "systemAlerts",
          title: "System Alerts",
          description: "Receive alerts about system maintenance and updates",
          icon: <Shield className="h-4 w-4 text-red-500" />
        }
      ]
    },
    {
      title: "Reports & Analytics",
      description: "Manage report delivery preferences",
      icon: <FileText className="h-5 w-5" />,
      items: [
        {
          key: "weeklyReports",
          title: "Weekly Reports",
          description: "Receive weekly performance and activity reports",
          icon: <Calendar className="h-4 w-4 text-blue-600" />
        },
        {
          key: "monthlyReports",
          title: "Monthly Reports", 
          description: "Receive monthly summary and analytics reports",
          icon: <Calendar className="h-4 w-4 text-green-600" />
        }
      ]
    }
  ];

  // Calculate enabled notifications count
  const enabledCount = Object.values(notificationSettings).filter(Boolean).length;
  const totalCount = Object.keys(notificationSettings).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Control how you receive notifications and alerts
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {enabledCount}/{totalCount} enabled
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {notificationCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <div className="flex items-center gap-2">
                {category.icon}
                <div>
                  <h3 className="font-medium text-sm">{category.title}</h3>
                  <p className="text-xs text-gray-500">{category.description}</p>
                </div>
              </div>
              
              <div className="ml-7 space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <div>
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={notificationSettings[item.key] || false}
                        onCheckedChange={(checked) => handleToggle(item.key, checked)}
                      />
                    </div>
                    {itemIndex < category.items.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
              
              {categoryIndex < notificationCategories.length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}
          
          {/* Quick Actions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-3">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const allEnabled = Object.keys(notificationSettings).reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                  }, {});
                  setNotificationSettings(allEnabled);
                  handleNotificationUpdate();
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Enable All
              </button>
              <button
                onClick={() => {
                  const allDisabled = Object.keys(notificationSettings).reduce((acc, key) => {
                    acc[key] = false;
                    return acc;
                  }, {});
                  setNotificationSettings(allDisabled);
                  handleNotificationUpdate();
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Disable All
              </button>
              <button
                onClick={() => {
                  const essentialOnly = {
                    emailNotifications: true,
                    pushNotifications: true,
                    systemAlerts: true,
                    activityNotifications: true,
                    smsNotifications: false,
                    marketingEmails: false,
                    weeklyReports: false,
                    monthlyReports: false
                  };
                  setNotificationSettings(essentialOnly);
                  handleNotificationUpdate();
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsNotifications;
