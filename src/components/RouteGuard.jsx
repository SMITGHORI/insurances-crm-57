
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const RouteGuard = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log('RouteGuard - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated || !user) {
    console.log('User not authenticated, redirecting to auth page');
    return <Navigate to="/auth" replace />;
  }

  console.log('User authenticated, rendering protected content');
  return children;
};

export default RouteGuard;
