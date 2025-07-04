
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Camera, Upload, X } from 'lucide-react';

const SettingsProfile = ({ profileForm, setProfileForm, handleProfileUpdate, loading }) => {
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const isMobile = useIsMobile();

  // Advanced validation logic
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          error = 'Email is required';
        } else if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        // Allow formats like +91 9876543210, 9876543210, 987-654-3210
        const phoneRegex = /^(\+\d{1,3}\s?)?\d{10}$|^(\d{3}[-]\d{3}[-]\d{4})$/;
        if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'name':
        if (!value) {
          error = 'Name is required';
        } else if (value.length < 2) {
          error = 'Name must be at least 2 characters';
        } else if (value.length > 100) {
          error = 'Name must be less than 100 characters';
        }
        break;
      case 'jobTitle':
        if (value && value.length > 100) {
          error = 'Job title must be less than 100 characters';
        }
        break;
      case 'bio':
        if (value && value.length > 500) {
          error = 'Bio must be less than 500 characters';
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setProfileForm({...profileForm, avatar: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setProfileForm({...profileForm, avatar: ''});
  };

  const handleSubmit = async (e) => {
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
    try {
      await handleProfileUpdate(e);
      // Clear any existing errors on successful save
      setErrors({});
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  // Set preview image when profileForm.avatar changes
  useEffect(() => {
    if (profileForm.avatar) {
      setPreviewImage(profileForm.avatar);
    }
  }, [profileForm.avatar]);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="space-y-4">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  {previewImage && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload Photo</span>
                    </div>
                  </label>
                  <p className="text-xs text-gray-500">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  value={profileForm.name || ''}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileForm.email || ''}
                    onChange={handleChange}
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={profileForm.phone || ''}
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
                  value={profileForm.jobTitle || ''}
                  onChange={handleChange}
                  placeholder="e.g., Senior Insurance Agent"
                  className={errors.jobTitle ? "border-red-500" : ""}
                />
                {errors.jobTitle && <p className="text-sm text-red-500">{errors.jobTitle}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  value={profileForm.bio || ''}
                  onChange={handleChange}
                  placeholder="Tell us a bit about yourself..."
                  className={errors.bio ? "border-red-500" : ""}
                  rows={3}
                />
                {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
                <p className="text-xs text-gray-500">
                  {(profileForm.bio || '').length}/500 characters
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setErrors({});
                // Reset form could be implemented here
              }}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsProfile;
