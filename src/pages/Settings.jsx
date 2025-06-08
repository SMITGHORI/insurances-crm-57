import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "Rahul Sharma",
    email: "rahul.sharma@ambainsurance.com",
    phone: "+91 98765 43210",
    jobTitle: "Senior Insurance Agent"
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    marketingEmails: false
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    loginAlerts: true
  });

  const [appearance, setAppearance] = useState({
    compactView: false,
    showPolicyExpiryWarnings: true,
    defaultLandingPage: "dashboard"
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  const handleNotificationUpdate = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Notification preferences updated");
    }, 800);
  };

  const handleSecurityUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Security settings updated");
    }, 1200);
  };
  
  const handleAppearanceUpdate = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Appearance settings updated");
    }, 600);
  };

  // Show professional loading skeleton
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <SettingsIcon className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Settings</h1>
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
                <Button 
                  variant={activeTab === "appearance" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("appearance")}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Appearance
                </Button>
                <Button 
                  variant={activeTab === "billing" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("billing")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input 
                        id="jobTitle" 
                        value={profileForm.jobTitle}
                        onChange={(e) => setProfileForm({...profileForm, jobTitle: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "notifications" && (
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
                <form onSubmit={handleSecurityUpdate}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Switch 
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => {
                          setSecuritySettings({...securitySettings, twoFactorAuth: checked});
                        }}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Change Password</Label>
                      <Input id="password" type="password" placeholder="Current password" />
                      <Input type="password" placeholder="New password" className="mt-2" />
                      <Input type="password" placeholder="Confirm new password" className="mt-2" />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input 
                        id="sessionTimeout" 
                        type="number" 
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Login Alerts</h3>
                        <p className="text-sm text-gray-500">Receive alerts for unusual login activity</p>
                      </div>
                      <Switch 
                        checked={securitySettings.loginAlerts}
                        onCheckedChange={(checked) => {
                          setSecuritySettings({...securitySettings, loginAlerts: checked});
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save Security Settings"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize your experience with Amba Insurance CRM
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Compact View</h3>
                      <p className="text-sm text-gray-500">Enable compact view for denser information display</p>
                    </div>
                    <Switch 
                      checked={appearance.compactView}
                      onCheckedChange={(checked) => {
                        setAppearance({...appearance, compactView: checked});
                        handleAppearanceUpdate();
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Policy Expiry Warnings</h3>
                      <p className="text-sm text-gray-500">Show visual warnings for policies nearing expiration</p>
                    </div>
                    <Switch 
                      checked={appearance.showPolicyExpiryWarnings}
                      onCheckedChange={(checked) => {
                        setAppearance({...appearance, showPolicyExpiryWarnings: checked});
                        handleAppearanceUpdate();
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultPage">Default Landing Page</Label>
                    <select
                      id="defaultPage"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={appearance.defaultLandingPage}
                      onChange={(e) => {
                        setAppearance({...appearance, defaultLandingPage: e.target.value});
                        handleAppearanceUpdate();
                      }}
                    >
                      <option value="dashboard">Dashboard</option>
                      <option value="clients">Clients</option>
                      <option value="policies">Policies</option>
                      <option value="claims">Claims</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "billing" && (
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Manage your subscription and billing details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Current Plan</h3>
                        <p className="text-sm font-bold text-primary">Enterprise Plan</p>
                      </div>
                      <Button variant="outline">Upgrade Plan</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Payment Method</h3>
                    <div className="flex items-center space-x-4 p-4 border rounded-md">
                      <div className="bg-gray-100 p-2 rounded">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-sm text-gray-500">Expires 12/2025</p>
                      </div>
                      <Button variant="ghost" className="ml-auto" size="sm">Change</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Billing Address</h3>
                    <div className="p-4 border rounded-md">
                      <p>Amba Insurance Pvt Ltd</p>
                      <p>123 Business Park, Sector 5</p>
                      <p>Bengaluru, Karnataka 560001</p>
                      <p>India</p>
                    </div>
                    <Button variant="ghost" size="sm">Edit Address</Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Billing History</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">May 1, 2023</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">₹24,000</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <a href="#" className="text-primary hover:text-primary-dark">Download</a>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">Apr 1, 2023</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">₹24,000</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <a href="#" className="text-primary hover:text-primary-dark">Download</a>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">Mar 1, 2023</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">₹24,000</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <a href="#" className="text-primary hover:text-primary-dark">Download</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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

export default Settings;
