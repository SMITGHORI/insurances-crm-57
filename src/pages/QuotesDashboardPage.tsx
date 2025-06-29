
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import Protected from '@/components/Protected';
import QuotesDashboard from '@/components/quotes/QuotesDashboard';

const QuotesDashboardPage: React.FC = () => {
  return (
    <Protected module="quotations" action="view">
      <div className="container mx-auto px-4 py-6">
        <QuotesDashboard />
      </div>
    </Protected>
  );
};

export default QuotesDashboardPage;
