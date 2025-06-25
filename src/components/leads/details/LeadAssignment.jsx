
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserCheck, User, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

const LeadAssignment = ({ leadId }) => {
  const [currentAssignment, setCurrentAssignment] = useState({
    agentId: 'agent-1',
    agentName: 'John Smith',
    assignedAt: '2024-01-15T10:30:00Z',
    assignedBy: 'Manager Admin'
  });

  const [newAssignment, setNewAssignment] = useState({
    agentId: '',
    reason: ''
  });

  const [assignmentHistory] = useState([
    {
      id: '1',
      agentName: 'John Smith',
      assignedAt: '2024-01-15T10:30:00Z',
      assignedBy: 'Manager Admin',
      reason: 'Initial assignment based on product expertise'
    },
    {
      id: '2',
      agentName: 'Sarah Johnson',
      assignedAt: '2024-01-10T09:15:00Z',
      assignedBy: 'System Auto-assign',
      reason: 'Auto-assigned based on availability'
    }
  ]);

  const availableAgents = [
    { id: 'agent-1', name: 'John Smith', workload: 15, specialty: 'Health Insurance' },
    { id: 'agent-2', name: 'Sarah Johnson', workload: 12, specialty: 'Life Insurance' },
    { id: 'agent-3', name: 'Mike Wilson', workload: 18, specialty: 'Motor Insurance' },
    { id: 'agent-4', name: 'Emily Davis', workload: 8, specialty: 'Health Insurance' }
  ];

  const handleReassignLead = () => {
    if (!newAssignment.agentId) {
      toast.error('Please select an agent');
      return;
    }

    const selectedAgent = availableAgents.find(agent => agent.id === newAssignment.agentId);
    if (selectedAgent) {
      setCurrentAssignment({
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        assignedAt: new Date().toISOString(),
        assignedBy: 'Current User'
      });
      
      setNewAssignment({
        agentId: '',
        reason: ''
      });
      
      toast.success(`Lead reassigned to ${selectedAgent.name}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWorkloadColor = (workload) => {
    if (workload <= 10) return 'text-green-600';
    if (workload <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Lead Assignment</h3>
        <p className="text-sm text-gray-600">Manage lead assignment and agent workload</p>
      </div>

      {/* Current Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Current Assignment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-lg">{currentAssignment.agentName}</h4>
                <p className="text-sm text-gray-600">
                  Assigned on {formatDate(currentAssignment.assignedAt)}
                </p>
                <p className="text-xs text-gray-500">
                  by {currentAssignment.assignedBy}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">Days assigned</span>
              <p className="text-lg font-bold">
                {Math.floor((Date.now() - new Date(currentAssignment.assignedAt)) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reassign Lead */}
      <Card>
        <CardHeader>
          <CardTitle>Reassign Lead</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Agent</label>
            <Select value={newAssignment.agentId} onValueChange={(value) => setNewAssignment({...newAssignment, agentId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="font-medium">{agent.name}</span>
                        <p className="text-xs text-gray-500">{agent.specialty}</p>
                      </div>
                      <span className={`text-xs ${getWorkloadColor(agent.workload)}`}>
                        {agent.workload} leads
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Reason for Reassignment</label>
            <Textarea
              value={newAssignment.reason}
              onChange={(e) => setNewAssignment({...newAssignment, reason: e.target.value})}
              placeholder="Enter reason for reassignment (optional)"
              rows={3}
            />
          </div>
          
          <Button onClick={handleReassignLead} className="w-full">
            Reassign Lead
          </Button>
        </CardContent>
      </Card>

      {/* Agent Workload Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Agent Workload Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableAgents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">{agent.name}</span>
                  <p className="text-sm text-gray-600">{agent.specialty}</p>
                </div>
                <div className="text-right">
                  <span className={`font-medium ${getWorkloadColor(agent.workload)}`}>
                    {agent.workload} leads
                  </span>
                  <p className="text-xs text-gray-500">
                    {agent.workload <= 10 ? 'Low' : agent.workload <= 15 ? 'Medium' : 'High'} workload
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Assignment History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignmentHistory.map((assignment, index) => (
              <div key={assignment.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{assignment.agentName}</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(assignment.assignedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Assigned by {assignment.assignedBy}
                  </p>
                  {assignment.reason && (
                    <p className="text-sm text-gray-500 mt-1">
                      Reason: {assignment.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadAssignment;
