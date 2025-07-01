
import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Shield, 
  Bell,
  Palette,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { toast } from 'sonner';

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isSuperAdmin, isAgent, hasPermission } = usePermissions();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleProfileEdit = () => {
    navigate('/settings');
  };

  const handleSecuritySettings = () => {
    if (hasPermission('manageSettings')) {
      navigate('/settings');
    } else {
      toast.error('You do not have permission to access security settings');
    }
  };

  const handleNotificationSettings = () => {
    navigate('/settings');
  };

  const handleHelp = () => {
    console.log('Opening help center');
    toast.info('Help center coming soon!');
  };

  const getRoleBadge = () => {
    if (isSuperAdmin()) {
      return (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full w-fit">
          Super Admin
        </span>
      );
    } else if (isAgent()) {
      return (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full w-fit">
          Agent
        </span>
      );
    }
    return null;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-2 h-auto p-1 text-sm font-medium text-gray-700 hover:text-amba-blue"
        >
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
            <AvatarImage 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              alt={user?.name || 'User'} 
            />
            <AvatarFallback>
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex items-center space-x-1">
            <span className="max-w-[120px] truncate">
              {user?.name || 'Rahul Sharma'}
            </span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.name || 'Rahul Sharma'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'rahul@ambainsurance.com'}</p>
            {getRoleBadge()}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleProfileEdit} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        {hasPermission('manageSettings') && (
          <DropdownMenuItem onClick={handleSecuritySettings} className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            <span>Security</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleNotificationSettings} className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        
        {!isAgent() && (
          <DropdownMenuItem className="cursor-pointer">
            <Palette className="mr-2 h-4 w-4" />
            <span>Appearance</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleHelp} className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
