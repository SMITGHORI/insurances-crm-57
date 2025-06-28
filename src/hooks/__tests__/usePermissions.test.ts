
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePermissions } from '../usePermissions';
import { useAuth } from '@/contexts/AuthContext';

// Mock useAuth
vi.mock('@/contexts/AuthContext');

describe('usePermissions Hook', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'agent',
    branch: 'main',
    flatPermissions: ['clients:view', 'clients:create', 'policies:view'],
    permissions: [
      { module: 'clients', actions: ['view', 'create'] },
      { module: 'policies', actions: ['view'] }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct permissions for agent role', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      hasPermission: vi.fn((module, action) => 
        mockUser.flatPermissions.includes(`${module}:${action}`)
      ),
      hasAnyPermission: vi.fn(),
      isSameBranch: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      refreshPermissions: vi.fn(),
      isSuperAdmin: vi.fn(() => false),
      isAuthenticated: true
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('clients', 'view')).toBe(true);
    expect(result.current.hasPermission('clients', 'delete')).toBe(false);
    expect(result.current.userRole).toBe('agent');
    expect(result.current.userBranch).toBe('main');
  });

  it('should handle super admin permissions', () => {
    const superAdminUser = { ...mockUser, role: 'super_admin' };
    
    vi.mocked(useAuth).mockReturnValue({
      user: superAdminUser,
      hasPermission: vi.fn(() => true), // Super admin has all permissions
      hasAnyPermission: vi.fn(() => true),
      isSameBranch: vi.fn(() => true),
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      refreshPermissions: vi.fn(),
      isSuperAdmin: vi.fn(() => true),
      isAuthenticated: true
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('clients', 'delete')).toBe(true);
    expect(result.current.hasPermission('settings', 'edit')).toBe(true);
  });

  it('should handle branch-based access correctly', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      isSameBranch: vi.fn((branch) => branch === 'main'),
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      refreshPermissions: vi.fn(),
      isSuperAdmin: vi.fn(() => false),
      isAuthenticated: true
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isSameBranch('main')).toBe(true);
    expect(result.current.isSameBranch('north')).toBe(false);
  });
});
