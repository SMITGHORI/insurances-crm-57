
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Check, X } from 'lucide-react';

/**
 * Permission Overview component
 * Displays current user's permissions in a matrix format
 */
export const PermissionOverview: React.FC = () => {
  const { userPermissions, userRole, userBranch, hasPermission } = usePermissions();

  // Define modules and actions for the matrix
  const modules = [
    'clients', 'policies', 'claims', 'leads', 
    'quotations', 'invoices', 'agents', 'reports'
  ];

  const actions = ['view', 'create', 'edit', 'delete', 'export'];

  const getPermissionStatus = (module: string, action: string) => {
    return hasPermission(module, action);
  };

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Permission Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <Badge variant="secondary" className="mt-1">
                {userRole?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Branch</label>
              <p className="font-medium">{userBranch || 'All Branches'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total Permissions</label>
              <p className="font-medium">
                {userPermissions.reduce((acc, p) => acc + p.actions.length, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-medium">Module</th>
                  {actions.map(action => (
                    <th key={action} className="text-center p-3 border-b font-medium capitalize">
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map(module => (
                  <tr key={module} className="border-b">
                    <td className="p-3 font-medium capitalize">{module}</td>
                    {actions.map(action => {
                      const hasAccess = getPermissionStatus(module, action);
                      return (
                        <td key={`${module}-${action}`} className="text-center p-3">
                          {hasAccess ? (
                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-red-400 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Super Admin Actions */}
      {userRole === 'super_admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                As a Super Admin, you have access to all permissions and can manage roles.
              </p>
              <Button variant="outline">
                Switch to Role Editor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PermissionOverview;
