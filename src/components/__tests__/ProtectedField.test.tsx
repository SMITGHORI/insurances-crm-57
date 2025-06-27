
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProtectedField from '../ProtectedField';
import * as usePermissionsHook from '../../hooks/usePermissions';

const mockUsePermissions = vi.spyOn(usePermissionsHook, 'usePermissions');

describe('ProtectedField Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders editable field when user has permission', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(true),
      isSameBranch: vi.fn(),
      hasAnyPermission: vi.fn(),
      userBranch: 'main',
      userRole: 'admin',
      userPermissions: []
    });

    const { getByTestId, queryByText } = render(
      <ProtectedField module="clients" action="edit">
        <input data-testid="test-input" type="text" />
      </ProtectedField>
    );

    const input = getByTestId('test-input');
    expect(input).toBeDefined();
    expect(input.hasAttribute('readOnly')).toBe(false);
    expect(input.hasAttribute('disabled')).toBe(false);
  });

  it('renders read-only field when user lacks permission', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(false),
      isSameBranch: vi.fn(),
      hasAnyPermission: vi.fn(),
      userBranch: 'main',
      userRole: 'user',
      userPermissions: []
    });

    const { getByTestId } = render(
      <ProtectedField module="clients" action="edit">
        <input data-testid="test-input" type="text" />
      </ProtectedField>
    );

    const input = getByTestId('test-input');
    expect(input).toBeDefined();
    expect(input.hasAttribute('readOnly')).toBe(true);
    expect(input.hasAttribute('disabled')).toBe(true);
  });

  it('renders read-only for sensitive fields without sensitive permission', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn((module, action) => {
        if (action === 'edit') return true;
        if (action === 'edit_sensitive') return false;
        return false;
      }),
      isSameBranch: vi.fn(),
      hasAnyPermission: vi.fn(),
      userBranch: 'main',
      userRole: 'user',
      userPermissions: []
    });

    const { getByTestId } = render(
      <ProtectedField module="clients" action="edit" sensitive={true}>
        <input data-testid="test-input" type="text" />
      </ProtectedField>
    );

    const input = getByTestId('test-input');
    expect(input.hasAttribute('readOnly')).toBe(true);
    expect(input.hasAttribute('disabled')).toBe(true);
  });

  it('shows lock icon for read-only fields', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(false),
      isSameBranch: vi.fn(),
      hasAnyPermission: vi.fn(),
      userBranch: 'main',
      userRole: 'user',
      userPermissions: []
    });

    const { container } = render(
      <ProtectedField module="clients" action="edit" showLockIcon={true}>
        <input data-testid="test-input" type="text" />
      </ProtectedField>
    );

    expect(container.querySelector('svg')).toBeDefined();
  });
});
