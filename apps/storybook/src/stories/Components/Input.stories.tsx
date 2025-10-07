import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Input } from '@rialto/ui';
import { Stack, Typography } from '@mui/material';
import { Search, Email, Lock } from '@mui/icons-material';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search'],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
  },
};

export const WithError: Story = {
  args: {
    error: true,
    placeholder: 'Invalid input',
    defaultValue: 'Invalid data',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
};

export const WithIcon: Story = {
  args: {
    placeholder: 'Search...',
    startAdornment: <Search sx={{ fontSize: 20, color: 'text.secondary' }} />,
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
    startAdornment: <Lock sx={{ fontSize: 20, color: 'text.secondary' }} />,
  },
};

export const EmailInput: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email',
    startAdornment: <Email sx={{ fontSize: 20, color: 'text.secondary' }} />,
  },
};

export const AllVariants = () => {
  const [value, setValue] = useState('');
  
  return (
    <Stack spacing={3} sx={{ width: 400 }}>
      <Typography variant="h6">Input Sizes</Typography>
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input (default)" />
      <Input size="lg" placeholder="Large input" />
      
      <Typography variant="h6">Input States</Typography>
      <Input placeholder="Normal input" />
      <Input placeholder="With value" defaultValue="Some text" />
      <Input error placeholder="Error state" />
      <Input disabled placeholder="Disabled input" />
      
      <Typography variant="h6">Input Types</Typography>
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="search" placeholder="Search input" />
      
      <Typography variant="h6">With Icons</Typography>
      <Input 
        placeholder="Search..." 
        startAdornment={<Search sx={{ fontSize: 20, color: 'text.secondary' }} />}
      />
      <Input 
        type="email"
        placeholder="Enter email" 
        startAdornment={<Email sx={{ fontSize: 20, color: 'text.secondary' }} />}
      />
      <Input 
        type="password"
        placeholder="Enter password" 
        startAdornment={<Lock sx={{ fontSize: 20, color: 'text.secondary' }} />}
      />
      
      <Typography variant="h6">Controlled Input</Typography>
      <Input 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type something..." 
      />
      <Typography variant="body2" color="text.secondary">
        Value: {value || '(empty)'}
      </Typography>
      
      <Typography variant="h6">Full Width</Typography>
      <Input fullWidth placeholder="Full width input" />
    </Stack>
  );
};