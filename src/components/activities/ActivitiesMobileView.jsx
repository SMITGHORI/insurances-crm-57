
import React from 'react';
import ActivityItem from './ActivityItem';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ActivitiesMobileView = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amba-blue" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 text-center text-gray-500">
          No activities found matching your criteria
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-0 bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
};

export default ActivitiesMobileView;
