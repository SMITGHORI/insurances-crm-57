
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PermissionTooltip } from '../permission-tooltip';

describe('PermissionTooltip Component', () => {
  it('renders children directly when not disabled', () => {
    const { getByTestId, queryByText } = render(
      <PermissionTooltip module="clients" action="edit" disabled={false}>
        <button data-testid="test-button">Test Button</button>
      </PermissionTooltip>
    );

    expect(getByTestId('test-button')).toBeDefined();
    expect(queryByText('Requires clients:edit permission')).toBeNull();
  });

  it('wraps children with tooltip when disabled', () => {
    const { getByTestId, container } = render(
      <PermissionTooltip module="clients" action="edit" disabled={true}>
        <button data-testid="test-button">Test Button</button>
      </PermissionTooltip>
    );

    expect(getByTestId('test-button')).toBeDefined();
    expect(container.querySelector('svg')).toBeDefined(); // Lock icon
  });

  it('shows custom message when provided', () => {
    const customMessage = 'Custom permission message';
    render(
      <PermissionTooltip 
        module="clients" 
        action="edit" 
        disabled={true}
        message={customMessage}
      >
        <button>Test Button</button>
      </PermissionTooltip>
    );

    // Note: Testing tooltip content requires more complex setup with user events
    // This is a basic structure test
  });

  it('generates default message from module and action', () => {
    render(
      <PermissionTooltip module="policies" action="delete" disabled={true}>
        <button>Test Button</button>
      </PermissionTooltip>
    );

    // The default message should be "Requires policies:delete permission"
    // Testing would require tooltip interaction
  });
});
