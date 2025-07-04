
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Database } from 'lucide-react';

const ActivitiesDesktopView = ({ activities, loading, getActivityIcon, formatDate }) => {
  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Loading Activities from MongoDB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse space-y-4 w-full">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
            <p className="text-gray-500">
              Activities will appear here when actions are performed in the system
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getOperationColor = (operation) => {
    switch (operation) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Recent Activities ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity._id || activity.activityId || activity.id}>
                  <TableCell>
                    {getActivityIcon(activity.type)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {activity.description || activity.action}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {activity.details}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.entityName || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.entityType}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`text-xs ${getOperationColor(activity.operation)}`}
                      variant="secondary"
                    >
                      {activity.operation}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.userName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.userRole}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {formatDate(activity.createdAt)}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Real-time data indicator */}
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            Real-time data from MongoDB • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivitiesDesktopView;
