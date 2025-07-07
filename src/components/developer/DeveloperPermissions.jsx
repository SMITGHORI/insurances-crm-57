import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Shield, 
  Key, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  UserPlus,
  Mail,
  Phone,
  Building,
  Crown,
  Star,
  CheckCircle,
  XCircle,
  Award,
  FileCheck,
  Settings,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const DeveloperPermissions = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ 
    email: 'info@smeetghori.in', 
    password: 'Smeet@123' 
  });
  const [authToken, setAuthToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissionTemplates, setPermissionTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    branch: 'main'
  });
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({
    name: '',
    displayName: '',
    permissions: [],
    isDefault: false
  });

  // API base URL - use relative path to go through Vite proxy
  const API_BASE = '/api/developer';

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && authToken) {
      loadInitialData(authToken);
    }
  }, [isAuthenticated, authToken]);

  // Authenticate developer
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        setAuthToken(data.data.token);
        toast.success('Developer authenticated successfully');
        await loadInitialData(data.data.token);
      } else {
        toast.error(data.message || 'Authentication failed');
      }
    } catch (error) {
      toast.error('Authentication error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  const loadInitialData = async (token = authToken) => {
    await Promise.all([
      loadUsers(token),
      loadRoles(token),
      loadPermissionTemplates(token)
    ]);
  };

  // Load all users
  const loadUsers = async (token = authToken) => {
    if (!token) {
      console.warn('No auth token available for loading users');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Authentication failed. Please login again.');
          setIsAuthenticated(false);
          setAuthToken(null);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setUsers(data.data);
      } else {
        console.warn('Invalid response format for users:', data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users: ' + error.message);
    }
  };

  // Load all roles
  const loadRoles = async (token = authToken) => {
    if (!token) {
      console.warn('No auth token available for loading roles');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/permissions/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Authentication failed. Please login again.');
          setIsAuthenticated(false);
          setAuthToken(null);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setRoles(data.data);
      } else {
        console.warn('Invalid response format for roles:', data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles: ' + error.message);
    }
  };

  // Load permission templates
  const loadPermissionTemplates = async (token = authToken) => {
    if (!token) {
      console.warn('No auth token available for loading permission templates');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/permission-templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Authentication failed. Please login again.');
          setIsAuthenticated(false);
          setAuthToken(null);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setPermissionTemplates(data.data);
      } else {
        console.warn('Invalid response format for permission templates:', data);
      }
    } catch (error) {
      console.error('Error loading permission templates:', error);
      toast.error('Failed to load permission templates: ' + error.message);
    }
  };

  // Create new user
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!authToken) {
      toast.error('Authentication required. Please login again.');
      setIsAuthenticated(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newUser),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('User created successfully');
        setNewUser({ name: '', email: '', password: '', phone: '', role: '', branch: 'main' });
        await loadUsers();
      } else {
        // Handle specific error codes
        if (response.status === 401) {
          toast.error('Authentication failed. Please login again.');
          setIsAuthenticated(false);
          setAuthToken(null);
        } else if (response.status === 409) {
          toast.error(`User with email '${newUser.email}' already exists.`);
        } else {
          toast.error(data.message || data.error || 'Failed to create user');
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error creating user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply permission template
  const applyTemplate = (templateKey) => {
    const template = permissionTemplates[templateKey];
    if (template) {
      setNewRole({
        ...newRole,
        name: templateKey,
        displayName: template.name,
        permissions: template.permissions
      });
      setSelectedTemplate(templateKey);
      toast.success(`Applied ${template.name} template`);
    }
  };

  // Create new role
  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.displayName) {
      toast.error('Role name and display name are required');
      return;
    }

    if (!authToken) {
      toast.error('Authentication required. Please login again.');
      setIsAuthenticated(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/permissions/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newRole),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Role created successfully');
        setNewRole({ name: '', displayName: '', permissions: [], isDefault: false });
        setSelectedTemplate('');
        await loadRoles();
      } else {
        // Handle specific error codes
        if (response.status === 401) {
          toast.error('Authentication failed. Please login again.');
          setIsAuthenticated(false);
          setAuthToken(null);
        } else if (response.status === 409) {
          toast.error(`Role '${newRole.name}' already exists. Please choose a different name.`);
        } else {
          toast.error(data.message || data.error || 'Failed to create role');
        }
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Error creating role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get template icon
  const getTemplateIcon = (templateKey) => {
    switch (templateKey) {
      case 'super_admin': return <Crown className="h-4 w-4" />;
      case 'admin': return <Settings className="h-4 w-4" />;
      case 'manager': return <Star className="h-4 w-4" />;
      case 'team_lead': return <Users className="h-4 w-4" />;
      case 'senior_agent': return <Award className="h-4 w-4" />;
      case 'agent': return <User className="h-4 w-4" />;
      case 'customer_service': return <Phone className="h-4 w-4" />;
      case 'underwriter': return <FileCheck className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Shield className="h-8 w-8 text-blue-600" />
              Developer Access
            </CardTitle>
            <p className="text-gray-600">Secure system management portal</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                Authenticate
              </Button>
            </form>
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This is a developer-only interface for managing system permissions and users.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main interface
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 text-gray-900">
              <Shield className="h-10 w-10 text-blue-600" />
              Developer Console
            </h1>
            <p className="text-gray-600 mt-2">Manage users, roles, and permissions</p>
          </div>
          <Button onClick={() => setIsAuthenticated(false)} variant="outline" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="create-user" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="create-role" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Role
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">System Users</h2>
                <Button onClick={loadUsers} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <div className="grid gap-4">
                {users.map(user => (
                  <Card key={user._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {user.email}
                              </span>
                              {user.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  {user.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                {user.branch}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getRoleBadgeColor(user.role?.name)}>
                            {user.role?.displayName || 'No Role'}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-600">Active</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {users.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No users found. Create your first user to get started.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create-user">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  Create New User
                </CardTitle>
                <p className="text-gray-600">Add a new user to the system with specific role and permissions</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="userName">Full Name *</Label>
                    <Input
                      id="userName"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userEmail">Email Address *</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userPassword">Password *</Label>
                    <Input
                      id="userPassword"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter password"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userPhone">Phone Number</Label>
                    <Input
                      id="userPhone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userRole">Role *</Label>
                    <select
                      id="userRole"
                      className="w-full p-2 border rounded-md mt-1"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option value="">Select a role</option>
                      {roles.map(role => (
                        <option key={role._id} value={role._id}>
                          {role.displayName} ({role.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="userBranch">Branch</Label>
                    <select
                      id="userBranch"
                      className="w-full p-2 border rounded-md mt-1"
                      value={newUser.branch}
                      onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })}
                    >
                      <option value="main">Main Branch</option>
                      <option value="north">North Branch</option>
                      <option value="south">South Branch</option>
                      <option value="east">East Branch</option>
                      <option value="west">West Branch</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button onClick={handleCreateUser} disabled={loading} className="flex items-center gap-2">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Create User
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setNewUser({ name: '', email: '', password: '', phone: '', role: '', branch: 'main' })}
                  >
                    Clear Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">System Roles</h2>
                <Button onClick={loadRoles} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <div className="grid gap-4">
                {roles.map(role => (
                  <Card key={role._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {getTemplateIcon(role.name)}
                            {role.displayName}
                            {role.isDefault && <Badge variant="secondary">Default</Badge>}
                          </CardTitle>
                          <p className="text-sm text-gray-600">Role: {role.name}</p>
                        </div>
                        <Badge className={getRoleBadgeColor(role.name)}>
                          {role.name}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                          Permissions ({role.permissions?.length || 0} modules):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions?.map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {permission.module}: {permission.actions.join(', ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create-role">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-6 w-6" />
                  Create Custom Role
                </CardTitle>
                <p className="text-gray-600">Create a new role with custom permissions</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="customRoleName">Role Name *</Label>
                    <Input
                      id="customRoleName"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      placeholder="e.g., senior_agent"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customDisplayName">Display Name *</Label>
                    <Input
                      id="customDisplayName"
                      value={newRole.displayName}
                      onChange={(e) => setNewRole({ ...newRole, displayName: e.target.value })}
                      placeholder="e.g., Senior Agent"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newRole.isDefault}
                      onChange={(e) => setNewRole({ ...newRole, isDefault: e.target.checked })}
                    />
                    <span className="text-sm">Set as default role for new users</span>
                  </label>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Permissions</h3>
                  <p className="text-sm text-gray-600">Select modules and actions for this role</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['clients', 'leads', 'quotations', 'policies', 'claims', 'invoices', 'agents', 'reports', 'settings', 'activities', 'offers'].map(module => (
                      <Card key={module} className="p-4">
                        <h4 className="font-medium capitalize mb-2">{module}</h4>
                        <div className="space-y-2">
                          {['view', 'create', 'edit', 'delete', 'approve', 'export'].map(action => (
                            <label key={action} className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={newRole.permissions.some(p => p.module === module && p.actions.includes(action))}
                                onChange={(e) => {
                                  const updatedPermissions = [...newRole.permissions];
                                  const existingPermIndex = updatedPermissions.findIndex(p => p.module === module);
                                  
                                  if (existingPermIndex >= 0) {
                                    if (e.target.checked) {
                                      if (!updatedPermissions[existingPermIndex].actions.includes(action)) {
                                        updatedPermissions[existingPermIndex].actions.push(action);
                                      }
                                    } else {
                                      updatedPermissions[existingPermIndex].actions = updatedPermissions[existingPermIndex].actions.filter(a => a !== action);
                                      if (updatedPermissions[existingPermIndex].actions.length === 0) {
                                        updatedPermissions.splice(existingPermIndex, 1);
                                      }
                                    }
                                  } else if (e.target.checked) {
                                    updatedPermissions.push({ module, actions: [action] });
                                  }
                                  
                                  setNewRole({ ...newRole, permissions: updatedPermissions });
                                }}
                              />
                              <span className="capitalize">{action}</span>
                            </label>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button onClick={handleCreateRole} disabled={loading} className="flex items-center gap-2">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Create Role
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setNewRole({ name: '', displayName: '', permissions: [], isDefault: false })}
                  >
                    Clear Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Permission Templates</h2>
                <p className="text-gray-600">Pre-configured permission sets for common roles</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(permissionTemplates).map(([key, template]) => {
                  const isHighPrivilege = ['super_admin', 'admin', 'manager'].includes(key);
                  const cardClass = isHighPrivilege 
                    ? "hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white" 
                    : "hover:shadow-md transition-shadow";
                  
                  return (
                    <Card key={key} className={cardClass}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {getTemplateIcon(key)}
                          {template.name}
                          {isHighPrivilege && (
                            <Badge variant="secondary" className="text-xs">
                              High Access
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Modules ({template.permissions?.length || 0}):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {template.permissions?.slice(0, 5).map((permission, index) => (
                                <Badge key={index} variant="outline" className="text-xs capitalize">
                                  {permission.module}
                                </Badge>
                              ))}
                              {template.permissions?.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.permissions.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Key Actions:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {template.permissions?.slice(0, 3).map((permission, index) => (
                                permission.actions.slice(0, 2).map((action, actionIndex) => (
                                  <Badge key={`${index}-${actionIndex}`} variant="secondary" className="text-xs capitalize">
                                    {action}
                                  </Badge>
                                ))
                              )).flat().slice(0, 4)}
                            </div>
                          </div>
                          
                          <Button 
                            variant={isHighPrivilege ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => applyTemplate(key)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedTemplate && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      Create Role from Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="templateRoleName">Role Name</Label>
                        <Input
                          id="templateRoleName"
                          value={newRole.name}
                          onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                          placeholder="e.g., senior_agent"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="templateDisplayName">Display Name</Label>
                        <Input
                          id="templateDisplayName"
                          value={newRole.displayName}
                          onChange={(e) => setNewRole({ ...newRole, displayName: e.target.value })}
                          placeholder="e.g., Senior Agent"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newRole.isDefault}
                          onChange={(e) => setNewRole({ ...newRole, isDefault: e.target.checked })}
                        />
                        <span className="text-sm">Set as default role for new users</span>
                      </label>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button onClick={handleCreateRole} disabled={loading}>
                        {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Create Role
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedTemplate('');
                          setNewRole({ name: '', displayName: '', permissions: [], isDefault: false });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeveloperPermissions;