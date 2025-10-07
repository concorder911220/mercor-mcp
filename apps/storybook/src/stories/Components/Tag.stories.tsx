import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Tag } from '@rialto/ui';
import { Stack } from '@mui/material';
import { Star, Person, Settings } from '@mui/icons-material';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    removable: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Tag',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Tag',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Tag',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Tag',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning Tag',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Error Tag',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Tag',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Tag',
  },
};

export const Removable: Story = {
  args: {
    removable: true,
    children: 'Removable Tag',
    onRemove: () => console.log('Tag removed'),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Tag',
  },
};

export const WithLeftIcon: Story = {
  args: {
    leftIcon: <Star />,
    children: 'Starred',
  },
};

export const WithRightIcon: Story = {
  args: {
    rightIcon: <Person />,
    children: 'User Tag',
  },
};

export const Clickable: Story = {
  args: {
    children: 'Clickable Tag',
    onClick: () => console.log('Tag clicked'),
  },
};

export const AllVariants = () => (
  <Stack spacing={3}>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Tag variant="default">Default</Tag>
      <Tag variant="primary">Primary</Tag>
      <Tag variant="secondary">Secondary</Tag>
      <Tag variant="success">Success</Tag>
      <Tag variant="warning">Warning</Tag>
      <Tag variant="error">Error</Tag>
    </Stack>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
      <Tag size="lg">Large</Tag>
    </Stack>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Tag removable onRemove={() => console.log('Removed')}>Removable</Tag>
      <Tag disabled>Disabled</Tag>
      <Tag onClick={() => console.log('Clicked')}>Clickable</Tag>
    </Stack>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Tag leftIcon={<Star />}>With Icon</Tag>
      <Tag rightIcon={<Settings />}>Settings</Tag>
      <Tag leftIcon={<Person />} removable onRemove={() => console.log('User removed')}>
        User Tag
      </Tag>
    </Stack>
  </Stack>
);