
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Clock, 
  Plus, 
  User, 
  Phone,
  Mail,
  FileText,
  AlertCircle
} from 'lucide-react';

const DashboardTasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Follow up with John Doe',
      description: 'Call regarding life insurance quote',
      dueDate: '2024-06-25T15:00:00Z',
      priority: 'high',
      type: 'call',
      completed: false,
      clientName: 'John Doe'
    },
    {
      id: '2',
      title: 'Send policy documents',
      description: 'Email policy documents to Jane Smith',
      dueDate: '2024-06-25T17:00:00Z',
      priority: 'medium',
      type: 'email',
      completed: false,
      clientName: 'Jane Smith'
    },
    {
      id: '3',
      title: 'Review claim documents',
      description: 'Review auto insurance claim #CLM-001',
      dueDate: '2024-06-26T10:00:00Z',
      priority: 'high',
      type: 'review',
      completed: false,
      clientName: 'Robert Johnson'
    },
    {
      id: '4',
      title: 'Prepare quotation',
      description: 'Create health insurance quote for family',
      dueDate: '2024-06-26T14:00:00Z',
      priority: 'medium',
      type: 'document',
      completed: true,
      clientName: 'Maria Garcia'
    }
  ]);

  const toggleTask = (id) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4 text-blue-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-green-500" />;
      case 'review':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(date - now) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return 'Due now';
    } else if (diffHours < 24) {
      return `Due in ${Math.round(diffHours)} hours`;
    } else {
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const overdueTasks = pendingTasks.filter(task => isOverdue(task.dueDate));

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Tasks
            <Badge variant="outline" className="ml-2">
              {pendingTasks.length}
            </Badge>
            {overdueTasks.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {overdueTasks.length} overdue
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No tasks for today</p>
          </div>
        ) : (
          <>
            {/* Pending Tasks */}
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border ${
                  isOverdue(task.dueDate) 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 bg-white'
                } hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTaskIcon(task.type)}
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      {isOverdue(task.dueDate) && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{task.clientName}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${
                        isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span>{formatDueDate(task.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Completed Tasks */}
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTaskIcon(task.type)}
                      <h4 className="font-medium text-sm line-through text-gray-600">{task.title}</h4>
                      <Badge variant="outline" className="text-green-600">
                        Completed
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{task.clientName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardTasks;
