
import React, { useState, Suspense } from 'react';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Quote, 
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

// Lazy load dashboard components to avoid context issues
const DashboardContent = React.lazy(() => import('@/components/dashboard/DashboardContent'));

const Dashboard = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Real-time overview of your insurance business
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-none shadow-md animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <DashboardContent isMobile={isMobile} />
      </Suspense>
    </div>
  );
};

export default Dashboard;
