import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Toolbar } from '@rialto/ui';
import { Box, Stack, Typography, Button, IconButton, Chip, Avatar, TextField, InputAdornment } from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Search, 
  FilterList, 
  MoreVert, 
  Refresh, 
  Download, 
  Upload,
  Settings,
  Menu,
  ArrowBack,
  Save,
  Share
} from '@mui/icons-material';

const meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    divider: {
      control: 'boolean',
    },
    spacing: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Default Toolbar',
    subtitle: 'Simple toolbar with title and subtitle',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    title: 'Elevated Toolbar',
    subtitle: 'Toolbar with shadow elevation',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    title: 'Outlined Toolbar',
    subtitle: 'Toolbar with border styling',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    title: 'Small Toolbar',
    subtitle: 'Compact toolbar size',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    title: 'Large Toolbar',
    subtitle: 'Spacious toolbar size',
  },
};

export const WithLeftContent: Story = {
  args: {
    title: 'Page Title',
    subtitle: 'Page description',
    leftContent: (
      <Stack direction="row" spacing={1}>
        <IconButton size="small">
          <Menu />
        </IconButton>
        <IconButton size="small">
          <ArrowBack />
        </IconButton>
      </Stack>
    ),
  },
};

export const WithRightContent: Story = {
  args: {
    title: 'Document Editor',
    subtitle: 'Last saved 2 minutes ago',
    rightContent: (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" startIcon={<Save />}>
          Save
        </Button>
        <Button size="small" variant="contained" startIcon={<Share />}>
          Share
        </Button>
        <IconButton size="small">
          <MoreVert />
        </IconButton>
      </Stack>
    ),
  },
};

export const WithCenterContent: Story = {
  args: {
    title: 'Dashboard',
    leftContent: (
      <IconButton size="small">
        <Menu />
      </IconButton>
    ),
    rightContent: (
      <Stack direction="row" spacing={1}>
        <IconButton size="small">
          <Settings />
        </IconButton>
        <Avatar sx={{ width: 32, height: 32 }}>JD</Avatar>
      </Stack>
    ),
    children: (
      <TextField
        size="small"
        placeholder="Search..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ width: 300 }}
      />
    ),
  },
};

export const WithDivider: Story = {
  args: {
    title: 'Project Management',
    subtitle: 'Manage your projects efficiently',
    divider: true,
    rightContent: (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="contained" startIcon={<Add />}>
          New Project
        </Button>
        <IconButton size="small">
          <FilterList />
        </IconButton>
      </Stack>
    ),
  },
};

export const ActionToolbar: Story = {
  args: {
    variant: 'outlined',
    leftContent: (
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          3 items selected
        </Typography>
        <Chip label="Bulk Actions" size="small" />
      </Stack>
    ),
    rightContent: (
      <Stack direction="row" spacing={0.5}>
        <IconButton size="small">
          <Edit />
        </IconButton>
        <IconButton size="small">
          <Download />
        </IconButton>
        <IconButton size="small" color="error">
          <Delete />
        </IconButton>
      </Stack>
    ),
  },
};

export const NoSpacing: Story = {
  args: {
    spacing: 'none',
    title: 'Compact Layout',
    leftContent: <IconButton size="small"><Menu /></IconButton>,
    rightContent: <IconButton size="small"><Settings /></IconButton>,
  },
};

export const LargeSpacing: Story = {
  args: {
    spacing: 'lg',
    title: 'Spacious Layout',
    subtitle: 'With generous spacing',
    leftContent: <IconButton><Menu /></IconButton>,
    rightContent: (
      <Stack direction="row" spacing={2}>
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained">Save</Button>
      </Stack>
    ),
  },
};

// Interactive examples
const FilterableListToolbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCount, setFilterCount] = useState(0);

  return (
    <Toolbar
      variant="outlined"
      title="User Management"
      subtitle={`${245 - filterCount} users ${filterCount > 0 ? `(${filterCount} filtered)` : ''}`}
      leftContent={
        <Stack direction="row" spacing={1}>
          <IconButton size="small">
            <Menu />
          </IconButton>
          <Chip 
            label={`${245 - filterCount} total`} 
            size="small" 
            color={filterCount > 0 ? "warning" : "default"}
          />
        </Stack>
      }
      rightContent={
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: 200 }}
          />
          <IconButton 
            size="small" 
            color={filterCount > 0 ? "primary" : "default"}
            onClick={() => setFilterCount(filterCount > 0 ? 0 : 12)}
          >
            <FilterList />
          </IconButton>
          <IconButton size="small">
            <Refresh />
          </IconButton>
          <Button size="small" variant="contained" startIcon={<Add />}>
            Add User
          </Button>
        </Stack>
      }
      divider
    />
  );
};

const DocumentEditorToolbar = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('2 minutes ago');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved('Just now');
    }, 1000);
  };

  return (
    <Toolbar
      variant="elevated"
      title="My Document.docx"
      subtitle={`Last saved ${lastSaved}`}
      leftContent={
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small">
            <ArrowBack />
          </IconButton>
        </Stack>
      }
      rightContent={
        <Stack direction="row" spacing={1}>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<Save />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button size="small" variant="contained" startIcon={<Share />}>
            Share
          </Button>
          <IconButton size="small">
            <Upload />
          </IconButton>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Stack>
      }
    />
  );
};

const DashboardToolbar = () => {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <Toolbar
      size="lg"
      title="Analytics Dashboard"
      subtitle="Real-time business metrics"
      leftContent={
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 40, height: 40 }}>AD</Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Welcome back
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Alex Davis
            </Typography>
          </Box>
        </Stack>
      }
      children={
        <Stack direction="row" spacing={2}>
          <Button 
            size="small" 
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button 
            size="small" 
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </Stack>
      }
      rightContent={
        <Stack direction="row" spacing={1}>
          <IconButton size="small">
            <Download />
          </IconButton>
          <IconButton size="small">
            <Refresh />
          </IconButton>
          <IconButton size="small">
            <Settings />
          </IconButton>
        </Stack>
      }
      divider
    />
  );
};

export const FilterableList = () => <FilterableListToolbar />;

export const DocumentEditor = () => <DocumentEditorToolbar />;

export const DashboardHeader = () => <DashboardToolbar />;

export const AllVariants = () => (
  <Stack spacing={4} sx={{ width: '100%' }}>
    <Typography variant="h5" component="h2">Toolbar Variants</Typography>
    
    <Stack spacing={2}>
      <Toolbar
        variant="default"
        title="Default Toolbar"
        subtitle="Standard toolbar styling"
        rightContent={<Button size="small">Action</Button>}
      />
      
      <Toolbar
        variant="elevated"
        title="Elevated Toolbar"
        subtitle="With shadow elevation"
        rightContent={<Button size="small">Action</Button>}
      />
      
      <Toolbar
        variant="outlined"
        title="Outlined Toolbar"
        subtitle="With border styling"
        rightContent={<Button size="small">Action</Button>}
      />
    </Stack>

    <Typography variant="h5" component="h2">Toolbar Sizes</Typography>
    
    <Stack spacing={2}>
      <Toolbar
        size="sm"
        title="Small Toolbar"
        subtitle="Compact size"
        leftContent={<IconButton size="small"><Menu /></IconButton>}
        rightContent={<Button size="small">Action</Button>}
      />
      
      <Toolbar
        size="md"
        title="Medium Toolbar"
        subtitle="Default size"
        leftContent={<IconButton size="small"><Menu /></IconButton>}
        rightContent={<Button size="small">Action</Button>}
      />
      
      <Toolbar
        size="lg"
        title="Large Toolbar"
        subtitle="Spacious size"
        leftContent={<IconButton><Menu /></IconButton>}
        rightContent={<Button>Action</Button>}
      />
    </Stack>

    <Typography variant="h5" component="h2">Interactive Examples</Typography>
    
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom>Filterable List Toolbar</Typography>
        <FilterableListToolbar />
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom>Document Editor Toolbar</Typography>
        <DocumentEditorToolbar />
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom>Dashboard Header</Typography>
        <DashboardToolbar />
      </Box>
    </Stack>

    <Typography variant="h5" component="h2">Toolbar Features</Typography>
    <Typography variant="body2" color="text.secondary">
      • Multiple visual variants (default, elevated, outlined)<br />
      • Size options (small, medium, large)<br />
      • Flexible content areas (left, center, right)<br />
      • Title and subtitle support<br />
      • Optional divider separator<br />
      • Customizable spacing<br />
      • Perfect for headers, action bars, and navigation<br />
      • Responsive design<br />
      • Consistent theming
    </Typography>
  </Stack>
);