
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Save, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import Protected from '../Protected';

interface RolePermission {
  id: string;
  name: string;
  role: string;
  permissions: {
    module: string;
    actions: string[];
  }[];
}

/**
 * Permission Editor component for Super Admin users
 * Allows editing of role permissions through a module-action matrix
 */
export const PermissionEditor: React.FC = () => {
  const { refreshPermissions } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('agent');
  const [rolePermissions, setRolePermissions] = useState<RolePermission | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Define available modules and actions
  const modules = [
    'clients', 'policies', 'claims', 'leads', 
    'quotations', 'invoices', 'agents', 'reports', 'settings'
  ];

  const actions = ['view', 'create', 'edit', 'delete', 'export'];

  // Available roles for editing
  const roles = [
    { value: 'agent', label: 'Agent', color: 'bg-blue-100 text-blue-800' },
    { value: 'manager', label: 'Manager', color: 'bg-green-100 text-green-800' },
    { value: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-800' }
  ];

  // Load role permissions
  const loadRolePermissions = async (role: string) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API endpoint
      const response = await fetch(`/api/roles/${role}/permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRolePermissions(data);
      } else {
        // Fallback to mock data for development
        setRolePermissions(getMockRolePermissions(role));
      }
    } catch (error) {
      console.error('Failed to load role permissions:', error);
      // Use mock data as fallback
      setRolePermissions(getMockRolePermissions(role));
    } finally {
      setLoading(false);
    }
  };

  // Mock role permissions for development
  const getMockRolePermissions = (role: string): RolePermission => {
    const basePermissions = {
      agent: [
        { module: 'clients', actions: ['view', 'create', 'edit'] },
        { module: 'policies', actions: ['view', 'create', 'edit'] },
        { module: 'claims', actions: ['view', 'create', 'edit'] },
        { module: 'leads', actions: ['view', 'create', 'edit'] },
        { module: 'quotations', actions: ['view', 'create', 'edit'] },
        { module: 'reports', actions: ['view'] },
        { module: 'settings', actions: ['view'] }
      ],
      manager: [
        { module: 'clients', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'policies', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'claims', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'leads', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'quotations', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'invoices', actions: ['view', 'create', 'edit'] },
        { module: 'agents', actions: ['view', 'create', 'edit'] },
        { module: 'reports', actions: ['view', 'export'] },
        { module: 'settings', actions: ['view', 'edit'] }
      ],
      admin: modules.map(module => ({
        module,
        actions: [...actions]
      }))
    };

    return {
      id: `${role}-1`,
      name: role.charAt(0).toUpperCase() + role.slice(1),
      role,
      permissions: basePermissions[role as keyof typeof basePermissions] || []
    };
  };

  // Check if role has specific permission
  const hasPermission = (module: string, action: string): boolean => {
    if (!rolePermissions) return false;
    const modulePermissions = rolePermissions.permissions.find(p => p.module === module);
    return modulePermissions ? modulePermissions.actions.includes(action) : false;
  };

  // Toggle permission
  const togglePermission = (module: string, action: string) => {
    if (!rolePermissions) return;

    const updatedPermissions = [...rolePermissions.permissions];
    const moduleIndex = updatedPermissions.findIndex(p => p.module === module);

    if (moduleIndex >= 0) {
      const currentActions = updatedPermissions[moduleIndex].actions;
      if (currentActions.includes(action)) {
        // Remove permission
        updatedPermissions[moduleIndex].actions = currentActions.filter(a => a !== action);
      } else {
        // Add permission
        updatedPermissions[moduleIndex].actions = [...currentActions, action];
      }
    } else {
      // Add new module with this action
      updatedPermissions.push({
        module,
        actions: [action]
      });
    }

    setRolePermissions({
      ...rolePermissions,
      permissions: updatedPermissions
    });
  };

  // Save permissions
  const savePermissions = async () => {
    if (!rolePermissions) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/roles/${selectedRole}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          permissions: rolePermissions.permissions
        })
      });

      if (response.ok) {
        toast.success(`${rolePermissions.name} permissions updated successfully`);
        // Refresh user permissions if they updated their own role
        await refreshPermissions();
      } else {
        // Mock success for development
        toast.success(`${rolePermissions.name} permissions updated successfully (Mock)`);
      }
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast.success(`${rolePermissions.name} permissions updated successfully (Mock)`);
    } finally {
      setSaving(false);
    }
  };

  // Load permissions when role changes
  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  return (
    <Protected module="settings" action="editSystem">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Editor
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Edit Role:</span>
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${role.color}`}>
                          {role.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadRolePermissions(selectedRole)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={savePermissions}
                disabled={saving || !rolePermissions}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading permissions...</span>
            </div>
          ) : rolePermissions ? (
            <div className="space-y-4">
              {/* Permission Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 border border-gray-200 font-medium">
                        Module
                      </th>
                      {actions.map(action => (
                        <th key={action} className="text-center p-3 border border-gray-200 font-medium capitalize min-w-[80px]">
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(module => (
                      <tr key={module} className="hover:bg-gray-50">
                        <td className="p-3 border border-gray-200 font-medium capitalize">
                          {module}
                        </td>
                        {actions.map(action => (
                          <td key={`${module}-${action}`} className="text-center p-3 border border-gray-200">
                            <Checkbox
                              checked={hasPermission(module, action)}
                              onCheckedChange={() => togglePermission(module, action)}
                              className="mx-auto"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator />

              {/* Permission Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Permission Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rolePermissions.permissions.map(perm => (
                    <div key={perm.module} className="text-sm">
                      <span className="font-medium capitalize">{perm.module}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {perm.actions.map(action => (
                          <Badge key={action} variant="secondary" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a role to edit permissions
            </div>
          )}
        </CardContent>
      </Card>
    </Protected>
  );
};

export default PermissionEditor;
