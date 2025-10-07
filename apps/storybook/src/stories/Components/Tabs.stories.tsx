import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Tabs, TabItem } from '@rialto/ui';
import { Box, Stack, Typography, List, ListItem, ListItemText, Card, CardContent } from '@mui/material';
import { 
  Home, 
  Person, 
  Settings, 
  Notifications, 
  Security,
  Dashboard,
  Analytics,
  Help
} from '@mui/icons-material';

// Sample tab data
const basicTabs: TabItem[] = [
  { id: 'tab1', label: 'First Tab', content: <Typography>Content for the first tab</Typography> },
  { id: 'tab2', label: 'Second Tab', content: <Typography>Content for the second tab</Typography> },
  { id: 'tab3', label: 'Third Tab', content: <Typography>Content for the third tab</Typography> },
];

const tabsWithIcons: TabItem[] = [
  { 
    id: 'home', 
    label: 'Home', 
    icon: <Home />,
    content: (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Home Dashboard</Typography>
        <Typography>Welcome to your dashboard. Here you can see an overview of all your activities.</Typography>
      </Box>
    )
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: <Person />,
    content: (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>User Profile</Typography>
        <Typography>Manage your personal information and preferences.</Typography>
      </Box>
    )
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: <Settings />,
    content: (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Application Settings</Typography>
        <Typography>Configure your application preferences and account settings.</Typography>
      </Box>
    )
  },
];

const tabsWithBadges: TabItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: <Dashboard />,
    content: <Typography sx={{ p: 2 }}>Dashboard overview content</Typography>
  },
  { 
    id: 'notifications', 
    label: 'Notifications', 
    icon: <Notifications />,
    badge: 3,
    content: (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Notifications (3)</Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="New message received" secondary="2 minutes ago" />
          </ListItem>
          <ListItem>
            <ListItemText primary="System update available" secondary="1 hour ago" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Weekly report ready" secondary="2 hours ago" />
          </ListItem>
        </List>
      </Box>
    )
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: <Analytics />,
    badge: 'new',
    content: <Typography sx={{ p: 2 }}>Analytics dashboard with new features</Typography>
  },
  { 
    id: 'help', 
    label: 'Help', 
    icon: <Help />,
    content: <Typography sx={{ p: 2 }}>Help and support documentation</Typography>
  },
];

const disabledTabs: TabItem[] = [
  { id: 'available', label: 'Available', content: <Typography sx={{ p: 2 }}>This tab is available</Typography> },
  { id: 'disabled', label: 'Disabled Tab', disabled: true, content: <Typography sx={{ p: 2 }}>This content is not accessible</Typography> },
  { id: 'premium', label: 'Premium Feature', disabled: true, content: <Typography sx={{ p: 2 }}>Premium content</Typography> },
  { id: 'normal', label: 'Normal Tab', content: <Typography sx={{ p: 2 }}>Another available tab</Typography> },
];

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'scrollable', 'fullWidth'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    showContent: {
      control: 'boolean',
    },
    divider: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tabs: basicTabs,
  },
};

export const WithIcons: Story = {
  args: {
    tabs: tabsWithIcons,
  },
};

export const WithBadges: Story = {
  args: {
    tabs: tabsWithBadges,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    tabs: basicTabs,
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    tabs: tabsWithIcons,
  },
};

export const FullWidth: Story = {
  args: {
    variant: 'fullWidth',
    tabs: basicTabs,
  },
};

export const Scrollable: Story = {
  args: {
    variant: 'scrollable',
    tabs: [
      ...basicTabs,
      { id: 'tab4', label: 'Fourth Tab', content: <Typography>Content 4</Typography> },
      { id: 'tab5', label: 'Fifth Tab', content: <Typography>Content 5</Typography> },
      { id: 'tab6', label: 'Sixth Tab', content: <Typography>Content 6</Typography> },
      { id: 'tab7', label: 'Seventh Tab', content: <Typography>Content 7</Typography> },
    ],
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    tabs: tabsWithIcons,
  },
};

export const WithoutContent: Story = {
  args: {
    tabs: basicTabs,
    showContent: false,
  },
};

export const WithoutDivider: Story = {
  args: {
    tabs: tabsWithIcons,
    divider: false,
  },
};

export const WithDisabledTabs: Story = {
  args: {
    tabs: disabledTabs,
  },
};

// Interactive examples
const ControlledTabsExample = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        tabs={tabsWithIcons}
        value={activeTab}
        onChange={setActiveTab}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Currently active tab: {activeTab}
      </Typography>
    </Box>
  );
};

const DynamicTabsExample = () => {
  const [tabs, setTabs] = useState(tabsWithBadges.slice(0, 2));
  const [activeTab, setActiveTab] = useState('dashboard');

  const addTab = () => {
    const newTabIndex = tabs.length;
    const newTab: TabItem = {
      id: `dynamic-${newTabIndex}`,
      label: `Tab ${newTabIndex + 1}`,
      content: <Typography sx={{ p: 2 }}>Dynamic tab content {newTabIndex + 1}</Typography>
    };
    setTabs(prev => [...prev, newTab]);
  };

  const removeTab = () => {
    if (tabs.length > 1) {
      setTabs(prev => prev.slice(0, -1));
      if (activeTab === tabs[tabs.length - 1].id) {
        setActiveTab(tabs[tabs.length - 2].id);
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <button onClick={addTab}>Add Tab</button>
        <button onClick={removeTab} disabled={tabs.length <= 1}>Remove Tab</button>
      </Stack>
      <Tabs
        tabs={tabs}
        value={activeTab}
        onChange={setActiveTab}
      />
    </Box>
  );
};

const VerticalTabsExample = () => {
  const [activeTab, setActiveTab] = useState('security');

  const verticalTabs: TabItem[] = [
    {
      id: 'general',
      label: 'General',
      icon: <Settings />,
      content: (
        <Card sx={{ minHeight: 200 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>General Settings</Typography>
            <Typography>Configure general application preferences.</Typography>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Security />,
      badge: 2,
      content: (
        <Card sx={{ minHeight: 200 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Security Settings</Typography>
            <Typography>Manage your security settings and authentication options.</Typography>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Notifications />,
      content: (
        <Card sx={{ minHeight: 200 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
            <Typography>Control how and when you receive notifications.</Typography>
          </CardContent>
        </Card>
      )
    },
  ];

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <Tabs
        orientation="vertical"
        tabs={verticalTabs}
        value={activeTab}
        onChange={setActiveTab}
      />
    </Box>
  );
};

export const ControlledTabs = () => <ControlledTabsExample />;

export const DynamicTabs = () => <DynamicTabsExample />;

export const VerticalTabsStory = () => <VerticalTabsExample />;

export const AllVariants = () => (
  <Stack spacing={4} sx={{ width: '100%' }}>
    <Typography variant="h5" component="h2">Tab Variants</Typography>
    
    <Box>
      <Typography variant="h6" gutterBottom>Standard Tabs</Typography>
      <Tabs tabs={basicTabs} showContent={false} />
    </Box>
    
    <Box>
      <Typography variant="h6" gutterBottom>Full Width</Typography>
      <Tabs variant="fullWidth" tabs={basicTabs} showContent={false} />
    </Box>

    <Typography variant="h5" component="h2">Tab Sizes</Typography>
    
    <Box>
      <Typography variant="h6" gutterBottom>Small</Typography>
      <Tabs size="sm" tabs={tabsWithIcons} showContent={false} />
    </Box>
    
    <Box>
      <Typography variant="h6" gutterBottom>Medium (Default)</Typography>
      <Tabs size="md" tabs={tabsWithIcons} showContent={false} />
    </Box>
    
    <Box>
      <Typography variant="h6" gutterBottom>Large</Typography>
      <Tabs size="lg" tabs={tabsWithIcons} showContent={false} />
    </Box>

    <Typography variant="h5" component="h2">Tabs with Features</Typography>
    
    <Box>
      <Typography variant="h6" gutterBottom>With Icons and Badges</Typography>
      <Tabs tabs={tabsWithBadges} />
    </Box>
    
    <Box>
      <Typography variant="h6" gutterBottom>With Disabled Tabs</Typography>
      <Tabs tabs={disabledTabs} />
    </Box>

    <Typography variant="h5" component="h2">Interactive Examples</Typography>
    
    <Box>
      <Typography variant="h6" gutterBottom>Controlled Tabs</Typography>
      <ControlledTabsExample />
    </Box>
    
    <Box>
      <Typography variant="h6" gutterBottom>Dynamic Tabs</Typography>
      <DynamicTabsExample />
    </Box>
    
    <Box>
      <Typography variant="h6" gutterBottom>Vertical Orientation</Typography>
      <VerticalTabsExample />
    </Box>

    <Typography variant="h5" component="h2">Tab Features</Typography>
    <Typography variant="body2" color="text.secondary">
      • Icons and text labels<br />
      • Badge indicators for notifications<br />
      • Horizontal and vertical orientations<br />
      • Multiple size variants<br />
      • Disabled tab states<br />
      • Scrollable tabs for overflow<br />
      • Full width distribution<br />
      • Customizable content panels<br />
      • Accessible keyboard navigation
    </Typography>
  </Stack>
);