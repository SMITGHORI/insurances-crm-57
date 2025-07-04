
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  Quote,
  TrendingUp,
  User,
  Activity as ActivityIcon
} from 'lucide-react';

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'client': return <Users className="h-4 w-4 text-blue-500" />;
      case 'policy': return <FileText className="h-4 w-4 text-green-500" />;
      case 'claim': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'quotation': return <Quote className="h-4 w-4 text-purple-500" />;
      case 'lead': return <TrendingUp className="h-4 w-4 text-indigo-500" />;
      case 'user': return <User className="h-4 w-4 text-gray-500" />;
      default: return <ActivityIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOperationColor = (operation) => {
    switch (operation) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.description || activity.action}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  className={`text-xs ${getOperationColor(activity.operation)}`}
                  variant="secondary"
                >
                  {activity.operation}
                </Badge>
                <span className="text-xs text-gray-500">
                  by {activity.userName}
                </span>
              </div>
              {activity.entityName && (
                <p className="text-xs text-gray-500 mt-1">
                  {activity.entityType}: {activity.entityName}
                </p>
              )}
              {activity.details && (
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {activity.details}
                </p>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 ml-2">
            {formatTimeAgo(activity.createdAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityItem;
