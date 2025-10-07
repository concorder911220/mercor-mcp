import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { IconButton } from '@rialto/ui';
import { Box, Stack, Typography } from '@mui/material';
import { 
  Edit, 
  Delete, 
  Share, 
  Bookmark, 
  Favorite,
  Save,
  Settings,
  Visibility,
  VisibilityOff,
  ThumbUp,
  Download,
  Print,
  MoreVert
} from '@mui/icons-material';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    tooltip: {
      control: 'text',
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Edit />,
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: <Edit />,
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: <Settings />,
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: <Share />,
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: <Delete />,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: <Edit />,
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: <Edit />,
  },
};

export const WithTooltip: Story = {
  args: {
    tooltip: 'Edit item',
    children: <Edit />,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: <Save />,
  },
};

export const LoadingWithTooltip: Story = {
  args: {
    loading: true,
    tooltip: 'Saving changes...',
    children: <Save />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: <Edit />,
  },
};

export const DisabledWithTooltip: Story = {
  args: {
    disabled: true,
    tooltip: 'Edit is not available',
    children: <Edit />,
  },
};

// Interactive examples
const ToggleVisibilityExample = () => {
  const [visible, setVisible] = useState(false);

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography>Password visibility:</Typography>
      <IconButton
        tooltip={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <VisibilityOff /> : <Visibility />}
      </IconButton>
      <Typography variant="body2" color="text.secondary">
        {visible ? 'Password is visible' : 'Password is hidden'}
      </Typography>
    </Stack>
  );
};

const FavoriteExample = () => {
  const [favorited, setFavorited] = useState(false);

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography>Add to favorites:</Typography>
      <IconButton
        variant={favorited ? 'primary' : 'default'}
        tooltip={favorited ? 'Remove from favorites' : 'Add to favorites'}
        onClick={() => setFavorited(!favorited)}
      >
        <Favorite />
      </IconButton>
      <Typography variant="body2" color="text.secondary">
        {favorited ? 'Added to favorites' : 'Not in favorites'}
      </Typography>
    </Stack>
  );
};

const LoadingExample = () => {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography>Save data:</Typography>
      <IconButton
        variant="primary"
        loading={loading}
        disabled={loading}
        tooltip={loading ? 'Saving...' : 'Save changes'}
        onClick={handleSave}
      >
        <Save />
      </IconButton>
      <Typography variant="body2" color="text.secondary">
        {loading ? 'Saving in progress...' : 'Ready to save'}
      </Typography>
    </Stack>
  );
};

export const ToggleVisibility = () => <ToggleVisibilityExample />;

export const FavoriteToggle = () => <FavoriteExample />;

export const LoadingState = () => <LoadingExample />;

export const AllVariants = () => (
  <Stack spacing={4}>
    <Typography variant="h5" component="h2">Icon Button Variants</Typography>
    <Stack direction="row" spacing={2} alignItems="center">
      <Box textAlign="center">
        <IconButton variant="default" tooltip="Default">
          <Edit />
        </IconButton>
        <Typography variant="caption" display="block">Default</Typography>
      </Box>
      
      <Box textAlign="center">
        <IconButton variant="primary" tooltip="Primary">
          <Save />
        </IconButton>
        <Typography variant="caption" display="block">Primary</Typography>
      </Box>
      
      <Box textAlign="center">
        <IconButton variant="secondary" tooltip="Secondary">
          <Settings />
        </IconButton>
        <Typography variant="caption" display="block">Secondary</Typography>
      </Box>
      
      <Box textAlign="center">
        <IconButton variant="ghost" tooltip="Ghost">
          <Share />
        </IconButton>
        <Typography variant="caption" display="block">Ghost</Typography>
      </Box>
      
      <Box textAlign="center">
        <IconButton variant="danger" tooltip="Danger">
          <Delete />
        </IconButton>
        <Typography variant="caption" display="block">Danger</Typography>
      </Box>
    </Stack>

    <Typography variant="h5" component="h2">Icon Button Sizes</Typography>
    <Stack direction="row" spacing={3} alignItems="center">
      <Box textAlign="center">
        <IconButton size="sm" tooltip="Small">
          <Edit />
        </IconButton>
        <Typography variant="caption" display="block">Small</Typography>
      </Box>
      
      <Box textAlign="center">
        <IconButton size="md" tooltip="Medium">
          <Edit />
        </IconButton>
        <Typography variant="caption" display="block">Medium</Typography>
      </Box>
      
      <Box textAlign="center">
        <IconButton size="lg" tooltip="Large">
          <Edit />
        </IconButton>
        <Typography variant="caption" display="block">Large</Typography>
      </Box>
    </Stack>

    <Typography variant="h5" component="h2">Icon Button States</Typography>
    <Stack direction="row" spacing={2} alignItems="center">
      <IconButton tooltip="Normal state">
        <Edit />
      </IconButton>
      
      <IconButton loading tooltip="Loading state">
        <Save />
      </IconButton>
      
      <IconButton disabled tooltip="Disabled state">
        <Edit />
      </IconButton>
    </Stack>

    <Typography variant="h5" component="h2">Common Use Cases</Typography>
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <IconButton variant="primary" tooltip="Save" size="sm">
          <Save />
        </IconButton>
        <IconButton tooltip="Edit" size="sm">
          <Edit />
        </IconButton>
        <IconButton tooltip="Share" size="sm">
          <Share />
        </IconButton>
        <IconButton tooltip="Bookmark" size="sm">
          <Bookmark />
        </IconButton>
        <IconButton variant="danger" tooltip="Delete" size="sm">
          <Delete />
        </IconButton>
        <IconButton tooltip="More options" size="sm">
          <MoreVert />
        </IconButton>
      </Stack>
      
      <Typography variant="caption" color="text.secondary">
        Toolbar with various action buttons
      </Typography>
    </Stack>

    <Typography variant="h5" component="h2">Interactive Examples</Typography>
    <Stack spacing={3}>
      <ToggleVisibilityExample />
      <FavoriteExample />
      <LoadingExample />
    </Stack>

    <Typography variant="h5" component="h2">Icon Button Groups</Typography>
    <Stack direction="row" spacing={1} divider={<Typography color="text.disabled">|</Typography>}>
      <IconButton tooltip="Like" size="sm">
        <ThumbUp />
      </IconButton>
      <IconButton tooltip="Download" size="sm">
        <Download />
      </IconButton>
      <IconButton tooltip="Print" size="sm">
        <Print />
      </IconButton>
      <IconButton tooltip="Share" size="sm">
        <Share />
      </IconButton>
    </Stack>
  </Stack>
);