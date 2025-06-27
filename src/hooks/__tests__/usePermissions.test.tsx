
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePermissions } from '../usePermissions';
import * as AuthContext from '../../contexts/AuthContext';

// Mock the AuthContext
const mockUseAuth = vi.spyOn(AuthContext, 'useAuth');

describe('usePermissions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct permissions for super admin', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'admin@test.com',
        name: 'Super Admin',
        role: 'super_admin',
        branch: 'main',
        permissions: []
      },
      hasPermission: vi.fn().mockReturnValue(true),
      hasAnyPermission: vi.fn().mockReturnValue(true),
      isSameBranch: vi.fn().mockReturnValue(true),
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      refreshPermissions: vi.fn(),
      isSuperAdmin: vi.fn().mockReturnValue(true),
      isAuthenticated: true
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('clients', 'edit')).toBe(true);
    expect(result.current.userRole).toBe('super_admin');
    expect(result.current.userBranch).toBe('main');
  });

  it('returns correct permissions for regular user', () => {
    const mockPermissions = [
      { module: 'clients', actions: ['view', 'create'] },
      { module: 'policies', actions: ['view'] }
    ];

    mockUseAuth.mockReturnValue({
      user: {
        id: '2',
        email: 'user@test.com',
        name: 'Regular User',
        role: 'agent',
        branch: 'branch-1',
        permissions: mockPermissions
      },
      hasPermission: vi.fn((module, action) => {
        const modulePermissions = mockPermissions.find(p => p.module === module);
        return modulePermissions ? modulePermissions.actions.includes(action) : false;
      }),
      hasAnyPermission: vi.fn(),
      isSameBranch: vi.fn((branch) => branch === 'branch-1'),
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      refreshPermissions: vi.fn(),
      isSuperAdmin: vi.fn().mockReturnValue(false),
      isAuthenticated: true
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('clients', 'view')).toBe(true);
    expect(result.current.hasPermission('clients', 'edit')).toBe(false);
    expect(result.current.hasPermission('policies', 'view')).toBe(true);
    expect(result.current.hasPermission('policies', 'edit')).toBe(false);
    expect(result.current.isSameBranch('branch-1')).toBe(true);
    expect(result.current.isSameBranch('branch-2')).toBe(false);
  });

  it('handles null user correctly', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      hasPermission: vi.fn().mockReturnValue(false),
      hasAnyPermission: vi.fn().mockReturnValue(false),
      isSameBranch: vi.fn().mockReturnValue(false),
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      refreshPermissions: vi.fn(),
      isSuperAdmin: vi.fn().mockReturnValue(false),
      isAuthenticated: false
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('clients', 'view')).toBe(false);
    expect(result.current.userBranch).toBeUndefined();
    expect(result.current.userRole).toBeUndefined();
    expect(result.current.userPermissions).toEqual([]);
  });
});
