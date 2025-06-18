
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  FileText,
  ArrowRight,
  Users,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ data, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const actionItems = [
    {
      title: 'Pending Claims',
      count: data?.pendingClaims?.count || 0,
      items: data?.pendingClaims?.items || [],
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      color: 'orange',
      route: '/claims',
      description: 'Claims requiring attention'
    },
    {
      title: 'Expiring Policies',
      count: data?.expiringPolicies?.count || 0,
      items: data?.expiringPolicies?.items || [],
      icon: <Calendar className="h-4 w-4 text-red-500" />,
      color: 'red',
      route: '/policies',
      description: 'Policies expiring soon'
    },
    {
      title: 'Overdue Leads',
      count: data?.overdueLeads?.count || 0,
      items: data?.overdueLeads?.items || [],
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      color: 'yellow',
      route: '/leads',
      description: 'Leads needing follow-up'
    },
    {
      title: 'Pending Quotations',
      count: data?.pendingQuotations?.count || 0,
      items: data?.pendingQuotations?.items || [],
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      color: 'blue',
      route: '/quotations',
      description: 'Quotations awaiting response'
    }
  ];

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Items requiring immediate attention
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actionItems.map((action, index) => (
          <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {action.icon}
                <span className="font-medium text-sm">{action.title}</span>
              </div>
              <Badge 
                variant={action.count > 0 ? "destructive" : "secondary"}
                className="text-xs"
              >
                {action.count}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-500 mb-2">{action.description}</p>
            
            {action.items.length > 0 && (
              <div className="space-y-1 mb-2">
                {action.items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                    {action.title === 'Pending Claims' && (
                      <span>{item.claimId} - ${item.claimAmount}</span>
                    )}
                    {action.title === 'Expiring Policies' && (
                      <span>{item.policyNumber} - ${item.premium?.amount || item.premium}</span>
                    )}
                    {action.title === 'Overdue Leads' && (
                      <span>{item.name} - {item.email}</span>
                    )}
                    {action.title === 'Pending Quotations' && (
                      <span>{item.quotationId} - ${item.premiumAmount}</span>
                    )}
                  </div>
                ))}
                {action.items.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{action.items.length - 2} more...
                  </div>
                )}
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between h-8"
              onClick={() => navigate(action.route)}
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
