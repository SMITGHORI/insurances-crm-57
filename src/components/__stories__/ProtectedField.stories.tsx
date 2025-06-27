
import type { Meta, StoryObj } from '@storybook/react';
import ProtectedField from '../ProtectedField';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const meta: Meta<typeof ProtectedField> = {
  title: 'RBAC/ProtectedField',
  component: ProtectedField,
  parameters: {
    docs: {
      description: {
        component: 'Makes form fields read-only based on user permissions. Supports sensitive fields that require special permissions.',
      },
    },
  },
  argTypes: {
    module: {
      control: 'select',
      options: ['clients', 'policies', 'claims'],
      description: 'The module being accessed'
    },
    action: {
      control: 'select',
      options: ['edit', 'edit_sensitive'],
      description: 'The action required to edit the field'
    },
    sensitive: {
      control: 'boolean',
      description: 'Whether this field contains sensitive data'
    },
    showLockIcon: {
      control: 'boolean',
      description: 'Whether to show lock icon on read-only fields'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EditableField: Story = {
  args: {
    module: 'clients',
    action: 'edit',
    showLockIcon: true,
    children: (
      <div>
        <label className="block text-sm font-medium mb-1">Client Name</label>
        <Input placeholder="Enter client name" />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'When user has edit permission, field is fully editable.'
      }
    }
  }
};

export const ReadOnlyField: Story = {
  args: {
    module: 'clients',
    action: 'edit',
    showLockIcon: true,
    children: (
      <div>
        <label className="block text-sm font-medium mb-1">Client Status</label>
        <Input value="Active" placeholder="Status" />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'When user lacks edit permission, field becomes read-only with lock icon.'
      }
    }
  }
};

export const SensitiveField: Story = {
  args: {
    module: 'clients',
    action: 'edit',
    sensitive: true,
    showLockIcon: true,
    children: (
      <div>
        <label className="block text-sm font-medium mb-1">
          PAN Number 
          <span className="text-red-500 ml-1">*</span>
        </label>
        <Input value="ABCDE1234F" placeholder="Enter PAN number" />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Sensitive fields require edit_sensitive permission. Read-only for users without special access.'
      }
    }
  }
};

export const TextAreaField: Story = {
  args: {
    module: 'claims',
    action: 'edit',
    showLockIcon: true,
    children: (
      <div>
        <label className="block text-sm font-medium mb-1">Investigation Notes</label>
        <Textarea 
          value="Initial assessment completed. Awaiting documentation."
          placeholder="Enter investigation notes"
          rows={4}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'ProtectedField works with any form input including textareas.'
      }
    }
  }
};

export const NoLockIcon: Story = {
  args: {
    module: 'policies',
    action: 'edit',
    showLockIcon: false,
    children: (
      <div>
        <label className="block text-sm font-medium mb-1">Policy Number</label>
        <Input value="POL-2024-001234" placeholder="Policy number" />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Read-only field without lock icon for cleaner presentation.'
      }
    }
  }
};
