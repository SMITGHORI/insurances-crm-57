
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

const SettingsSecurity = ({ securitySettings, setSecuritySettings, handleSecurityUpdate, loading }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: 'bg-gray-200'
  });
  
  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, message: '', color: 'bg-gray-200' };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
    
    // Determine message and color
    let message, color;
    if (score <= 2) {
      message = 'Weak';
      color = 'bg-red-500';
    } else if (score <= 4) {
      message = 'Moderate';
      color = 'bg-yellow-500';
    } else {
      message = 'Strong';
      color = 'bg-green-500';
    }
    
    return { score, message, color };
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate password fields
    if (passwordForm.newPassword || passwordForm.confirmPassword || passwordForm.currentPassword) {
      if (!passwordForm.currentPassword) {
        toast.error("Please enter your current password");
        return;
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error("New password and confirmation do not match");
        return;
      }
      
      if (passwordForm.newPassword && passwordStrength.score < 3) {
        toast.error("Please use a stronger password");
        return;
      }
    }
    
    // Validate session timeout
    const timeout = parseInt(securitySettings.sessionTimeout);
    if (isNaN(timeout) || timeout < 5 || timeout > 120) {
      toast.error("Session timeout must be between 5 and 120 minutes");
      return;
    }
    
    // All validations passed, proceed with update
    handleSecurityUpdate(e);
  };
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your account security preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
              <Label htmlFor="currentPassword">Change Password</Label>
              <Input 
                id="currentPassword" 
                name="currentPassword"
                type="password" 
                placeholder="Current password" 
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="w-full"
              />
              
              <div className="mt-2">
                <Input 
                  id="newPassword" 
                  name="newPassword"
                  type="password" 
                  placeholder="New password" 
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full"
                />
                
                {passwordForm.newPassword && (
                  <div className="mt-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-sm text-gray-500">Password strength:</div>
                      <div className="text-sm font-medium">{passwordStrength.message}</div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className={`h-full rounded-full ${passwordStrength.color}`} 
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use 8+ characters with a mix of letters, numbers & symbols
                    </p>
                  </div>
                )}
              </div>
              
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                placeholder="Confirm new password" 
                className="mt-2 w-full"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
              />
              {passwordForm.newPassword && passwordForm.confirmPassword && 
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input 
                id="sessionTimeout" 
                type="number" 
                min="5"
                max="120"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Set between 5-120 minutes. After this period of inactivity, you will be logged out.
              </p>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : "Save Security Settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsSecurity;
