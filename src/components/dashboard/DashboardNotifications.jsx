
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle,
  X,
  Eye
} from 'lucide-react';

const DashboardNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'urgent',
      title: 'Policy Expiring Soon',
      message: 'Health policy for John Doe expires in 3 days',
      time: '2 hours ago',
      read: false,
      actionable: true
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Follow-up Required',
      message: 'Lead from Jane Smith needs follow-up call',
      time: '4 hours ago',
      read: false,
      actionable: true
    },
    {
      id: '3',
      type: 'info',
      title: 'New Claim Submitted',
      message: 'Auto insurance claim #CLM-2024-001 submitted',
      time: '6 hours ago',
      read: true,
      actionable: false
    },
    {
      id: '4',
      type: 'success',
      title: 'Payment Received',
      message: 'Premium payment of ₹25,000 received from Robert Johnson',
      time: '1 day ago',
      read: true,
      actionable: false
    }
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type, read) => {
    if (read) return 'border-l-gray-300';
    
    switch (type) {
      case 'urgent':
        return 'border-l-red-500';
      case 'reminder':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
      case 'success':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm">
            Mark all read
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border-l-4 ${getNotificationColor(notification.type, notification.read)} 
                         ${notification.read ? 'bg-gray-50' : 'bg-white shadow-sm'} 
                         hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <p className={`text-xs mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {notification.actionable && !notification.read && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Take Action
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-7">
                    View Details
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardNotifications;
