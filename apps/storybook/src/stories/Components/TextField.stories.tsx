import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { TextField } from '@rialto/ui';
import { Box, Stack, Typography, InputAdornment } from '@mui/material';
import { Search, Email, Lock, Person, Visibility, VisibilityOff } from '@mui/icons-material';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'large', 'editable'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    error: {
      control: 'boolean',
    },
    success: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    multiline: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Default TextField',
    placeholder: 'Enter text...',
  },
};

export const Large: Story = {
  args: {
    variant: 'large',
    label: 'Large TextField',
    placeholder: 'Large variant for emphasis...',
  },
};

export const Editable: Story = {
  args: {
    variant: 'editable',
    value: 'Click to edit this text',
    placeholder: 'Click to edit...',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small TextField',
    placeholder: 'Small size...',
  },
};

export const MediumSize: Story = {
  args: {
    size: 'md',
    label: 'Medium TextField',
    placeholder: 'Medium size (default)...',
  },
};

export const LargeSize: Story = {
  args: {
    size: 'lg',
    label: 'Large TextField',
    placeholder: 'Large size...',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email...',
    helperText: 'We will never share your email with anyone else.',
  },
};

export const Error: Story = {
  args: {
    label: 'Email Address',
    value: 'invalid-email',
    error: true,
    helperText: 'Please enter a valid email address.',
  },
};

export const Success: Story = {
  args: {
    label: 'Email Address',
    value: 'user@example.com',
    success: true,
    helperText: 'Email address is valid.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    value: 'This field is disabled',
    disabled: true,
    helperText: 'This field cannot be edited.',
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your full name...',
    required: true,
    helperText: 'This field is required.',
  },
};

export const Multiline: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a detailed description...',
    multiline: true,
    rows: 4,
    helperText: 'Provide as much detail as possible.',
  },
};

export const WithStartAdornment: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    InputProps: {
      startAdornment: (
        <InputAdornment position="start">
          <Search />
        </InputAdornment>
      ),
    },
  },
};

export const WithEndAdornment: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter email...',
    InputProps: {
      endAdornment: (
        <InputAdornment position="end">
          <Email />
        </InputAdornment>
      ),
    },
  },
};

// Interactive examples
const PasswordFieldExample = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      label="Password"
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your password..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Lock />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
          </InputAdornment>
        ),
      }}
      helperText="Password must be at least 8 characters long"
    />
  );
};

const EditableTextExample = () => {
  const [value, setValue] = useState('Click to edit this text');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newValue: string) => {
    setValue(newValue);
    setIsEditing(false);
  };

  return (
    <Box>
      <TextField
        variant="editable"
        value={value}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        placeholder="Click to edit..."
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Current value: "{value}"
      </Typography>
    </Box>
  );
};

const FormExample = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = true;
    if (!formData.lastName.trim()) newErrors.lastName = true;
    if (!formData.email.includes('@')) newErrors.email = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Stack spacing={3} sx={{ minWidth: 400 }}>
      <Typography variant="h6">Contact Form</Typography>
      
      <Stack direction="row" spacing={2}>
        <TextField
          label="First Name"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          placeholder="Enter first name..."
          error={errors.firstName}
          helperText={errors.firstName ? 'First name is required' : ''}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange('lastName')}
          placeholder="Enter last name..."
          error={errors.lastName}
          helperText={errors.lastName ? 'Last name is required' : ''}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      
      <TextField
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        placeholder="Enter email address..."
        error={errors.email}
        helperText={errors.email ? 'Please enter a valid email address' : ''}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        label="Phone Number"
        value={formData.phone}
        onChange={handleChange('phone')}
        placeholder="Enter phone number..."
        helperText="Optional: Include country code if international"
      />
      
      <TextField
        label="Biography"
        multiline
        rows={4}
        value={formData.bio}
        onChange={handleChange('bio')}
        placeholder="Tell us about yourself..."
        helperText="Optional: Brief description about yourself"
      />
      
      <button
        type="button"
        onClick={validateForm}
        style={{
          padding: '12px 24px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Validate Form
      </button>
    </Stack>
  );
};

export const PasswordField = () => <PasswordFieldExample />;

export const EditableText = () => <EditableTextExample />;

export const FormValidation = () => <FormExample />;

export const AllVariants = () => (
  <Stack spacing={4} sx={{ width: '100%', maxWidth: 600 }}>
    <Typography variant="h5" component="h2">TextField Variants</Typography>
    
    <Stack spacing={2}>
      <TextField
        variant="default"
        label="Default Variant"
        placeholder="Standard input field..."
        helperText="Default styling for most use cases"
      />
      
      <TextField
        variant="large"
        label="Large Variant"
        placeholder="Emphasized input field..."
        helperText="Large variant for prominent form fields"
      />
      
      <TextField
        variant="editable"
        value="Editable text content"
        placeholder="Click to edit..."
      />
    </Stack>

    <Typography variant="h5" component="h2">TextField Sizes</Typography>
    
    <Stack spacing={2}>
      <TextField
        size="sm"
        label="Small"
        placeholder="Small size..."
        helperText="Compact size for tight layouts"
      />
      
      <TextField
        size="md"
        label="Medium (Default)"
        placeholder="Medium size..."
        helperText="Standard size for most forms"
      />
      
      <TextField
        size="lg"
        label="Large"
        placeholder="Large size..."
        helperText="Large size for important fields"
      />
    </Stack>

    <Typography variant="h5" component="h2">TextField States</Typography>
    
    <Stack spacing={2}>
      <TextField
        label="Normal State"
        placeholder="Enter text..."
        helperText="Standard input state"
      />
      
      <TextField
        label="Error State"
        value="invalid input"
        error
        helperText="This field has an error"
      />
      
      <TextField
        label="Success State"
        value="valid@email.com"
        success
        helperText="Input is valid"
      />
      
      <TextField
        label="Disabled State"
        value="Disabled field"
        disabled
        helperText="This field is not editable"
      />
    </Stack>

    <Typography variant="h5" component="h2">TextField with Adornments</Typography>
    
    <Stack spacing={2}>
      <TextField
        label="Search"
        placeholder="Search..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        label="Email"
        placeholder="Enter email..."
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Email />
            </InputAdornment>
          ),
        }}
      />
    </Stack>

    <Typography variant="h5" component="h2">Multiline TextField</Typography>
    
    <TextField
      label="Comments"
      multiline
      rows={4}
      placeholder="Enter your comments..."
      helperText="Please provide detailed feedback"
    />

    <Typography variant="h5" component="h2">Interactive Examples</Typography>
    
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom>Password Field</Typography>
        <PasswordFieldExample />
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom>Editable Text</Typography>
        <EditableTextExample />
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom>Form Validation</Typography>
        <FormExample />
      </Box>
    </Stack>

    <Typography variant="h5" component="h2">TextField Features</Typography>
    <Typography variant="body2" color="text.secondary">
      • Multiple variants (default, large, editable)<br />
      • Size options (small, medium, large)<br />
      • Error and success states<br />
      • Start and end adornments<br />
      • Multiline support<br />
      • Helper text and validation<br />
      • Editable inline text mode<br />
      • Accessible labeling<br />
      • Consistent theming
    </Typography>
  </Stack>
);