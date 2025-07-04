
import React from 'react';
import ActivityItem from './ActivityItem';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ActivitiesMobileView = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amba-blue mx-auto mb-4" />
          <p className="text-gray-600">Loading activities from MongoDB...</p>
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No activities found</p>
          <p className="text-sm text-gray-400">
            Activities will appear here when actions are performed in the system
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {activities.map((activity) => (
        <ActivityItem 
          key={activity._id || activity.activityId || activity.id} 
          activity={activity} 
        />
      ))}
      
      {/* Real-time indicator */}
      <div className="text-center py-4 text-xs text-gray-400 border-t">
        Real-time data from MongoDB • {activities.length} activities shown
      </div>
    </div>
  );
};

export default ActivitiesMobileView;
