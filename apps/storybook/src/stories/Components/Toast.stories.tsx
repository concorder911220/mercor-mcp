import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Toast, ToastProvider, useToast } from '@rialto/ui';
import { Box, Stack, Typography, Button } from '@mui/material';
import { Refresh, Download, Upload } from '@mui/icons-material';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'filled', 'outlined'],
    },
    severity: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    closable: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
    message: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

const ToastTemplate = (args: any) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Show Toast
      </Button>
      <Toast
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={args.autoHideDuration || 6000}
      />
    </>
  );
};

export const Success: Story = {
  render: ToastTemplate,
  args: {
    severity: 'success',
    message: 'Operation completed successfully!',
  },
};

export const Info: Story = {
  render: ToastTemplate,
  args: {
    severity: 'info',
    message: 'Here is some important information.',
  },
};

export const Warning: Story = {
  render: ToastTemplate,
  args: {
    severity: 'warning',
    message: 'Please review this warning message.',
  },
};

export const Error: Story = {
  render: ToastTemplate,
  args: {
    severity: 'error',
    message: 'An error occurred while processing your request.',
  },
};

export const WithTitle: Story = {
  render: ToastTemplate,
  args: {
    severity: 'success',
    title: 'Success!',
    message: 'Your changes have been saved successfully.',
  },
};

export const Filled: Story = {
  render: ToastTemplate,
  args: {
    variant: 'filled',
    severity: 'success',
    title: 'Upload Complete',
    message: 'Your file has been uploaded successfully.',
  },
};

export const Outlined: Story = {
  render: ToastTemplate,
  args: {
    variant: 'outlined',
    severity: 'info',
    title: 'New Update Available',
    message: 'A new version of the app is available for download.',
  },
};

export const Small: Story = {
  render: ToastTemplate,
  args: {
    size: 'sm',
    severity: 'info',
    message: 'Small toast notification',
  },
};

export const Large: Story = {
  render: ToastTemplate,
  args: {
    size: 'lg',
    severity: 'warning',
    title: 'Important Notice',
    message: 'This is a large toast notification with more prominent styling.',
  },
};

export const WithActions: Story = {
  render: ToastTemplate,
  args: {
    severity: 'info',
    title: 'Update Available',
    message: 'A new version is ready to install.',
    actions: (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="contained" color="inherit">
          Update Now
        </Button>
        <Button size="small" variant="outlined" color="inherit">
          Later
        </Button>
      </Stack>
    ),
  },
};

export const NotClosable: Story = {
  render: ToastTemplate,
  args: {
    severity: 'error',
    title: 'System Error',
    message: 'A critical error occurred. Please contact support.',
    closable: false,
    autoHideDuration: null, // Won't auto-hide
  },
};

export const CustomIcon: Story = {
  render: ToastTemplate,
  args: {
    severity: 'info',
    title: 'Download Started',
    message: 'Your download will begin shortly.',
    icon: <Download />,
  },
};

export const NoIcon: Story = {
  render: ToastTemplate,
  args: {
    severity: 'success',
    message: 'Action completed without icon',
    icon: false,
  },
};

// Toast Provider Examples
const ToastProviderExample = () => {
  const { showToast } = useToast();

  const showSuccessToast = () => {
    showToast({
      severity: 'success',
      title: 'Success!',
      message: 'Operation completed successfully.',
      autoHideDuration: 4000,
    });
  };

  const showErrorToast = () => {
    showToast({
      severity: 'error',
      title: 'Error Occurred',
      message: 'Something went wrong. Please try again.',
      autoHideDuration: 6000,
    });
  };

  const showInfoToast = () => {
    showToast({
      severity: 'info',
      title: 'Information',
      message: 'Here is some useful information for you.',
      actions: (
        <Button size="small" variant="outlined" color="inherit">
          Learn More
        </Button>
      ),
    });
  };

  const showWarningToast = () => {
    showToast({
      severity: 'warning',
      title: 'Warning',
      message: 'Please check your input before proceeding.',
      variant: 'filled',
    });
  };

  return (
    <Stack spacing={2} direction="row" flexWrap="wrap">
      <Button variant="contained" color="success" onClick={showSuccessToast}>
        Show Success
      </Button>
      <Button variant="contained" color="error" onClick={showErrorToast}>
        Show Error
      </Button>
      <Button variant="contained" color="info" onClick={showInfoToast}>
        Show Info
      </Button>
      <Button variant="contained" color="warning" onClick={showWarningToast}>
        Show Warning
      </Button>
    </Stack>
  );
};

const ActionToastsExample = () => {
  const { showToast } = useToast();

  const showUploadToast = () => {
    showToast({
      severity: 'info',
      title: 'File Upload',
      message: 'Uploading your file...',
      icon: <Upload />,
      closable: false,
      autoHideDuration: 3000,
    });
  };

  const showDownloadToast = () => {
    showToast({
      severity: 'success',
      title: 'Download Ready',
      message: 'Your file is ready for download.',
      icon: <Download />,
      actions: (
        <Button size="small" variant="contained" color="inherit">
          Download Now
        </Button>
      ),
    });
  };

  const showRefreshToast = () => {
    showToast({
      severity: 'warning',
      title: 'Data Outdated',
      message: 'Your data might be outdated. Would you like to refresh?',
      icon: <Refresh />,
      variant: 'outlined',
      actions: (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" color="inherit">
            Refresh
          </Button>
          <Button size="small" variant="outlined" color="inherit">
            Ignore
          </Button>
        </Stack>
      ),
    });
  };

  return (
    <Stack spacing={2} direction="row" flexWrap="wrap">
      <Button variant="outlined" onClick={showUploadToast}>
        Start Upload
      </Button>
      <Button variant="outlined" onClick={showDownloadToast}>
        Ready Download
      </Button>
      <Button variant="outlined" onClick={showRefreshToast}>
        Show Refresh Warning
      </Button>
    </Stack>
  );
};

// Wrap the examples with ToastProvider
const ToastProviderExampleWrapped = () => (
  <ToastProvider>
    <ToastProviderExample />
  </ToastProvider>
);

const ActionToastsExampleWrapped = () => (
  <ToastProvider>
    <ActionToastsExample />
  </ToastProvider>
);

export const ProviderExample = () => <ToastProviderExampleWrapped />;

export const ActionToasts = () => <ActionToastsExampleWrapped />;

export const AllVariants = () => (
  <ToastProvider>
    <Stack spacing={4} sx={{ width: '100%', maxWidth: 800 }}>
      <Typography variant="h5" component="h2">Toast Severities</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Click any button below to see the toast in action:
      </Typography>
      
      <ToastProviderExample />

      <Typography variant="h5" component="h2">Toast Variants</Typography>
      
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" gutterBottom>Standard (Default)</Typography>
          <Button
            variant="outlined"
            onClick={() => {
              // This would show a standard toast
            }}
          >
            Show Standard Toast
          </Button>
        </Box>
        
        <Box>
          <Typography variant="h6" gutterBottom>Filled</Typography>
          <Button
            variant="outlined"
            onClick={() => {
              // This would show a filled toast
            }}
          >
            Show Filled Toast
          </Button>
        </Box>
        
        <Box>
          <Typography variant="h6" gutterBottom>Outlined</Typography>
          <Button
            variant="outlined"
            onClick={() => {
              // This would show an outlined toast
            }}
          >
            Show Outlined Toast
          </Button>
        </Box>
      </Stack>

      <Typography variant="h5" component="h2">Toast Sizes</Typography>
      
      <Stack direction="row" spacing={2}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            // Small toast
          }}
        >
          Small Toast
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            // Medium toast
          }}
        >
          Medium Toast
        </Button>
        <Button
          size="large"
          variant="outlined"
          onClick={() => {
            // Large toast
          }}
        >
          Large Toast
        </Button>
      </Stack>

      <Typography variant="h5" component="h2">Interactive Examples</Typography>
      
      <Box>
        <Typography variant="h6" gutterBottom>Action Toasts</Typography>
        <ActionToastsExample />
      </Box>

      <Typography variant="h5" component="h2">Toast Features</Typography>
      <Typography variant="body2" color="text.secondary">
        • Multiple severity levels (success, info, warning, error)<br />
        • Three visual variants (standard, filled, outlined)<br />
        • Size options (small, medium, large)<br />
        • Optional titles and custom icons<br />
        • Action buttons support<br />
        • Auto-dismiss with configurable timing<br />
        • Toast provider for global state management<br />
        • Closable and non-closable options<br />
        • Accessible with proper ARIA attributes
      </Typography>

      <Typography variant="h5" component="h2">Usage with Provider</Typography>
      <Typography variant="body2" color="text.secondary">
        Wrap your application with ToastProvider and use the useToast hook to show toasts from anywhere in your component tree. This provides a clean API for managing toast notifications globally.
      </Typography>
    </Stack>
  </ToastProvider>
);