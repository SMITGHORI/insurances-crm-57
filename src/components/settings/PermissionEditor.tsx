
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
  roleId: string;
  name: string;
  displayName: string;
  permissions: {
    module: string;
    actions: string[];
  }[];
}

/**
 * Permission Editor component for Super Admin users
 * Now integrated with real backend API calls
 */
export const PermissionEditor: React.FC = () => {
  const { refreshPermissions } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [availableRoles, setAvailableRoles] = useState<Array<{id: string, name: string, displayName: string}>>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Define available modules and actions
  const modules = [
    'clients', 'policies', 'claims', 'leads', 
    'quotations', 'invoices', 'agents', 'reports', 'settings'
  ];

  const actions = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'edit_sensitive', 'edit_status'];

  // Fetch available roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.VITE_API_URL}/api/roles`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const roles = data.data
            .filter((role: any) => role.name !== 'super_admin') // Don't allow editing super_admin
            .map((role: any) => ({
              id: role._id,
              name: role.name,
              displayName: role.displayName
            }));
          
          setAvailableRoles(roles);
          
          // Select first role by default
          if (roles.length > 0) {
            setSelectedRoleId(roles[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        toast.error('Failed to load roles');
      }
    };

    fetchRoles();
  }, []);

  // Load role permissions when selected role changes
  useEffect(() => {
    if (selectedRoleId) {
      loadRolePermissions(selectedRoleId);
    }
  }, [selectedRoleId]);

  // Load role permissions from API
  const loadRolePermissions = async (roleId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.VITE_API_URL}/api/roles/${roleId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRolePermissions({
          roleId: data.data.roleId,
          name: data.data.name,
          displayName: data.data.displayName,
          permissions: data.data.permissions
        });
      } else {
        toast.error('Failed to load role permissions');
      }
    } catch (error) {
      console.error('Failed to load role permissions:', error);
      toast.error('Failed to load role permissions');
    } finally {
      setLoading(false);
    }
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
        
        // Remove empty module
        if (updatedPermissions[moduleIndex].actions.length === 0) {
          updatedPermissions.splice(moduleIndex, 1);
        }
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

  // Save permissions to API
  const savePermissions = async () => {
    if (!rolePermissions) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.VITE_API_URL}/api/roles/${selectedRoleId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          permissions: rolePermissions.permissions
        })
      });

      if (response.ok) {
        toast.success(`${rolePermissions.displayName} permissions updated successfully`);
        // Refresh user permissions to update UI immediately
        await refreshPermissions();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save permissions');
      }
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Protected module="settings" action="edit">
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
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      <Badge variant="secondary">
                        {role.displayName}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedRoleId && loadRolePermissions(selectedRoleId)}
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
                          {action.replace('_', ' ')}
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
                            {action.replace('_', ' ')}
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
