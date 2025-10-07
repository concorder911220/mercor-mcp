import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Chip } from '@rialto/ui';
import { Stack, Typography, Box } from '@mui/material';
import { Check, Close, Star, Person, CalendarMonth } from '@mui/icons-material';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
    },
    clickable: {
      control: 'boolean',
    },
    onDelete: {
      action: 'deleted',
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Default Chip',
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary',
    color: 'primary',
  },
};

export const Success: Story = {
  args: {
    label: 'Success',
    color: 'success',
  },
};

export const Warning: Story = {
  args: {
    label: 'Warning',
    color: 'warning',
  },
};

export const Error: Story = {
  args: {
    label: 'Error',
    color: 'error',
  },
};

export const Small: Story = {
  args: {
    label: 'Small Chip',
    size: 'sm',
  },
};

export const Outlined: Story = {
  args: {
    label: 'Outlined',
    variant: 'outlined',
    color: 'primary',
  },
};

export const Clickable: Story = {
  args: {
    label: 'Clickable',
    clickable: true,
    onClick: () => alert('Chip clicked!'),
  },
};

export const Deletable: Story = {
  args: {
    label: 'Deletable',
    onDelete: () => alert('Chip deleted!'),
  },
};

export const WithIcon: Story = {
  args: {
    label: 'With Icon',
    icon: <Star />,
  },
};

export const AllVariants = () => (
  <Stack spacing={3}>
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Colors</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label="Default" />
        <Chip label="Primary" color="primary" />
        <Chip label="Secondary" color="secondary" />
        <Chip label="Success" color="success" />
        <Chip label="Warning" color="warning" />
        <Chip label="Error" color="error" />
        <Chip label="Info" color="info" />
      </Stack>
    </Box>
    
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Outlined</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label="Default" variant="outlined" />
        <Chip label="Primary" color="primary" variant="outlined" />
        <Chip label="Secondary" color="secondary" variant="outlined" />
        <Chip label="Success" color="success" variant="outlined" />
        <Chip label="Warning" color="warning" variant="outlined" />
        <Chip label="Error" color="error" variant="outlined" />
        <Chip label="Info" color="info" variant="outlined" />
      </Stack>
    </Box>
    
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Sizes</Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label="Small" size="sm" color="primary" />
        <Chip label="Medium (Default)" size="md" color="primary" />
      </Stack>
    </Box>
    
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>With Icons</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label="Approved" color="success" icon={<Check />} />
        <Chip label="Rejected" color="error" icon={<Close />} />
        <Chip label="Featured" color="warning" icon={<Star />} />
        <Chip label="John Doe" icon={<Person />} />
        <Chip label="Due Today" color="info" icon={<CalendarMonth />} />
      </Stack>
    </Box>
    
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Interactive</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label="Clickable" clickable onClick={() => alert('Clicked!')} />
        <Chip label="Deletable" onDelete={() => alert('Deleted!')} />
        <Chip 
          label="Both" 
          color="primary"
          clickable 
          onClick={() => alert('Clicked!')}
          onDelete={() => alert('Deleted!')} 
        />
      </Stack>
    </Box>
    
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Use Cases</Typography>
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>Tags</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label="React" size="sm" />
            <Chip label="TypeScript" size="sm" />
            <Chip label="Material-UI" size="sm" />
            <Chip label="Storybook" size="sm" />
          </Stack>
        </Box>
        
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>Status</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label="Active" color="success" />
            <Chip label="Pending" color="warning" />
            <Chip label="Archived" color="default" />
          </Stack>
        </Box>
        
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>Filters</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label="Last 7 days" onDelete={() => {}} />
            <Chip label="High Priority" color="error" onDelete={() => {}} />
            <Chip label="Assigned to me" onDelete={() => {}} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  </Stack>
);