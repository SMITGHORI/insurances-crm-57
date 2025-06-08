
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, AlertCircle, CheckCircle, Plus, Filter } from 'lucide-react';
import { useTodaysFollowUps, useOverdueFollowUps, useFollowUpStats } from '../../hooks/useFollowUps';
import FollowUpList from './FollowUpList';
import CreateFollowUpDialog from './CreateFollowUpDialog';
import FollowUpCalendar from './FollowUpCalendar';
import InteractionHistory from '../interactions/InteractionHistory';

const FollowUpManager = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: todaysFollowUps, isLoading: loadingToday } = useTodaysFollowUps();
  const { data: overdueFollowUps, isLoading: loadingOverdue } = useOverdueFollowUps();
  const { data: stats, isLoading: loadingStats } = useFollowUpStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Follow-up Management</h1>
              <p className="text-gray-600">Track client interactions and manage scheduled follow-ups</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Follow-up
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Follow-ups</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingToday ? '...' : todaysFollowUps?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loadingOverdue ? '...' : overdueFollowUps?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Need immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loadingStats ? '...' : `${stats?.completionRate || 0}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Follow-ups</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : stats?.totalFollowUps || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today
              {todaysFollowUps && todaysFollowUps.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {todaysFollowUps.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overdue" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Overdue
              {overdueFollowUps && overdueFollowUps.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {overdueFollowUps.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar">
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="all">
              All Follow-ups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Follow-ups</CardTitle>
                <CardDescription>
                  Follow-ups scheduled for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FollowUpList 
                  followUps={todaysFollowUps} 
                  isLoading={loadingToday}
                  emptyMessage="No follow-ups scheduled for today"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overdue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Overdue Follow-ups</CardTitle>
                <CardDescription>
                  Follow-ups that need immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FollowUpList 
                  followUps={overdueFollowUps} 
                  isLoading={loadingOverdue}
                  emptyMessage="No overdue follow-ups"
                  showOverdue={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Follow-up Calendar</CardTitle>
                <CardDescription>
                  View follow-ups in calendar format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FollowUpCalendar />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Follow-ups</CardTitle>
                  <CardDescription>
                    Complete list of scheduled follow-ups
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </CardHeader>
              <CardContent>
                <FollowUpList showPagination={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreateFollowUpDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </div>
  );
};

export default FollowUpManager;
