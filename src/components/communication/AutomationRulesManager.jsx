
import React from 'react';
import { Zap, Plus, Play, Pause, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAutomationRules } from '@/hooks/useCommunication';

const AutomationRulesManager = () => {
  const { data: rules, isLoading } = useAutomationRules();

  // Sample data for demonstration
  const sampleRules = [
    {
      _id: '1',
      name: 'Birthday Greetings',
      type: 'birthday',
      trigger: { event: 'date_based', daysOffset: 0, timeOfDay: '09:00' },
      action: { channel: 'email' },
      isActive: true,
      stats: { totalRuns: 45, successfulSends: 43, failedSends: 2 },
      lastRun: new Date('2024-06-07'),
      nextRun: new Date('2024-06-09')
    },
    {
      _id: '2',
      name: 'Anniversary Wishes',
      type: 'anniversary',
      trigger: { event: 'date_based', daysOffset: 0, timeOfDay: '10:00' },
      action: { channel: 'both' },
      isActive: true,
      stats: { totalRuns: 12, successfulSends: 12, failedSends: 0 },
      lastRun: new Date('2024-06-05'),
      nextRun: new Date('2024-06-15')
    },
    {
      _id: '3',
      name: 'Policy Renewal Reminder',
      type: 'renewal_reminder',
      trigger: { event: 'date_based', daysOffset: -30, timeOfDay: '14:00' },
      action: { channel: 'email' },
      isActive: false,
      stats: { totalRuns: 8, successfulSends: 6, failedSends: 2 },
      lastRun: new Date('2024-05-28'),
      nextRun: new Date('2024-07-01')
    }
  ];

  const getRuleTypeColor = (type) => {
    const colors = {
      birthday: 'bg-red-100 text-red-800',
      anniversary: 'bg-purple-100 text-purple-800',
      offer_notification: 'bg-orange-100 text-orange-800',
      points_update: 'bg-blue-100 text-blue-800',
      renewal_reminder: 'bg-yellow-100 text-yellow-800',
      welcome: 'bg-green-100 text-green-800',
      policy_expiry: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getChannelDisplay = (channel) => {
    const channels = {
      email: 'Email',
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      both: 'Email + WhatsApp'
    };
    return channels[channel] || channel;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTrigger = (trigger) => {
    if (trigger.event === 'date_based') {
      const offset = trigger.daysOffset;
      const offsetText = offset === 0 ? 'On the day' : 
                       offset > 0 ? `${offset} days after` : 
                       `${Math.abs(offset)} days before`;
      return `${offsetText} at ${trigger.timeOfDay}`;
    }
    return trigger.event.replace('_', ' ');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  const displayRules = rules?.data || sampleRules;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Automation Rules</h3>
          <p className="text-sm text-gray-500">Set up automated communication triggers</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {displayRules.map((rule) => (
          <Card key={rule._id} className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Rule Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <h4 className="font-semibold text-lg">{rule.name}</h4>
                    <Badge className={getRuleTypeColor(rule.type)}>
                      {rule.type.replace('_', ' ')}
                    </Badge>
                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Trigger</p>
                      <p className="font-medium">{formatTrigger(rule.trigger)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Channel</p>
                      <p className="font-medium">{getChannelDisplay(rule.action.channel)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Success Rate</p>
                      <p className="font-medium">
                        {rule.stats.totalRuns > 0 
                          ? `${Math.round((rule.stats.successfulSends / rule.stats.totalRuns) * 100)}%`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-gray-500 mb-1">Last Run</p>
                      <p className="font-medium">{formatDate(rule.lastRun)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Next Run</p>
                      <p className="font-medium">{formatDate(rule.nextRun)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Total Executions</p>
                      <p className="font-medium">{rule.stats.totalRuns}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:items-end">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={rule.isActive}
                      onCheckedChange={() => {
                        // Handle toggle
                        console.log('Toggle rule:', rule._id);
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {displayRules.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No automation rules found</h3>
          <p className="text-gray-500 mb-4">Create your first automation rule to start sending automated communications.</p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Rule
          </Button>
        </div>
      )}
    </div>
  );
};

export default AutomationRulesManager;
