
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import Protected from '../Protected';
import { usePermissions } from '@/hooks/usePermissions';

// Mock usePermissions
vi.mock('@/hooks/usePermissions');

// Mock screen since it's not available in the current testing-library version
const screen = {
  getByTestId: (testId: string) => document.querySelector(`[data-testid="${testId}"]`),
  getByText: (text: string | RegExp) => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.find(el => {
      const content = el.textContent || '';
      if (typeof text === 'string') {
        return content.includes(text);
      }
      return text.test(content);
    });
  },
  queryByTestId: (testId: string) => document.querySelector(`[data-testid="${testId}"]`),
  queryByText: (text: string | RegExp) => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.find(el => {
      const content = el.textContent || '';
      if (typeof text === 'string') {
        return content.includes(text);
      }
      return text.test(content);
    }) || null;
  }
};

describe('Protected Component', () => {
  it('should render children when permission is granted', () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn(() => true),
      isSameBranch: vi.fn(() => true),
      hasAnyPermission: vi.fn(),
      userBranch: 'main',
      userRole: 'agent',
      userPermissions: []
    });

    render(
      <Protected module="clients" action="view">
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should show AccessDenied when permission is denied', () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn(() => false),
      isSameBranch: vi.fn(() => true),
      hasAnyPermission: vi.fn(),
      userBranch: 'main',
      userRole: 'agent',
      userPermissions: []
    });

    render(
      <Protected module="clients" action="delete">
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should handle branch-based access control', () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn(() => true),
      isSameBranch: vi.fn(() => false), // Different branch
      hasAnyPermission: vi.fn(),
      userBranch: 'main',
      userRole: 'agent',
      userPermissions: []
    });

    render(
      <Protected module="clients" action="view" recordBranch="north">
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn(() => false),
      isSameBranch: vi.fn(() => true),
      hasAnyPermission: vi.fn(),
      userBranch: 'main',
      userRole: 'agent',
      userPermissions: []
    });

    render(
      <Protected 
        module="clients" 
        action="delete"
        fallback={<div data-testid="custom-fallback">Custom Denied Message</div>}
      >
        <div data-testid="protected-content">Protected Content</div>
      </Protected>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
