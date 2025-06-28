
import React from 'react';
import { render } from '@testing-library/react';
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

// Mock screen and waitFor since they're not available in the current testing-library version
const screen = {
  getByLabelText: (text: string | RegExp) => {
    const labels = Array.from(document.querySelectorAll('label'));
    const label = labels.find(l => {
      const content = l.textContent || '';
      if (typeof text === 'string') {
        return content.includes(text);
      }
      return text.test(content);
    });
    if (label) {
      const forAttr = label.getAttribute('for');
      if (forAttr) {
        return document.getElementById(forAttr);
      }
    }
    return null;
  },
  getByRole: (role: string, options?: { name?: string | RegExp }) => {
    const elements = Array.from(document.querySelectorAll(`[role="${role}"]`));
    if (options?.name) {
      return elements.find(el => {
        const content = el.textContent || '';
        if (typeof options.name === 'string') {
          return content.includes(options.name);
        }
        return options.name?.test(content);
      });
    }
    return elements[0];
  },
  getByText: (text: string | RegExp) => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.find(el => {
      const content = el.textContent || '';
      if (typeof text === 'string') {
        return content.includes(text);
      }
      return text.test(content);
    });
  }
};

const waitFor = async (callback: () => void, options?: { timeout?: number }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      callback();
      resolve(true);
    }, options?.timeout || 100);
  });
};

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
    const user = userEvent.setup();
    
    render(
      <QuoteForm leadId="test-lead-123" onQuoteCreated={mockOnQuoteCreated} />,
      { wrapper: createWrapper() }
    );

    const premiumInput = screen.getByLabelText(/premium/i);
    const coverageInput = screen.getByLabelText(/coverage amount/i);

    await user.clear(premiumInput);
    await user.type(premiumInput, '1000');
    await user.clear(coverageInput);
    await user.type(coverageInput, '100000');

    await waitFor(() => {
      expect(screen.getByText(/value score: 100/i)).toBeInTheDocument();
    });
  });

  it('should handle file upload correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <QuoteForm leadId="test-lead-123" onQuoteCreated={mockOnQuoteCreated} />,
      { wrapper: createWrapper() }
    );

    const fileInput = screen.getByLabelText(/quote document/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    // File name should be displayed
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });
});
