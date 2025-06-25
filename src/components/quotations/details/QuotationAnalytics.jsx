
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Eye, Clock, Send, Target, Users } from 'lucide-react';

const QuotationAnalytics = ({ quotationId }) => {
  // Mock analytics data
  const analytics = {
    views: {
      total: 3,
      unique: 2,
      lastViewed: '2025-06-02T11:15:00Z'
    },
    engagement: {
      timeOnPage: '2m 45s',
      sections: [
        { name: 'Overview', views: 3, percentage: 100 },
        { name: 'Product Details', views: 2, percentage: 67 },
        { name: 'Terms & Conditions', views: 1, percentage: 33 }
      ]
    },
    comparison: {
      similarQuotations: 15,
      averageViewTime: '1m 30s',
      conversionRate: 35
    },
    timeline: [
      { date: '2025-06-02', views: 2, duration: '3m 15s' },
      { date: '2025-06-01', views: 1, duration: '2m 30s' }
    ]
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Quotation Analytics</h3>
        <p className="text-sm text-gray-600">Track engagement and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total Views</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{analytics.views.total}</div>
            <p className="text-xs text-gray-500 mt-1">
              Last viewed: {formatDate(analytics.views.lastViewed)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Avg. Time</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{analytics.engagement.timeOnPage}</div>
            <p className="text-xs text-gray-500 mt-1">
              Industry avg: {analytics.comparison.averageViewTime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Unique Viewers</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{analytics.views.unique}</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((analytics.views.unique / analytics.views.total) * 100)}% unique rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Section Engagement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.engagement.sections.map((section, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{section.name}</span>
                    <span className="text-sm text-gray-500">{section.views} views</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${section.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <Badge variant="secondary" className="ml-4">
                  {section.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Performance Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Similar Quotations</p>
              <p className="text-xl font-bold text-blue-600">{analytics.comparison.similarQuotations}</p>
              <p className="text-xs text-gray-500">in this category</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-xl font-bold text-green-600">{analytics.comparison.conversionRate}%</p>
              <p className="text-xs text-gray-500">industry average</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Performance</p>
              <p className="text-xl font-bold text-purple-600">Above Avg</p>
              <p className="text-xs text-gray-500">compared to similar</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>View Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.timeline.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{entry.date}</p>
                  <p className="text-sm text-gray-600">{entry.views} views</p>
                </div>
                <Badge variant="outline">
                  {entry.duration}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationAnalytics;
