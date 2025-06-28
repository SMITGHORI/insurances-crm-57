
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuoteForm from './QuoteForm';
import { usePermissions } from '@/hooks/usePermissions';

// Mock dependencies
vi.mock('@/hooks/usePermissions');
vi.mock('@/hooks/useQuotes', () => ({
  useCreateQuote: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('QuoteForm Component', () => {
  const mockOnQuoteCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn(() => true),
      hasAnyPermission: vi.fn(() => true),
      isSameBranch: vi.fn(() => true),
      userBranch: 'main',
      userRole: 'agent',
      userPermissions: []
    });
  });

  it('should render form fields correctly', () => {
    render(
      <QuoteForm leadId="test-lead-123" onQuoteCreated={mockOnQuoteCreated} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/insurance carrier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/premium/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/coverage amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valid until/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <QuoteForm leadId="test-lead-123" onQuoteCreated={mockOnQuoteCreated} />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole('button', { name: /create quote/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/carrier is required/i)).toBeInTheDocument();
      expect(screen.getByText(/premium must be greater than 0/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button when user lacks permission', () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(() => false),
      isSameBranch: vi.fn(() => true),
      userBranch: 'main',
      userRole: 'agent',
      userPermissions: []
    });

    render(
      <QuoteForm leadId="test-lead-123" onQuoteCreated={mockOnQuoteCreated} />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole('button', { name: /create quote/i });
    expect(submitButton).toBeDisabled();
  });

  it('should calculate value score correctly', async () => {
    render(
      <QuoteForm leadId="test-lead-123" onQuoteCreated={mockOnQuoteCreated} />,
      { wrapper: createWrapper() }
    );

    const premiumInput = screen.getByLabelText(/premium/i);
    const coverageInput = screen.getByLabelText(/coverage amount/i);

    fireEvent.change(premiumInput, { target: { value: '1000' } });
    fireEvent.change(coverageInput, { target: { value: '100000' } });

    await waitFor(() => {
      expect(screen.getByText(/value score: 100/i)).toBeInTheDocument();
    });
  });

  it('should handle file upload correctly', async () => {
    render(
      <QuoteForm leadId="test-lead-123" onQuoteCreated={mockOnQuoteCreated} />,
      { wrapper: createWrapper() }
    );

    const fileInput = screen.getByLabelText(/quote document/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // File name should be displayed
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });
});
