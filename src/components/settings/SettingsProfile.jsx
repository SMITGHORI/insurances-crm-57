
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const SettingsProfile = ({ profileForm, setProfileForm, handleProfileUpdate, loading }) => {
  const [errors, setErrors] = useState({});

  // Advanced validation logic
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        // Allow formats like +91 9876543210, 9876543210, 987-654-3210
        const phoneRegex = /^(\+\d{1,3}\s?)?\d{10}$|^(\d{3}[-]\d{3}[-]\d{4})$/;
        if (value && !phoneRegex.test(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'name':
        if (value.length < 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Validate field immediately
    const error = validateField(id, value);
    
    // Update errors state
    setErrors(prev => ({
      ...prev,
      [id]: error
    }));
    
    // Update form data
    setProfileForm({...profileForm, [id]: value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {};
    let hasErrors = false;
    
    Object.entries(profileForm).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      setErrors(newErrors);
      toast.error("Please fix the errors before saving");
      return;
    }
    
    // If no errors, proceed with update
    handleProfileUpdate(e);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={profileForm.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profileForm.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={profileForm.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input 
                id="jobTitle" 
                value={profileForm.jobTitle}
                onChange={handleChange}
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
  );
};

export default SettingsProfile;
