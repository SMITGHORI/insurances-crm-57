import React from 'react';
import {
  Home,
  Users,
  Settings,
  UserPlus,
  FileText,
  Gift,
  ShieldCheck,
  Mail,
  MessageSquare,
  Bell,
  BarChart,
  Calendar,
  Building,
  TrendingUp,
  HelpCircle,
  LogOut
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Overview of your insurance business'
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Users,
      description: 'Manage your clients and their information'
    },
    {
      name: 'Policies',
      href: '/policies',
      icon: FileText,
      description: 'View and manage insurance policies'
    },
    {
      name: 'Claims',
      href: '/claims',
      icon: ShieldCheck,
      description: 'Process and track insurance claims'
    },
    {
      name: 'Communications',
      href: '/communications',
      icon: Mail,
      description: 'Send emails and SMS to clients'
    },
    {
      name: 'Automation',
      href: '/automation',
      icon: Bell,
      description: 'Automate tasks and reminders'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart,
      description: 'Generate reports on your business performance'
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      description: 'Schedule appointments and reminders'
    },
    {
      name: 'Branch Management',
      href: '/branches',
      icon: Building,
      description: 'Manage branches and locations'
    },
    {
      name: 'Analytics Dashboard',
      href: '/analytics',
      icon: TrendingUp,
      description: 'Track key performance indicators'
    },
    {
      name: 'Offers & Broadcasts',
      href: '/offers',
      icon: Gift,
      description: 'Send offers and festival greetings'
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-secondary">
          <Home className="h-[1.2rem] w-[1.2rem] rotate-0 sm:rotate-0" />
          <span className="sr-only">Navigation Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader className="text-left">
          <SheetTitle>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Your profile" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                {user ? (
                  <>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-muted-foreground text-sm">{user.email}</div>
                  </>
                ) : (
                  <div>Not logged in</div>
                )}
              </div>
            </div>
          </SheetTitle>
          <SheetDescription>
            Manage your account preferences.
          </SheetDescription>
        </SheetHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start font-normal">
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Invite Team Members</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>More Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="grid gap-4 py-4">
          <div className="mb-8">
            <div className="text-lg font-medium tracking-tight">
              Navigation
            </div>
            <p className="text-sm text-muted-foreground">
              Navigate your insurance business with ease.
            </p>
          </div>
          {navigationItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start font-normal"
              onClick={() => navigate(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
            </Button>
          ))}
          <Button variant="ghost" className="w-full justify-start font-normal">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Navigation;
