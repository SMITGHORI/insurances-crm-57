
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AccessDenied from '../AccessDenied';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AccessDenied Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders default message and home button', () => {
    const { getByText } = renderWithRouter(<AccessDenied />);

    expect(getByText('Access Denied')).toBeDefined();
    expect(getByText("You don't have permission to access this resource.")).toBeDefined();
    expect(getByText('Return to Dashboard')).toBeDefined();
  });

  it('renders custom message when provided', () => {
    const customMessage = 'Custom access denied message';
    const { getByText } = renderWithRouter(<AccessDenied message={customMessage} />);

    expect(getByText(customMessage)).toBeDefined();
  });

  it('hides home button when showHomeButton is false', () => {
    const { queryByText } = renderWithRouter(<AccessDenied showHomeButton={false} />);

    expect(queryByText('Return to Dashboard')).toBeNull();
  });

  it('calls custom onHomeClick when provided', async () => {
    const user = userEvent.setup();
    const mockOnHomeClick = vi.fn();
    const { getByText } = renderWithRouter(
      <AccessDenied onHomeClick={mockOnHomeClick} />
    );

    await user.click(getByText('Return to Dashboard'));
    expect(mockOnHomeClick).toHaveBeenCalled();
  });

  it('navigates to dashboard when home button clicked', async () => {
    const user = userEvent.setup();
    const { getByText } = renderWithRouter(<AccessDenied />);

    await user.click(getByText('Return to Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
