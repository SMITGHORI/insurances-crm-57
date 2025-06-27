
import React from 'react';
import { render, screen } from '@testing-library/react';
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

    render(
      <Protected module="clients" action="view">
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
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

    render(
      <Protected module="clients" action="edit">
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
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

    render(
      <Protected 
        module="clients" 
        action="delete" 
        fallback={<div data-testid="custom-fallback">Custom Fallback</div>}
      >
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
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

    render(
      <Protected module="clients" action="view" recordBranch="branch-b">
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(mockIsSameBranch).toHaveBeenCalledWith('branch-b');
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
