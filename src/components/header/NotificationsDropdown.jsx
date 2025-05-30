
import React, { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, CheckCircle, Clock, Settings } from 'lucide-react';

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'alert',
      title: 'Policy Expiring Soon',
      message: '5 policies expiring this week',
      time: '5 min ago',
      unread: true
    },
    {
      id: 2,
      type: 'success',
      title: 'Claim Approved',
      message: 'Claim #CLM-2024-001 has been approved',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'info',
      title: 'New Lead Assigned',
      message: 'You have been assigned a new lead',
      time: '2 hours ago',
      unread: false
    },
    {
      id: 4,
      type: 'alert',
      title: 'Payment Overdue',
      message: '3 payments are overdue',
      time: '1 day ago',
      unread: false
    }
  ]);

  const unreadCount = notifications.filter(notif => notif.unread).length;

  const getIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, unread: false } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, unread: false })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 rounded-full text-gray-600 hover:text-amba-blue hover:bg-gray-100 relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{unreadCount} new</Badge>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-6"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem 
              key={notification.id}
              className="flex flex-col items-start p-4 cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500"
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  {getIcon(notification.type)}
                  <span className="font-medium text-sm">{notification.title}</span>
                  {notification.unread && (
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center py-3 cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />
          Notification Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
