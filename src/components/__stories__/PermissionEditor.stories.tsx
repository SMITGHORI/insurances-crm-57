
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import PermissionEditor from '../settings/PermissionEditor';

const meta: Meta<typeof PermissionEditor> = {
  title: 'RBAC/PermissionEditor',
  component: PermissionEditor,
  parameters: {
    docs: {
      description: {
        component: 'Permission Editor allows Super Admin users to edit role permissions through a module-action matrix interface.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6 max-w-6xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default permission editor showing the module-action matrix for role editing.'
      }
    }
  }
};

export const AgentRole: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Permission editor configured for Agent role with limited permissions.'
      }
    }
  }
};

export const ManagerRole: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Permission editor configured for Manager role with extended permissions.'
      }
    }
  }
};
