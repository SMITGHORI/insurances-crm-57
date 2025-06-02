
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/contexts/PermissionsContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

const RouteGuard = ({ children, requiredPermission, route }) => {
  const { hasPermission, canAccessRoute, userRole } = usePermissions();

  // Check if user can access the route
  if (route && !canAccessRoute(route)) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <ShieldX className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold mb-2">Access Denied</div>
            <p>You don't have permission to access this page. Your current role ({userRole}) doesn't allow access to this section.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check specific permission if provided
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <ShieldX className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold mb-2">Permission Required</div>
            <p>You don't have the required permission ({requiredPermission}) to perform this action.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return children;
};

export default RouteGuard;
