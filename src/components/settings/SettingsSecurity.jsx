
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const SettingsSecurity = ({ securitySettings, setSecuritySettings, handleSecurityUpdate, loading }) => {
  return (
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
  );
};

export default SettingsSecurity;
