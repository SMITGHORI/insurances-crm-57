
import type { Meta, StoryObj } from '@storybook/react';
import { PermissionTooltip } from '../ui/permission-tooltip';
import { Button } from '../ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';

const meta: Meta<typeof PermissionTooltip> = {
  title: 'RBAC/PermissionTooltip',
  component: PermissionTooltip,
  parameters: {
    docs: {
      description: {
        component: 'Wraps buttons and interactive elements to show permission requirements when disabled. Provides clear feedback about why an action is unavailable.',
      },
    },
  },
  argTypes: {
    module: {
      control: 'select',
      options: ['clients', 'policies', 'claims', 'leads', 'agents'],
      description: 'The module being accessed'
    },
    action: {
      control: 'select', 
      options: ['view', 'create', 'edit', 'delete', 'approve'],
      description: 'The action being attempted'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the action is disabled due to permissions'
    },
    message: {
      control: 'text',
      description: 'Custom tooltip message'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EnabledButton: Story = {
  args: {
    module: 'clients',
    action: 'edit',
    disabled: false,
    children: (
      <Button variant="outline">
        <Edit className="h-4 w-4 mr-2" />
        Edit Client
      </Button>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'When user has permission, button renders normally without tooltip.'
      }
    }
  }
};

export const DisabledWithTooltip: Story = {
  args: {
    module: 'clients',
    action: 'delete',
    disabled: true,
    children: (
      <Button variant="destructive" disabled>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Client
      </Button>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled button with default permission tooltip. Shows lock icon and tooltip on hover.'
      }
    }
  }
};

export const CustomTooltipMessage: Story = {
  args: {
    module: 'policies',
    action: 'approve',
    disabled: true,
    message: 'Only senior underwriters can approve high-value policies',
    children: (
      <Button variant="default" disabled>
        Approve Policy
      </Button>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom tooltip message for specific business rules or role requirements.'
      }
    }
  }
};

export const CreateActionTooltip: Story = {
  args: {
    module: 'leads',
    action: 'create',
    disabled: true,
    children: (
      <Button variant="default" disabled>
        <Plus className="h-4 w-4 mr-2" />
        Create Lead
      </Button>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Create action disabled with permission tooltip. Common pattern for role-based create restrictions.'
      }
    }
  }
};
