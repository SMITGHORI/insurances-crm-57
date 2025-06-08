
import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { useFollowUps } from '../../hooks/useFollowUps';

const FollowUpCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  const { data: followUpsData, isLoading } = useFollowUps({
    startDate,
    endDate,
    status: 'scheduled'
  });

  const followUps = followUpsData?.data || [];

  const getFollowUpsForDate = (date) => {
    return followUps.filter(followUp => 
      isSameDay(new Date(followUp.scheduledDate), date)
    );
  };

  const selectedDateFollowUps = getFollowUpsForDate(selectedDate);

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const modifiers = {
    hasFollowUp: (date) => getFollowUpsForDate(date).length > 0
  };

  const modifiersClassNames = {
    hasFollowUp: 'bg-blue-100 text-blue-900 font-semibold'
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Follow-up Calendar</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border"
            />
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span>Has follow-ups</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Details */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
            <CardDescription>
              {selectedDateFollowUps.length === 0 
                ? 'No follow-ups scheduled'
                : `${selectedDateFollowUps.length} follow-up${selectedDateFollowUps.length > 1 ? 's' : ''} scheduled`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDateFollowUps.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No follow-ups scheduled for this date
                </p>
              ) : (
                selectedDateFollowUps
                  .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
                  .map((followUp) => (
                    <div
                      key={followUp._id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {followUp.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {followUp.scheduledTime}
                            </span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-600">
                              {followUp.duration} minutes
                            </span>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(followUp.priority)}>
                          {followUp.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {followUp.clientId?.displayName || 'Unknown Client'}
                        </span>
                      </div>

                      {followUp.description && (
                        <p className="text-sm text-gray-600">
                          {followUp.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {followUp.type.replace('_', ' ')}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FollowUpCalendar;
