
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Protected from '../Protected';
import { Button } from '../ui/button';

// Mock usePermissions hook for stories
const mockUsePermissions = (hasPermission: boolean) => ({
  hasPermission: () => hasPermission,
  isSameBranch: () => true,
  hasAnyPermission: () => hasPermission,
  userBranch: 'main',
  userRole: hasPermission ? 'admin' : 'viewer',
  userPermissions: []
});

// Mock the hook
jest.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => mockUsePermissions(true)
}));

const meta: Meta<typeof Protected> = {
  title: 'RBAC/Protected',
  component: Protected,
  parameters: {
    docs: {
      description: {
        component: 'Wraps components to show/hide based on user permissions. Used throughout the app to control access to UI elements.',
      },
    },
  },
  argTypes: {
    module: {
      control: 'select',
      options: ['clients', 'policies', 'claims', 'leads', 'agents', 'reports'],
      description: 'The module to check permission for'
    },
    action: {
      control: 'select',
      options: ['view', 'create', 'edit', 'delete', 'export'],
      description: 'The action to check permission for'
    },
    branchCheck: {
      control: 'boolean',
      description: 'Whether to perform branch-based access control'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllowedAccess: Story = {
  args: {
    module: 'clients',
    action: 'view',
    children: (
      <Button variant="default">
        View Clients (Allowed)
      </Button>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'When user has the required permission, the component renders normally.'
      }
    }
  }
};

export const DeniedAccess: Story = {
  args: {
    module: 'clients',
    action: 'delete', 
    children: (
      <Button variant="destructive">
        Delete Client (Denied)
      </Button>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'When user lacks permission, shows AccessDenied component by default.'
      }
    }
  }
};

export const CustomFallback: Story = {
  args: {
    module: 'policies',
    action: 'create',
    fallback: (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p className="text-yellow-800">Custom fallback: You need policy creation rights.</p>
      </div>
    ),
    children: (
      <Button variant="default">
        Create Policy
      </Button>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'You can provide a custom fallback component instead of the default AccessDenied.'
      }
    }
  }
};

export const BranchBasedAccess: Story = {
  args: {
    module: 'clients',
    action: 'edit',
    recordBranch: 'branch-a',
    branchCheck: true,
    children: (
      <Button variant="outline">
        Edit Client (Branch Restricted)
      </Button>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Branch-based access control - only users from the same branch can access the resource.'
      }
    }
  }
};
