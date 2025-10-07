import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Drawer } from '@rialto/ui';
import { 
  Button, 
  Stack, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Box,
  TextField
} from '@mui/material';
import { Settings, Person, Notifications } from '@mui/icons-material';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    anchor: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
    width: {
      control: 'number',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    closable: {
      control: 'boolean',
    },
    dividers: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component
const DrawerExample = ({ children, ...props }: any) => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Drawer
      </Button>
      <Drawer
        {...props}
        open={open}
        onClose={() => setOpen(false)}
      >
        {children}
      </Drawer>
    </>
  );
};

export const Default: Story = {
  render: (args) => (
    <DrawerExample {...args}>
      <Typography variant="h6" gutterBottom>
        Drawer Content
      </Typography>
      <Typography variant="body1">
        This is the content inside the drawer. You can put any React components here.
      </Typography>
    </DrawerExample>
  ),
};

export const WithTitle: Story = {
  render: (args) => (
    <DrawerExample {...args} title="Settings" subtitle="Manage your preferences">
      <Stack spacing={2}>
        <Typography>
          Configure your application settings using the options below.
        </Typography>
        <Button variant="outlined" fullWidth>
          Profile Settings
        </Button>
        <Button variant="outlined" fullWidth>
          Notification Preferences
        </Button>
        <Button variant="outlined" fullWidth>
          Privacy Controls
        </Button>
      </Stack>
    </DrawerExample>
  ),
};

export const WithActions: Story = {
  render: (args) => (
    <DrawerExample 
      {...args}
      title="Edit Profile"
      actions={
        <Stack direction="row" spacing={2}>
          <Button variant="outlined">
            Cancel
          </Button>
          <Button variant="contained">
            Save Changes
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
        <TextField
          label="Full Name"
          defaultValue="John Doe"
          fullWidth
        />
        <TextField
          label="Email"
          defaultValue="john.doe@example.com"
          fullWidth
        />
        <TextField
          label="Bio"
          multiline
          rows={4}
          defaultValue="Software developer passionate about creating great user experiences."
          fullWidth
        />
      </Stack>
    </DrawerExample>
  ),
};

export const LeftAnchor: Story = {
  render: (args) => (
    <DrawerExample {...args} anchor="left" title="Navigation">
      <List>
        <ListItem>
          <Settings sx={{ mr: 2 }} />
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem>
          <Person sx={{ mr: 2 }} />
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem>
          <Notifications sx={{ mr: 2 }} />
          <ListItemText primary="Notifications" />
        </ListItem>
      </List>
    </DrawerExample>
  ),
};

export const Wide: Story = {
  render: (args) => (
    <DrawerExample {...args} width={600} title="Wide Drawer">
      <Typography gutterBottom>
        This drawer is wider than the default to accommodate more content.
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Column 1</Typography>
          <Typography>Content for the first column</Typography>
        </Box>
        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Column 2</Typography>
          <Typography>Content for the second column</Typography>
        </Box>
      </Box>
    </DrawerExample>
  ),
};

export const SmallPadding: Story = {
  render: (args) => (
    <DrawerExample {...args} padding="sm" title="Compact Drawer">
      <Typography>
        This drawer uses smaller padding for a more compact layout.
      </Typography>
    </DrawerExample>
  ),
};

export const LargePadding: Story = {
  render: (args) => (
    <DrawerExample {...args} padding="lg" title="Spacious Drawer">
      <Typography>
        This drawer uses larger padding for a more spacious feel.
      </Typography>
    </DrawerExample>
  ),
};

export const NoPadding: Story = {
  render: (args) => (
    <DrawerExample {...args} padding="none" title="No Padding">
      <Box sx={{ p: 0 }}>
        <Typography sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          Full width content without padding
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="List item 1" />
          </ListItem>
          <ListItem>
            <ListItemText primary="List item 2" />
          </ListItem>
        </List>
      </Box>
    </DrawerExample>
  ),
};

export const NoDividers: Story = {
  render: (args) => (
    <DrawerExample {...args} dividers={false} title="No Dividers">
      <Typography>
        This drawer doesn't have dividers between sections for a cleaner look.
      </Typography>
    </DrawerExample>
  ),
};

export const NotClosable: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Non-Closable Drawer
        </Button>
        <Drawer
          open={open}
          closable={false}
          title="Persistent Drawer"
          actions={
            <Button variant="contained" onClick={() => setOpen(false)}>
              Done
            </Button>
          }
        >
          <Typography>
            This drawer cannot be closed with the X button. Use the action button to close it.
          </Typography>
        </Drawer>
      </>
    );
  },
};