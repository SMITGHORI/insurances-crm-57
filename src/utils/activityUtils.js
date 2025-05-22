
import React from 'react';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  Star, 
  Clock,
  FileEdit,
  AlertCircle
} from 'lucide-react';

export const getActivityIcon = (type) => {
  switch (type) {
    case 'client':
      return <Users className="h-5 w-5 text-amba-blue" />;
    case 'policy':
      return <FileText className="h-5 w-5 text-amba-orange" />;
    case 'claim':
      return <ShieldCheck className="h-5 w-5 text-green-500" />;
    case 'reminder':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'quotation':
      return <FileEdit className="h-5 w-5 text-purple-500" />;
    case 'lead':
      return <Star className="h-5 w-5 text-yellow-500" />;
    case 'payment':
      return <FileText className="h-5 w-5 text-green-500" />;
    case 'document':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'commission':
      return <FileText className="h-5 w-5 text-amba-orange" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

export const formatActivityDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateString;
  }
};

export const filterActivities = (activities, filters) => {
  const { searchQuery, activeTab, dateFilter, typeFilter, agentFilter } = filters;
  
  let result = [...activities];
  
  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(activity => 
      (activity.action && activity.action.toLowerCase().includes(query)) ||
      (activity.client && activity.client.toLowerCase().includes(query)) ||
      (activity.agent && activity.agent.toLowerCase().includes(query)) ||
      (activity.details && activity.details.toLowerCase().includes(query))
    );
  }
  
  // Filter by tab (activity type)
  if (activeTab !== 'all') {
    result = result.filter(activity => activity.type === activeTab);
  }
  
  // Filter by date
  if (dateFilter !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    switch (dateFilter) {
      case 'today':
        result = result.filter(activity => {
          const activityDate = new Date(activity.time).getTime();
          return activityDate >= today;
        });
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = yesterday.getTime();
        
        result = result.filter(activity => {
          const activityDate = new Date(activity.time).getTime();
          return activityDate >= yesterdayStart && activityDate < today;
        });
        break;
      case 'week':
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const weekStart = lastWeek.getTime();
        
        result = result.filter(activity => {
          const activityDate = new Date(activity.time).getTime();
          return activityDate >= weekStart;
        });
        break;
      case 'month':
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const monthStart = lastMonth.getTime();
        
        result = result.filter(activity => {
          const activityDate = new Date(activity.time).getTime();
          return activityDate >= monthStart;
        });
        break;
    }
  }
  
  // Filter by agent
  if (agentFilter !== 'all') {
    result = result.filter(activity => activity.agent === agentFilter);
  }
  
  // Filter by type
  if (typeFilter !== 'all') {
    result = result.filter(activity => activity.type === typeFilter);
  }
  
  return result;
};
