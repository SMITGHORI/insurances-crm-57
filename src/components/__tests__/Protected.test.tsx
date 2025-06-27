
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Protected from '../Protected';
import * as usePermissionsHook from '../../hooks/usePermissions';

// Mock the usePermissions hook
const mockUsePermissions = vi.spyOn(usePermissionsHook, 'usePermissions');

describe('Protected Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user has required permission', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(true),
      isSameBranch: vi.fn().mockReturnValue(true),
      hasAnyPermission: vi.fn(),
      userBranch: 'main',
      userRole: 'admin',
      userPermissions: []
    });

    const { getByTestId } = render(
      <Protected module="clients" action="view">
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(getByTestId('protected-content')).toBeDefined();
  });

  it('renders AccessDenied when user lacks permission', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(false),
      isSameBranch: vi.fn().mockReturnValue(true),
      hasAnyPermission: vi.fn(),
      userBranch: 'main',
      userRole: 'user',
      userPermissions: []
    });

    const { getByText, queryByTestId } = render(
      <Protected module="clients" action="edit">
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(getByText('Access Denied')).toBeDefined();
    expect(queryByTestId('protected-content')).toBeNull();
  });

  it('renders custom fallback when provided', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(false),
      isSameBranch: vi.fn().mockReturnValue(true),
      hasAnyPermission: vi.fn(),
      userBranch: 'main',
      userRole: 'user',
      userPermissions: []
    });

    const { getByTestId, queryByTestId } = render(
      <Protected 
        module="clients" 
        action="delete" 
        fallback={<div data-testid="custom-fallback">Custom Fallback</div>}
      >
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(getByTestId('custom-fallback')).toBeDefined();
    expect(queryByTestId('protected-content')).toBeNull();
  });

  it('handles branch checking correctly', () => {
    const mockHasPermission = vi.fn().mockReturnValue(true);
    const mockIsSameBranch = vi.fn().mockReturnValue(false);

    mockUsePermissions.mockReturnValue({
      hasPermission: mockHasPermission,
      isSameBranch: mockIsSameBranch,
      hasAnyPermission: vi.fn(),
      userBranch: 'branch-a',
      userRole: 'user',
      userPermissions: []
    });

    const { getByText, queryByTestId } = render(
      <Protected module="clients" action="view" recordBranch="branch-b">
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(mockIsSameBranch).toHaveBeenCalledWith('branch-b');
    expect(getByText('Access Denied')).toBeDefined();
    expect(queryByTestId('protected-content')).toBeNull();
  });
});
