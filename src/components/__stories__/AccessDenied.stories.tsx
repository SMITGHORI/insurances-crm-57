
import type { Meta, StoryObj } from '@storybook/react';
import AccessDenied from '../AccessDenied';

const meta: Meta<typeof AccessDenied> = {
  title: 'RBAC/AccessDenied',
  component: AccessDenied,
  parameters: {
    docs: {
      description: {
        component: 'Displays when user attempts to access unauthorized resources. Used as fallback in Protected components and ProtectedRoute.',
      },
    },
  },
  argTypes: {
    message: {
      control: 'text',
      description: 'Custom access denied message'
    },
    showHomeButton: {
      control: 'boolean',
      description: 'Whether to show the "Return Home" button'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default access denied message with return home button.'
      }
    }
  }
};

export const CustomMessage: Story = {
  args: {
    message: 'You need administrator privileges to access this feature.'
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom message for specific permission requirements.'
      }
    }
  }
};

export const NoHomeButton: Story = {
  args: {
    message: 'This action is not available for your role.',
    showHomeButton: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Access denied without navigation button - useful for inline contexts.'
      }
    }
  }
};

export const PermissionSpecific: Story = {
  args: {
    message: 'You need clients:delete permission to remove client records.'
  },
  parameters: {
    docs: {
      description: {
        story: 'Permission-specific message explaining exactly what permission is required.'
      }
    }
  }
};
