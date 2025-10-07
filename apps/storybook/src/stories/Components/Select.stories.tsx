import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Select, SelectOption } from '@rialto/ui';
import { Box, Stack, Typography } from '@mui/material';
import { 
  Home, 
  Work, 
  School, 
  LocationOn,
  Language,
  Palette,
  Security,
  Notifications
} from '@mui/icons-material';

// Sample data
const basicOptions: SelectOption[] = [
  { value: 'option1', label: 'First Option' },
  { value: 'option2', label: 'Second Option' },
  { value: 'option3', label: 'Third Option' },
  { value: 'option4', label: 'Fourth Option' },
];

const categoryOptions: SelectOption[] = [
  { value: 'home', label: 'Home', icon: <Home /> },
  { value: 'work', label: 'Work', icon: <Work /> },
  { value: 'school', label: 'School', icon: <School /> },
  { value: 'other', label: 'Other', icon: <LocationOn /> },
];

const priorityOptions: SelectOption[] = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'critical', label: 'Critical', disabled: true },
];

const languageOptions: SelectOption[] = [
  { value: 'en', label: 'English', icon: <Language /> },
  { value: 'es', label: 'Spanish', icon: <Language /> },
  { value: 'fr', label: 'French', icon: <Language /> },
  { value: 'de', label: 'German', icon: <Language /> },
  { value: 'it', label: 'Italian', icon: <Language /> },
];

const settingsOptions: SelectOption[] = [
  { value: 'theme', label: 'Theme Settings', icon: <Palette /> },
  { value: 'security', label: 'Security', icon: <Security /> },
  { value: 'notifications', label: 'Notifications', icon: <Notifications /> },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    clearable: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
    success: {
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
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: basicOptions,
    placeholder: 'Choose an option...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Select Option',
    options: basicOptions,
    placeholder: 'Choose an option...',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Priority Level',
    options: priorityOptions,
    helperText: 'Select the appropriate priority level for this task',
    placeholder: 'Choose priority...',
  },
};

export const WithIcons: Story = {
  args: {
    label: 'Category',
    options: categoryOptions,
    placeholder: 'Select category...',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small Select',
    options: basicOptions,
    placeholder: 'Small size...',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Large Select',
    options: basicOptions,
    placeholder: 'Large size...',
  },
};

export const Clearable: Story = {
  args: {
    label: 'Clearable Select',
    options: basicOptions,
    clearable: true,
    value: 'option2',
    placeholder: 'Select with clear button...',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Select',
    options: basicOptions,
    disabled: true,
    value: 'option1',
  },
};

export const Error: Story = {
  args: {
    label: 'Error State',
    options: basicOptions,
    error: true,
    helperText: 'Please select a valid option',
    placeholder: 'This field has an error...',
  },
};

export const Success: Story = {
  args: {
    label: 'Success State',
    options: basicOptions,
    success: true,
    helperText: 'Selection confirmed',
    value: 'option1',
  },
};

export const WithDisabledOptions: Story = {
  args: {
    label: 'Priority Level',
    options: priorityOptions,
    placeholder: 'Some options are disabled...',
    helperText: 'Critical priority is currently disabled',
  },
};

// Interactive examples
const ControlledSelectExample = () => {
  const [value, setValue] = useState<string>('');

  return (
    <Box sx={{ minWidth: 300 }}>
      <Select
        label="Controlled Select"
        options={basicOptions}
        value={value}
        onChange={(event) => setValue(event.target.value as string)}
        placeholder="Choose an option..."
        helperText={`Selected value: ${value || 'None'}`}
        clearable
        onClear={() => setValue('')}
      />
    </Box>
  );
};

const FormExample = () => {
  const [formData, setFormData] = useState({
    category: '',
    priority: '',
    language: '',
    setting: '',
  });

  const handleChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleClear = (field: string) => () => {
    setFormData(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  return (
    <Stack spacing={3} sx={{ minWidth: 400 }}>
      <Typography variant="h6">Configuration Form</Typography>
      
      <Select
        label="Category"
        options={categoryOptions}
        value={formData.category}
        onChange={handleChange('category')}
        placeholder="Select category..."
        clearable
        onClear={handleClear('category')}
      />
      
      <Select
        label="Priority"
        options={priorityOptions}
        value={formData.priority}
        onChange={handleChange('priority')}
        placeholder="Select priority..."
        clearable
        onClear={handleClear('priority')}
        helperText="Critical priority is currently unavailable"
      />
      
      <Select
        label="Language"
        options={languageOptions}
        value={formData.language}
        onChange={handleChange('language')}
        placeholder="Select language..."
        clearable
        onClear={handleClear('language')}
      />
      
      <Select
        label="Settings"
        options={settingsOptions}
        value={formData.setting}
        onChange={handleChange('setting')}
        placeholder="Choose setting..."
        clearable
        onClear={handleClear('setting')}
      />

      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>Form Data:</Typography>
        <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {JSON.stringify(formData, null, 2)}
        </Typography>
      </Box>
    </Stack>
  );
};

export const ControlledExample = () => <ControlledSelectExample />;

export const FormConfiguration = () => <FormExample />;

export const AllVariants = () => (
  <Stack spacing={4} sx={{ width: '100%', maxWidth: 800 }}>
    <Typography variant="h5" component="h2">Select Sizes</Typography>
    <Stack spacing={2}>
      <Select
        size="sm"
        label="Small"
        options={basicOptions}
        placeholder="Small select..."
        value="option1"
      />
      
      <Select
        size="md"
        label="Medium"
        options={basicOptions}
        placeholder="Medium select..."
        value="option2"
      />
      
      <Select
        size="lg"
        label="Large"
        options={basicOptions}
        placeholder="Large select..."
        value="option3"
      />
    </Stack>

    <Typography variant="h5" component="h2">Select States</Typography>
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Select
          label="Normal"
          options={basicOptions.slice(0, 3)}
          placeholder="Normal state..."
          sx={{ minWidth: 200 }}
        />
        
        <Select
          label="Error"
          options={basicOptions.slice(0, 3)}
          error
          helperText="Please select an option"
          placeholder="Error state..."
          sx={{ minWidth: 200 }}
        />
        
        <Select
          label="Success"
          options={basicOptions.slice(0, 3)}
          success
          value="option1"
          helperText="Selection confirmed"
          sx={{ minWidth: 200 }}
        />
      </Stack>
      
      <Stack direction="row" spacing={2}>
        <Select
          label="Disabled"
          options={basicOptions.slice(0, 3)}
          disabled
          value="option2"
          sx={{ minWidth: 200 }}
        />
        
        <Select
          label="Clearable"
          options={basicOptions.slice(0, 3)}
          clearable
          value="option1"
          sx={{ minWidth: 200 }}
        />
      </Stack>
    </Stack>

    <Typography variant="h5" component="h2">Select with Icons</Typography>
    <Stack direction="row" spacing={2}>
      <Select
        label="Category"
        options={categoryOptions}
        placeholder="Select category..."
        sx={{ minWidth: 200 }}
      />
      
      <Select
        label="Language"
        options={languageOptions}
        value="en"
        sx={{ minWidth: 200 }}
      />
      
      <Select
        label="Settings"
        options={settingsOptions}
        placeholder="Choose setting..."
        sx={{ minWidth: 200 }}
      />
    </Stack>

    <Typography variant="h5" component="h2">Interactive Examples</Typography>
    <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>Controlled Select</Typography>
        <ControlledSelectExample />
      </Box>
      
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>Form Example</Typography>
        <FormExample />
      </Box>
    </Box>

    <Typography variant="h5" component="h2">Select Features</Typography>
    <Typography variant="body2" color="text.secondary">
      • Support for icons in options<br />
      • Clearable functionality<br />
      • Multiple sizes (small, medium, large)<br />
      • Error and success states<br />
      • Helper text support<br />
      • Disabled options<br />
      • Accessible with proper labeling<br />
      • Consistent styling with Material-UI theme
    </Typography>
  </Stack>
);