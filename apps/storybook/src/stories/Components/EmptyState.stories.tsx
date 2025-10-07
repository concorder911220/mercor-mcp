import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { EmptyState } from '@rialto/ui';
import { Stack, Button } from '@mui/material';
import { 
  Inbox, 
  Search, 
  FolderOpen, 
  CloudOff, 
  Add,
  Refresh 
} from '@mui/icons-material';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'minimal'],
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <Inbox />,
    title: 'No items found',
    description: 'There are no items to display at this time.',
  },
};

export const WithPrimaryAction: Story = {
  args: {
    icon: <FolderOpen />,
    title: 'No files uploaded',
    description: 'Upload your first file to get started.',
    primaryAction: {
      label: 'Upload File',
      onClick: () => console.log('Upload clicked'),
    },
  },
};

export const WithSecondaryAction: Story = {
  args: {
    icon: <Search />,
    title: 'No search results',
    description: 'Try adjusting your search criteria or browse all items.',
    primaryAction: {
      label: 'Clear Search',
      onClick: () => console.log('Clear search clicked'),
    },
    secondaryAction: {
      label: 'Browse All',
      onClick: () => console.log('Browse all clicked'),
    },
  },
};

export const WithCustomActions: Story = {
  args: {
    icon: <CloudOff />,
    title: 'Connection lost',
    description: 'Unable to load data. Check your internet connection.',
    actions: (
      <Stack direction="row" spacing={2}>
        <Button variant="contained" startIcon={<Refresh />}>
          Retry
        </Button>
        <Button variant="outlined">
          Go Offline
        </Button>
      </Stack>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    icon: <Inbox />,
    title: 'Empty inbox',
    description: 'All caught up!',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    icon: <FolderOpen />,
    title: 'Welcome to your workspace',
    description: 'Create your first project to get started with organizing your work.',
    primaryAction: {
      label: 'Create Project',
      onClick: () => console.log('Create project clicked'),
    },
  },
};

export const Minimal: Story = {
  args: {
    variant: 'minimal',
    icon: <Search />,
    title: 'No results found',
    description: 'Try a different search term.',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Coming Soon',
  },
};

export const WithImage: Story = {
  args: {
    image: (
      <div style={{ 
        width: 120, 
        height: 120, 
        backgroundColor: '#f0f0f0', 
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        color: '#666'
      }}>
        Custom Image
      </div>
    ),
    title: 'Custom illustration',
    description: 'You can use custom images or illustrations instead of icons.',
    primaryAction: {
      label: 'Get Started',
      onClick: () => console.log('Get started clicked'),
    },
  },
};

export const AllVariants = () => (
  <Stack spacing={4}>
    <Stack direction="row" spacing={3} sx={{ '> *': { flex: 1 } }}>
      <EmptyState
        size="sm"
        icon={<Inbox />}
        title="Small"
        description="Small empty state"
      />
      <EmptyState
        size="md"
        icon={<Inbox />}
        title="Medium"
        description="Medium empty state"
      />
      <EmptyState
        size="lg"
        icon={<Inbox />}
        title="Large"
        description="Large empty state"
      />
    </Stack>
    <Stack direction="row" spacing={3} sx={{ '> *': { flex: 1 } }}>
      <EmptyState
        variant="default"
        icon={<Search />}
        title="Default"
        description="With border and background"
      />
      <EmptyState
        variant="minimal"
        icon={<Search />}
        title="Minimal"
        description="Clean, no border"
      />
    </Stack>
  </Stack>
);