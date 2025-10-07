import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '@rialto/ui';
import { Box, Stack } from '@mui/material';
import { Add, Edit, Delete, Save, ArrowForward } from '@mui/icons-material';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Add sx={{ fontSize: 20, mr: 0.5 }} />
        Add Item
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    children: <Save />,
    size: 'md',
  },
};

export const AllVariants = () => (
  <Stack spacing={3}>
    <Stack direction="row" spacing={2}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </Stack>
    <Stack direction="row" spacing={2}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </Stack>
    <Stack direction="row" spacing={2}>
      <Button variant="primary" disabled>Disabled Primary</Button>
      <Button variant="secondary" disabled>Disabled Secondary</Button>
      <Button variant="ghost" disabled>Disabled Ghost</Button>
    </Stack>
    <Stack direction="row" spacing={2}>
      <Button variant="primary">
        <Edit sx={{ fontSize: 20, mr: 0.5 }} />
        Edit
      </Button>
      <Button variant="secondary">
        Continue
        <ArrowForward sx={{ fontSize: 20, ml: 0.5 }} />
      </Button>
      <Button variant="danger">
        <Delete sx={{ fontSize: 20, mr: 0.5 }} />
        Delete
      </Button>
    </Stack>
    <Box sx={{ width: 300 }}>
      <Button fullWidth>Full Width Button</Button>
    </Box>
  </Stack>
);