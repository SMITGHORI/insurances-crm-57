
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Protected from '../Protected';
import ProtectedRoute from '../ProtectedRoute';
import ProtectedField from '../ProtectedField';
import ProtectedRow from '../ProtectedRow';

// Mock AuthContext with different user roles
const createMockAuthContext = (userRole: string, permissions: any[]) => ({
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: userRole,
    branch: 'main-branch',
    permissions
  },
  hasPermission: vi.fn((module, action) => {
    if (userRole === 'super_admin') return true;
    const modulePermissions = permissions.find(p => p.module === module);
    return modulePermissions ? modulePermissions.actions.includes(action) : false;
  }),
  isSameBranch: vi.fn((branch) => branch === 'main-branch' || userRole === 'super_admin'),
  hasAnyPermission: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
  refreshPermissions: vi.fn(),
  isSuperAdmin: vi.fn(() => userRole === 'super_admin'),
  isAuthenticated: true
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => createMockAuthContext('agent', [
    { module: 'clients', actions: ['view'] },
    { module: 'leads', actions: ['view', 'create'] }
  ]),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('RBAC Integration Tests', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('integrates Protected components correctly for limited permissions', () => {
    const { getByTestId, queryByTestId, getByText } = renderWithProviders(
      <div>
        <Protected module="clients" action="view">
          <div data-testid="view-clients">View Clients</div>
        </Protected>
        <Protected module="clients" action="edit">
          <div data-testid="edit-clients">Edit Clients</div>
        </Protected>
        <Protected module="leads" action="create">
          <div data-testid="create-leads">Create Leads</div>
        </Protected>
      </div>
    );

    // Should show view clients (has permission)
    expect(getByTestId('view-clients')).toBeDefined();
    
    // Should show create leads (has permission)
    expect(getByTestId('create-leads')).toBeDefined();
    
    // Should not show edit clients (no permission)
    expect(queryByTestId('edit-clients')).toBeNull();
    expect(getByText('Access Denied')).toBeDefined();
  });

  it('handles branch-based filtering correctly', () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <div>
        <ProtectedRow recordBranch="main-branch" module="clients">
          <div data-testid="same-branch-row">Same Branch Row</div>
        </ProtectedRow>
        <ProtectedRow recordBranch="different-branch" module="clients">
          <div data-testid="different-branch-row">Different Branch Row</div>
        </ProtectedRow>
      </div>
    );

    // Should show same branch row
    expect(getByTestId('same-branch-row')).toBeDefined();
    
    // Should not show different branch row
    expect(queryByTestId('different-branch-row')).toBeNull();
  });

  it('combines field-level and component-level protection', () => {
    const { getByTestId } = renderWithProviders(
      <Protected module="clients" action="view">
        <div>
          <ProtectedField module="clients" action="edit">
            <input data-testid="edit-field" type="text" />
          </ProtectedField>
          <ProtectedField module="clients" action="view">
            <input data-testid="view-field" type="text" />
          </ProtectedField>
        </div>
      </Protected>
    );

    const editField = getByTestId('edit-field');
    const viewField = getByTestId('view-field');

    // Edit field should be read-only (no edit permission)
    expect(editField.hasAttribute('readOnly')).toBe(true);
    expect(editField.hasAttribute('disabled')).toBe(true);

    // View field should be editable (has view permission)
    expect(viewField.hasAttribute('readOnly')).toBe(false);
    expect(viewField.hasAttribute('disabled')).toBe(false);
  });
});
