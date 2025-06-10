
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Clock, 
  Mail, 
  MessageSquare, 
  Play, 
  Square, 
  BarChart3,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { paymentReminderService } from '@/services/paymentReminderService';

const PaymentReminderManager = () => {
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [reminderStats, setReminderStats] = useState({
    totalReminders: 0,
    remindersByType: {},
    totalInvoicesWithReminders: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReminderStats();
  }, []);

  const loadReminderStats = () => {
    const stats = paymentReminderService.getReminderStats();
    setReminderStats(stats);
  };

  const handleToggleReminders = () => {
    if (isReminderActive) {
      paymentReminderService.stopReminderSystem();
      setIsReminderActive(false);
      toast.success('Payment reminder system deactivated');
    } else {
      paymentReminderService.initializeReminderSystem();
      setIsReminderActive(true);
      toast.success('Payment reminder system activated');
    }
  };

  const handleManualCheck = async () => {
    setIsLoading(true);
    try {
      await paymentReminderService.triggerManualReminderCheck();
      loadReminderStats();
    } catch (error) {
      toast.error('Failed to run manual check');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all reminder history?')) {
      paymentReminderService.clearReminderHistory();
      loadReminderStats();
    }
  };

  const getReminderTypeLabel = (type) => {
    const labels = {
      'first_reminder': 'First Reminder',
      'second_reminder': 'Second Reminder', 
      'final_reminder': 'Final Reminder',
      'escalation': 'Escalation'
    };
    return labels[type] || type;
  };

  const getReminderTypeBadgeColor = (type) => {
    const colors = {
      'first_reminder': 'bg-blue-100 text-blue-800',
      'second_reminder': 'bg-yellow-100 text-yellow-800',
      'final_reminder': 'bg-orange-100 text-orange-800',
      'escalation': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Payment Reminder System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Automated Reminders</p>
              <p className="text-sm text-gray-600">
                Automatically send payment reminders for overdue invoices
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge 
                variant={isReminderActive ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {isReminderActive ? (
                  <>
                    <Play className="h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <Square className="h-3 w-3" />
                    Inactive
                  </>
                )}
              </Badge>
              <Switch
                checked={isReminderActive}
                onCheckedChange={handleToggleReminders}
              />
            </div>
          </div>

          {/* Manual Controls */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleManualCheck}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Run Manual Check
            </Button>
            <Button
              variant="outline"
              onClick={handleClearHistory}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reminder Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {reminderStats.totalReminders}
              </p>
              <p className="text-sm text-gray-600">Total Reminders Sent</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {reminderStats.totalInvoicesWithReminders}
              </p>
              <p className="text-sm text-gray-600">Invoices with Reminders</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {Object.keys(reminderStats.remindersByType).length}
              </p>
              <p className="text-sm text-gray-600">Reminder Types Used</p>
            </div>
          </div>

          {/* Breakdown by Type */}
          {Object.keys(reminderStats.remindersByType).length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Reminders by Type</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(reminderStats.remindersByType).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <Badge className={getReminderTypeBadgeColor(type)}>
                        {getReminderTypeLabel(type)}
                      </Badge>
                      <p className="text-lg font-semibold mt-1">{count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Schedule Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reminder Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Sent to client email address</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">WhatsApp Messages</p>
                  <p className="text-sm text-gray-600">Sent to client phone number</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Automatic Schedule:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span>First Reminder</span>
                  <Badge variant="outline">1 day after due date</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span>Second Reminder</span>
                  <Badge variant="outline">7 days after due date</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                  <span>Final Reminder</span>
                  <Badge variant="outline">14 days after due date</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span>Escalation</span>
                  <Badge variant="outline">30 days after due date</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReminderManager;
