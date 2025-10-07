import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Panel } from '@rialto/ui';
import { Box, Stack, Typography, List, ListItem, ListItemText, Button, Chip } from '@mui/material';
import { Settings, Add, Refresh, FilterList } from '@mui/icons-material';

const meta = {
  title: 'Components/Panel',
  component: Panel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'filled'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    collapsible: {
      control: 'boolean',
    },
    collapsed: {
      control: 'boolean',
    },
    closable: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Default Panel',
    children: (
      <Typography>
        This is a default panel with standard styling. Panels are perfect for organizing 
        content into collapsible sections.
      </Typography>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    title: 'Outlined Panel',
    children: (
      <Typography>
        This panel uses an outlined variant with a border instead of a shadow.
      </Typography>
    ),
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    title: 'Filled Panel',
    children: (
      <Typography>
        This panel uses a filled variant with a background color for subtle emphasis.
      </Typography>
    ),
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Panel Title',
    subtitle: 'This subtitle provides additional context',
    children: (
      <Typography>
        This panel includes both a title and subtitle for better content organization.
      </Typography>
    ),
  },
};

export const WithHeaderAction: Story = {
  args: {
    title: 'Panel with Action',
    subtitle: 'Action button in header',
    headerAction: <Settings />,
    children: (
      <Typography>
        This panel includes an action button in the header for quick access to related functionality.
      </Typography>
    ),
  },
};

export const Collapsible: Story = {
  args: {
    title: 'Collapsible Panel',
    subtitle: 'Click the expand/collapse button',
    collapsible: true,
    children: (
      <Stack spacing={2}>
        <Typography>
          This panel can be collapsed and expanded using the button in the header.
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Item 1" secondary="First item description" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Item 2" secondary="Second item description" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Item 3" secondary="Third item description" />
          </ListItem>
        </List>
      </Stack>
    ),
  },
};

export const CollapsedByDefault: Story = {
  args: {
    title: 'Initially Collapsed',
    subtitle: 'This panel starts collapsed',
    collapsible: true,
    collapsed: true,
    children: (
      <Typography>
        This content is hidden by default because the panel starts in a collapsed state.
      </Typography>
    ),
  },
};

export const Closable: Story = {
  args: {
    title: 'Closable Panel',
    subtitle: 'Has a close button',
    closable: true,
    children: (
      <Typography>
        This panel includes a close button in the header. Click it to close the panel.
      </Typography>
    ),
  },
};

export const CollapsibleAndClosable: Story = {
  args: {
    title: 'Full Featured Panel',
    subtitle: 'Both collapsible and closable',
    collapsible: true,
    closable: true,
    headerAction: <Refresh />,
    children: (
      <Typography>
        This panel demonstrates all header features: title, subtitle, action button, 
        collapse toggle, and close button.
      </Typography>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    title: 'Small Padding',
    padding: 'sm',
    children: (
      <Typography>
        This panel uses small padding for a more compact layout.
      </Typography>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    title: 'Large Padding',
    padding: 'lg',
    children: (
      <Typography>
        This panel uses large padding for a more spacious layout.
      </Typography>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    title: 'No Padding',
    padding: 'none',
    children: (
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography>
          This panel has no internal padding, allowing for custom spacing control.
        </Typography>
      </Box>
    ),
  },
};

// Interactive examples
const CollapsiblePanelExample = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Panel
      title="Interactive Panel"
      subtitle="Controlled collapse state"
      collapsible
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
    >
      <Stack spacing={2}>
        <Typography>
          This panel's collapse state is controlled by the parent component.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current state: {collapsed ? 'Collapsed' : 'Expanded'}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setCollapsed(!collapsed)}
        >
          Toggle from Content
        </Button>
      </Stack>
    </Panel>
  );
};

const DashboardExample = () => {
  const [panels, setPanels] = useState({
    overview: { collapsed: false, closed: false },
    tasks: { collapsed: true, closed: false },
    settings: { collapsed: false, closed: false },
  });

  const handleTogglePanel = (panelId: string) => {
    setPanels(prev => ({
      ...prev,
      [panelId]: {
        ...prev[panelId as keyof typeof prev],
        collapsed: !prev[panelId as keyof typeof prev].collapsed
      }
    }));
  };

  const handleClosePanel = (panelId: string) => {
    setPanels(prev => ({
      ...prev,
      [panelId]: {
        ...prev[panelId as keyof typeof prev],
        closed: true
      }
    }));
  };

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 600 }}>
      {!panels.overview.closed && (
        <Panel
          variant="outlined"
          title="Project Overview"
          subtitle="Current project statistics"
          collapsible
          closable
          collapsed={panels.overview.collapsed}
          onToggleCollapse={() => handleTogglePanel('overview')}
          onClose={() => handleClosePanel('overview')}
          headerAction={<FilterList />}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <Chip label="Active Projects: 12" color="primary" />
              <Chip label="Pending: 3" color="warning" />
              <Chip label="Completed: 45" color="success" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Last updated: 2 minutes ago
            </Typography>
          </Stack>
        </Panel>
      )}

      {!panels.tasks.closed && (
        <Panel
          title="Recent Tasks"
          subtitle="Latest activity"
          collapsible
          closable
          collapsed={panels.tasks.collapsed}
          onToggleCollapse={() => handleTogglePanel('tasks')}
          onClose={() => handleClosePanel('tasks')}
          headerAction={<Add />}
        >
          <List dense>
            {['Review design mockups', 'Update documentation', 'Test new features'].map((task, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={task}
                  secondary={`${index + 1} hour${index === 0 ? '' : 's'} ago`}
                />
              </ListItem>
            ))}
          </List>
        </Panel>
      )}

      {!panels.settings.closed && (
        <Panel
          variant="filled"
          title="Quick Settings"
          subtitle="Frequently used options"
          collapsible
          closable
          collapsed={panels.settings.collapsed}
          onToggleCollapse={() => handleTogglePanel('settings')}
          onClose={() => handleClosePanel('settings')}
          headerAction={<Settings />}
        >
          <Stack spacing={2}>
            <Typography variant="body2">
              Customize your workspace with these quick settings.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined">Theme</Button>
              <Button size="small" variant="outlined">Language</Button>
              <Button size="small" variant="outlined">Notifications</Button>
            </Stack>
          </Stack>
        </Panel>
      )}
    </Stack>
  );
};

export const InteractivePanel = () => <CollapsiblePanelExample />;

export const DashboardPanels = () => <DashboardExample />;

export const AllVariants = () => (
  <Stack spacing={4} sx={{ width: '100%', maxWidth: 800 }}>
    <Typography variant="h5" component="h2">Panel Variants</Typography>
    <Stack spacing={2}>
      <Panel variant="default" title="Default Panel" padding="sm">
        <Typography variant="body2">Standard panel with shadow</Typography>
      </Panel>
      
      <Panel variant="outlined" title="Outlined Panel" padding="sm">
        <Typography variant="body2">Panel with border styling</Typography>
      </Panel>
      
      <Panel variant="filled" title="Filled Panel" padding="sm">
        <Typography variant="body2">Panel with background fill</Typography>
      </Panel>
    </Stack>

    <Typography variant="h5" component="h2">Panel Features</Typography>
    <Stack spacing={2}>
      <Panel
        title="Full Featured Panel"
        subtitle="All options demonstrated"
        collapsible
        closable
        headerAction={<Settings />}
      >
        <Typography>
          This panel showcases all available features including title, subtitle, 
          header action, collapse functionality, and close button.
        </Typography>
      </Panel>
    </Stack>

    <Typography variant="h5" component="h2">Interactive Examples</Typography>
    <CollapsiblePanelExample />

    <Typography variant="h5" component="h2">Dashboard Layout</Typography>
    <DashboardExample />
  </Stack>
);