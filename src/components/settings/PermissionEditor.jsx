
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Save, RotateCcw, Users, Lock } from 'lucide-react';

// Mock API functions - replace with actual API calls
const rolesApi = {
  getRoles: async () => {
    const response = await fetch('/api/roles');
    if (!response.ok) throw new Error('Failed to fetch roles');
    return response.json();
  },
  
  getRolePermissions: async (roleId) => {
    const response = await fetch(`/api/roles/${roleId}/permissions`);
    if (!response.ok) throw new Error('Failed to fetch role permissions');
    return response.json();
  },
  
  updateRolePermissions: async ({ roleId, permissions }) => {
    const response = await fetch(`/api/roles/${roleId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions })
    });
    if (!response.ok) throw new Error('Failed to update permissions');
    return response.json();
  }
};

const PermissionEditor = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  // Define all modules and their available actions
  const modules = {
    clients: { name: 'Clients', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    policies: { name: 'Policies', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
    claims: { name: 'Claims', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
    leads: { name: 'Leads', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    quotations: { name: 'Quotations', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    offers: { name: 'Offers & Broadcasts', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    invoices: { name: 'Invoices', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    agents: { name: 'Agents', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    reports: { name: 'Reports', actions: ['view', 'export'] },
    settings: { name: 'Settings', actions: ['view', 'edit', 'view_permissions'] },
    activities: { name: 'Activities', actions: ['view', 'create', 'edit', 'delete'] }
  };

  // Fetch roles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getRoles
  });

  // Fetch role permissions
  const { data: rolePermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['rolePermissions', selectedRole?.id],
    queryFn: () => rolesApi.getRolePermissions(selectedRole.id),
    enabled: !!selectedRole
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: rolesApi.updateRolePermissions,
    onSuccess: () => {
      toast.success('Permissions updated successfully');
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
      
      // Trigger real-time update for all connected users
      window.dispatchEvent(new CustomEvent('permissions-updated', {
        detail: { roleId: selectedRole.id, permissions }
      }));
    },
    onError: (error) => {
      toast.error(`Failed to update permissions: ${error.message}`);
    }
  });

  // Initialize permissions when role data is loaded
  useEffect(() => {
    if (rolePermissions?.data?.permissions) {
      const permissionsMap = {};
      rolePermissions.data.permissions.forEach(perm => {
        permissionsMap[perm.module] = perm.actions;
      });
      setPermissions(permissionsMap);
      setHasChanges(false);
    }
  }, [rolePermissions]);

  const hasPermission = (module, action) => {
    return permissions[module]?.includes(action) || false;
  };

  const togglePermission = (module, action) => {
    if (selectedRole?.name === 'super_admin') {
      toast.error('Cannot modify super admin permissions');
      return;
    }

    setPermissions(prev => {
      const modulePerms = prev[module] || [];
      const newPerms = modulePerms.includes(action)
        ? modulePerms.filter(a => a !== action)
        : [...modulePerms, action];
      
      const updated = { ...prev, [module]: newPerms };
      setHasChanges(true);
      return updated;
    });
  };

  const toggleAllModulePermissions = (module, enable) => {
    if (selectedRole?.name === 'super_admin') return;

    setPermissions(prev => ({
      ...prev,
      [module]: enable ? modules[module].actions : []
    }));
    setHasChanges(true);
  };

  const resetPermissions = () => {
    if (rolePermissions?.data?.permissions) {
      const permissionsMap = {};
      rolePermissions.data.permissions.forEach(perm => {
        permissionsMap[perm.module] = perm.actions;
      });
      setPermissions(permissionsMap);
      setHasChanges(false);
    }
  };

  const savePermissions = () => {
    const formattedPermissions = Object.entries(permissions)
      .filter(([_, actions]) => actions.length > 0)
      .map(([module, actions]) => ({ module, actions }));

    updatePermissionsMutation.mutate({
      roleId: selectedRole.id,
      permissions: formattedPermissions
    });
  };

  const getPermissionCount = (module) => {
    return permissions[module]?.length || 0;
  };

  const getTotalPermissions = () => {
    return Object.values(permissions).reduce((acc, actions) => acc + actions.length, 0);
  };

  if (rolesLoading) {
    return <div className="flex justify-center p-8">Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Role Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Editor
          </CardTitle>
          <CardDescription>
            Manage role-based permissions for different user types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Role to Edit</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                {roles?.data?.map(role => (
                  <Button
                    key={role._id}
                    variant={selectedRole?.id === role._id ? "default" : "outline"}
                    onClick={() => setSelectedRole({ id: role._id, name: role.name, displayName: role.displayName })}
                    className="justify-start"
                    disabled={role.name === 'super_admin'}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {role.displayName}
                    {role.name === 'super_admin' && <Lock className="h-3 w-3 ml-2" />}
                  </Button>
                ))}
              </div>
            </div>

            {selectedRole && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Badge variant="secondary">
                    {getTotalPermissions()} total permissions
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetPermissions}
                    disabled={!hasChanges}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={savePermissions}
                    disabled={!hasChanges || updatePermissionsMutation.isLoading}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {updatePermissionsMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle>
              Permissions for {selectedRole.displayName}
            </CardTitle>
            <CardDescription>
              Toggle permissions for different modules and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {permissionsLoading ? (
              <div className="flex justify-center p-8">Loading permissions...</div>
            ) : (
              <div className="space-y-6">
                {Object.entries(modules).map(([moduleKey, moduleInfo]) => (
                  <div key={moduleKey} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{moduleInfo.name}</h3>
                        <Badge variant="outline">
                          {getPermissionCount(moduleKey)}/{moduleInfo.actions.length}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAllModulePermissions(moduleKey, true)}
                          disabled={selectedRole.name === 'super_admin'}
                        >
                          Enable All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAllModulePermissions(moduleKey, false)}
                          disabled={selectedRole.name === 'super_admin'}
                        >
                          Disable All
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {moduleInfo.actions.map(action => (
                        <div key={`${moduleKey}-${action}`} className="flex items-center space-x-2">
                          <Switch
                            id={`${moduleKey}-${action}`}
                            checked={hasPermission(moduleKey, action)}
                            onCheckedChange={() => togglePermission(moduleKey, action)}
                            disabled={selectedRole.name === 'super_admin'}
                          />
                          <label
                            htmlFor={`${moduleKey}-${action}`}
                            className="text-sm font-medium capitalize cursor-pointer"
                          >
                            {action.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PermissionEditor;
