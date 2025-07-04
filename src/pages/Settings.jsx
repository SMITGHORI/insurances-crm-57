
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, UserCog, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import PermissionOverview from '@/components/settings/PermissionOverview';
import PermissionEditor from '@/components/settings/PermissionEditor';
import SettingsProfile from '@/components/settings/SettingsProfile';
import SettingsNotifications from '@/components/settings/SettingsNotifications';
import Protected from '@/components/Protected';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Use the settings hook for real API integration
  const {
    settings,
    loading,
    error,
    updateProfile,
    updateNotifications,
    updateSecurity,
    updatePreferences,
    changePassword,
    resetSettings,
    refreshSettings
  } = useSettings();

  // Local form states initialized from API data
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    activityNotifications: true,
    systemAlerts: true,
    weeklyReports: true,
    monthlyReports: false
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    dashboardLayout: 'comfortable',
    itemsPerPage: 20
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setProfileForm({
        name: settings.profile?.name || '',
        email: settings.profile?.email || '',
        phone: settings.profile?.phone || '',
        jobTitle: settings.profile?.jobTitle || ''
      });
      
      setNotificationSettings({
        ...notificationSettings,
        ...settings.notifications
      });
      
      setSecuritySettings({
        ...securitySettings,
        ...settings.security
      });
      
      setAppearance({
        ...appearance,
        ...settings.preferences
      });
    }
  }, [settings]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile: " + error.message);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      await updateNotifications(notificationSettings);
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update notifications: " + error.message);
    }
  };

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateSecurity(securitySettings);
      toast.success("Security settings updated");
    } catch (error) {
      toast.error("Failed to update security settings: " + error.message);
    }
  };
  
  const handleAppearanceUpdate = async () => {
    try {
      await updatePreferences(appearance);
      toast.success("Appearance settings updated");
    } catch (error) {
      toast.error("Failed to update appearance: " + error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error("Failed to change password: " + error.message);
    }
  };

  const handleResetSettings = async () => {
    try {
      await resetSettings();
      await refreshSettings();
      toast.success("Settings reset to defaults");
    } catch (error) {
      toast.error("Failed to reset settings: " + error.message);
    }
  };

  // Show loading skeleton while fetching settings
  if (loading && !settings) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Show error state
  if (error && !settings) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load settings</p>
            <Button onClick={refreshSettings}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <SettingsIcon className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Settings</h1>
        {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                <Button 
                  variant={activeTab === "profile" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button 
                  variant={activeTab === "notifications" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button 
                  variant={activeTab === "security" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("security")}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </Button>
                <Protected module="settings" action="view_permissions">
                  <Button 
                    variant={activeTab === "permissions" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("permissions")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Permissions
                  </Button>
                </Protected>
                <Button 
                  variant={activeTab === "appearance" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("appearance")}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Appearance
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          {activeTab === "profile" && (
            <SettingsProfile 
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              handleProfileUpdate={handleProfileUpdate}
              loading={loading}
            />
          )}
          
          {activeTab === "notifications" && (
            <SettingsNotifications 
              notificationSettings={notificationSettings}
              setNotificationSettings={setNotificationSettings}
              handleNotificationUpdate={handleNotificationUpdate}
            />
          )}
          
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Switch 
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => {
                        setSecuritySettings({...securitySettings, twoFactorAuth: checked});
                        handleSecurityUpdate({ preventDefault: () => {} });
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  {/* Change Password Section */}
                  <form onSubmit={handlePasswordChange}>
                    <div className="space-y-4">
                      <h3 className="font-medium">Change Password</h3>
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password" 
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Changing..." : "Change Password"}
                      </Button>
                    </div>
                  </form>
                  
                  <Separator />
                  
                  {/* Session Timeout */}
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input 
                      id="sessionTimeout" 
                      type="number" 
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 5 && value <= 180) {
                          setSecuritySettings({...securitySettings, sessionTimeout: value});
                          handleSecurityUpdate({ preventDefault: () => {} });
                        }
                      }}
                      min="5"
                      max="180"
                    />
                  </div>
                  
                  <Separator />
                  
                  {/* Login Alerts */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Login Alerts</h3>
                      <p className="text-sm text-gray-500">Receive alerts for unusual login activity</p>
                    </div>
                    <Switch 
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(checked) => {
                        setSecuritySettings({...securitySettings, loginAlerts: checked});
                        handleSecurityUpdate({ preventDefault: () => {} });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "permissions" && (
            <Protected module="settings" action="view_permissions">
              <div className="space-y-6">
                <PermissionOverview />
                {user?.role === 'super_admin' && <PermissionEditor />}
              </div>
            </Protected>
          )}
          
          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize your experience with the CRM
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Theme Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <select 
                      id="theme"
                      className="w-full p-2 border rounded-md"
                      value={appearance.theme}
                      onChange={(e) => {
                        setAppearance({...appearance, theme: e.target.value});
                        handleAppearanceUpdate();
                      }}
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  
                  <Separator />
                  
                  {/* Language Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select 
                      id="language"
                      className="w-full p-2 border rounded-md"
                      value={appearance.language}
                      onChange={(e) => {
                        setAppearance({...appearance, language: e.target.value});
                        handleAppearanceUpdate();
                      }}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  
                  <Separator />
                  
                  {/* Items Per Page */}
                  <div className="space-y-2">
                    <Label htmlFor="itemsPerPage">Items Per Page</Label>
                    <Input 
                      id="itemsPerPage" 
                      type="number" 
                      value={appearance.itemsPerPage}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 10 && value <= 100) {
                          setAppearance({...appearance, itemsPerPage: value});
                          handleAppearanceUpdate();
                        }
                      }}
                      min="10"
                      max="100"
                    />
                  </div>
                  
                  <Separator />
                  
                  {/* Dashboard Layout */}
                  <div className="space-y-2">
                    <Label htmlFor="dashboardLayout">Dashboard Layout</Label>
                    <select 
                      id="dashboardLayout"
                      className="w-full p-2 border rounded-md"
                      value={appearance.dashboardLayout}
                      onChange={(e) => {
                        setAppearance({...appearance, dashboardLayout: e.target.value});
                        handleAppearanceUpdate();
                      }}
                    >
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleResetSettings}
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset to Defaults"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
