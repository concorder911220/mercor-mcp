import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Modal } from '@rialto/ui';
import { Box, Stack, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'fullscreen'],
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
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const ModalTemplate = (args: any) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Modal
      </Button>
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const Default: Story = {
  render: ModalTemplate,
  args: {
    title: 'Default Modal',
    children: (
      <Typography>
        This is a default modal with standard sizing and padding. It provides a clean, 
        accessible overlay for presenting content or capturing user input.
      </Typography>
    ),
  },
};

export const WithSubtitle: Story = {
  render: ModalTemplate,
  args: {
    title: 'Modal Title',
    subtitle: 'This subtitle provides additional context',
    children: (
      <Typography>
        This modal includes both a title and subtitle in the header section. 
        The subtitle appears in a lighter color and smaller text.
      </Typography>
    ),
  },
};

export const WithActions: Story = {
  render: ModalTemplate,
  args: {
    title: 'Confirm Action',
    subtitle: 'Are you sure you want to proceed?',
    children: (
      <Typography>
        This action cannot be undone. Please review the details before confirming.
      </Typography>
    ),
    actions: (
      <Stack direction="row" spacing={2}>
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained">Confirm</Button>
      </Stack>
    ),
  },
};

export const ExtraSmall: Story = {
  render: ModalTemplate,
  args: {
    size: 'xs',
    title: 'Extra Small Modal',
    children: (
      <Typography>
        This is an extra small modal, perfect for simple confirmations or brief messages.
      </Typography>
    ),
  },
};

export const Large: Story = {
  render: ModalTemplate,
  args: {
    size: 'lg',
    title: 'Large Modal',
    children: (
      <Typography>
        This is a large modal that provides more space for complex content, forms, 
        or detailed information displays.
      </Typography>
    ),
  },
};

export const Fullscreen: Story = {
  render: ModalTemplate,
  args: {
    size: 'fullscreen',
    title: 'Fullscreen Modal',
    subtitle: 'Takes up the entire viewport',
    children: (
      <Box sx={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" align="center">
          This modal takes up the full screen, ideal for immersive experiences 
          or mobile-first designs.
        </Typography>
      </Box>
    ),
  },
};

export const NotClosable: Story = {
  render: ModalTemplate,
  args: {
    title: 'Non-Closable Modal',
    subtitle: 'Must use action buttons to close',
    closable: false,
    children: (
      <Typography>
        This modal doesn't have a close button. Users must interact with the 
        action buttons to dismiss it.
      </Typography>
    ),
    actions: (
      <Button variant="contained">Got It</Button>
    ),
  },
};

export const NoDividers: Story = {
  render: ModalTemplate,
  args: {
    title: 'No Dividers',
    dividers: false,
    children: (
      <Typography>
        This modal doesn't use dividers between sections, creating a more seamless appearance.
      </Typography>
    ),
    actions: (
      <Button variant="contained">Close</Button>
    ),
  },
};

export const SmallPadding: Story = {
  render: ModalTemplate,
  args: {
    title: 'Small Padding',
    padding: 'sm',
    children: (
      <Typography>
        This modal uses small padding for a more compact layout.
      </Typography>
    ),
  },
};

export const NoPadding: Story = {
  render: ModalTemplate,
  args: {
    title: 'Custom Padding',
    padding: 'none',
    children: (
      <Box sx={{ p: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography>
          This modal has no built-in padding, allowing for complete control over spacing and layout.
        </Typography>
      </Box>
    ),
  },
};

// Complex form example
const FormModal = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    description: '',
  });

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Form Modal
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add New User"
        subtitle="Fill out the form to create a new user account"
        size="md"
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Create User
            </Button>
          </Stack>
        }
      >
        <Stack spacing={3}>
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
          />
          
          <TextField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            fullWidth
            required
          />
          
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            >
              <MenuItem value="admin">Administrator</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
            placeholder="Optional description or notes about the user..."
          />
        </Stack>
      </Modal>
    </>
  );
};

// Confirmation modal example
const ConfirmationModal = () => {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    console.log('Item deleted');
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" color="error" onClick={() => setOpen(true)}>
        Delete Item
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm Deletion"
        subtitle="This action cannot be undone"
        size="sm"
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Stack>
        }
      >
        <Typography>
          Are you sure you want to delete this item? This action is permanent and cannot be reversed.
        </Typography>
      </Modal>
    </>
  );
};

export const FormExample = () => <FormModal />;

export const ConfirmationExample = () => <ConfirmationModal />;

export const AllVariants = () => (
  <Stack spacing={4}>
    <Typography variant="h5" component="h2">Modal Sizes</Typography>
    <Stack direction="row" spacing={2} flexWrap="wrap">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Box key={size}>
          <Button 
            variant="outlined" 
            onClick={() => {
              const modal = document.createElement('div');
              document.body.appendChild(modal);
              // This would open a modal in a real scenario
            }}
          >
            {size.toUpperCase()} Modal
          </Button>
        </Box>
      ))}
      <Button variant="outlined" color="primary">
        Fullscreen Modal
      </Button>
    </Stack>

    <Typography variant="h5" component="h2">Interactive Examples</Typography>
    <Stack direction="row" spacing={2} flexWrap="wrap">
      <FormModal />
      <ConfirmationModal />
    </Stack>

    <Typography variant="h5" component="h2">Modal Features</Typography>
    <Typography variant="body2" color="text.secondary">
      • Flexible sizing from extra small to fullscreen<br />
      • Customizable padding and spacing<br />
      • Optional header with title and subtitle<br />
      • Action buttons in the footer<br />
      • Accessible with proper focus management<br />
      • Responsive design for mobile devices<br />
      • Optional close button and escape key support
    </Typography>
  </Stack>
);