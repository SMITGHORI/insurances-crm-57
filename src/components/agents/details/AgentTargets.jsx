
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Target, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const AgentTargets = ({ agentId }) => {
  const [targets, setTargets] = useState({
    monthly: {
      newClients: { target: 15, achieved: 12, unit: 'clients' },
      premiumVolume: { target: 50000, achieved: 42000, unit: 'currency' },
      conversion: { target: 75, achieved: 68, unit: 'percentage' }
    },
    quarterly: {
      newClients: { target: 45, achieved: 35, unit: 'clients' },
      premiumVolume: { target: 150000, achieved: 125000, unit: 'currency' },
      retention: { target: 90, achieved: 94, unit: 'percentage' }
    },
    annual: {
      newClients: { target: 180, achieved: 142, unit: 'clients' },
      premiumVolume: { target: 600000, achieved: 485000, unit: 'currency' },
      satisfaction: { target: 4.5, achieved: 4.7, unit: 'rating' }
    }
  });

  const [editMode, setEditMode] = useState(false);
  const [editTargets, setEditTargets] = useState(targets);

  const formatValue = (value, unit) => {
    switch (unit) {
      case 'currency':
        return `₹${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      case 'rating':
        return `${value}/5`;
      default:
        return value.toString();
    }
  };

  const calculateProgress = (achieved, target) => {
    return Math.min((achieved / target) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleSave = () => {
    setTargets(editTargets);
    setEditMode(false);
    toast.success('Targets updated successfully');
  };

  const handleCancel = () => {
    setEditTargets(targets);
    setEditMode(false);
  };

  const handleTargetChange = (period, metric, field, value) => {
    setEditTargets(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        [metric]: {
          ...prev[period][metric],
          [field]: parseFloat(value) || 0
        }
      }
    }));
  };

  const renderTargetCard = (period, periodName) => {
    const periodData = editMode ? editTargets[period] : targets[period];
    
    return (
      <Card key={period}>
        <CardHeader>
          <CardTitle className="text-lg">{periodName} Targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(periodData).map(([metric, data]) => {
            const progress = calculateProgress(data.achieved, data.target);
            const metricName = metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            return (
              <div key={metric} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{metricName}</span>
                  <div className="flex items-center space-x-2">
                    {editMode ? (
                      <>
                        <Input
                          type="number"
                          value={data.achieved}
                          onChange={(e) => handleTargetChange(period, metric, 'achieved', e.target.value)}
                          className="w-20 h-8"
                        />
                        <span>/</span>
                        <Input
                          type="number"
                          value={data.target}
                          onChange={(e) => handleTargetChange(period, metric, 'target', e.target.value)}
                          className="w-20 h-8"
                        />
                      </>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {formatValue(data.achieved, data.unit)} / {formatValue(data.target, data.unit)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress 
                    value={progress}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{progress.toFixed(1)}% achieved</span>
                    <span className={progress >= 100 ? 'text-green-600 font-medium' : progress >= 90 ? 'text-yellow-600' : 'text-red-600'}>
                      {progress >= 100 ? 'Exceeded' : progress >= 90 ? 'Nearly There' : 'Needs Attention'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Performance Targets</h3>
          <p className="text-sm text-gray-600">Track and manage performance targets</p>
        </div>
        <div className="flex space-x-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save size={16} className="mr-2" />
                Save
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditMode(true)}>
              <Edit size={16} className="mr-2" />
              Edit Targets
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {renderTargetCard('monthly', 'Monthly')}
        {renderTargetCard('quarterly', 'Quarterly')}
        {renderTargetCard('annual', 'Annual')}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Target Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-gray-600">Targets Exceeded</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">4</div>
              <div className="text-sm text-gray-600">Nearly Achieved</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">2</div>
              <div className="text-sm text-gray-600">Need Attention</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentTargets;
