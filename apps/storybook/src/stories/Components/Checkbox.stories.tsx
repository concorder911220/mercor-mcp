import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Checkbox } from '@rialto/ui';
import { Box, Stack, Typography, FormGroup } from '@mui/material';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    checked: {
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
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

export const WithLabelAndHelper: Story = {
  args: {
    label: 'Subscribe to newsletter',
    helperText: 'You can unsubscribe at any time',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small checkbox',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Large checkbox',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled checkbox',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled checked',
    disabled: true,
    checked: true,
  },
};

export const Error: Story = {
  args: {
    label: 'Error checkbox',
    error: true,
    helperText: 'This field is required',
  },
};

export const Success: Story = {
  args: {
    label: 'Success checkbox',
    success: true,
    helperText: 'Selection confirmed',
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Indeterminate checkbox',
    indeterminate: true,
  },
};

// Interactive examples
const CheckboxGroup = () => {
  const [selectedItems, setSelectedItems] = useState({
    option1: false,
    option2: true,
    option3: false,
  });

  const handleChange = (option: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedItems(prev => ({
      ...prev,
      [option]: event.target.checked,
    }));
  };

  return (
    <FormGroup>
      <Checkbox
        label="Option 1"
        checked={selectedItems.option1}
        onChange={handleChange('option1')}
      />
      <Checkbox
        label="Option 2"
        checked={selectedItems.option2}
        onChange={handleChange('option2')}
      />
      <Checkbox
        label="Option 3"
        checked={selectedItems.option3}
        onChange={handleChange('option3')}
      />
    </FormGroup>
  );
};

const SelectAllExample = () => {
  const [checkedItems, setCheckedItems] = useState({
    item1: false,
    item2: false,
    item3: false,
  });

  const allChecked = Object.values(checkedItems).every(Boolean);
  const isIndeterminate = Object.values(checkedItems).some(Boolean) && !allChecked;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setCheckedItems({
      item1: checked,
      item2: checked,
      item3: checked,
    });
  };

  const handleItemChange = (item: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: event.target.checked,
    }));
  };

  return (
    <Box>
      <Checkbox
        label="Select All"
        checked={allChecked}
        indeterminate={isIndeterminate}
        onChange={handleSelectAll}
      />
      <Box sx={{ pl: 3 }}>
        <FormGroup>
          <Checkbox
            label="Item 1"
            checked={checkedItems.item1}
            onChange={handleItemChange('item1')}
          />
          <Checkbox
            label="Item 2"
            checked={checkedItems.item2}
            onChange={handleItemChange('item2')}
          />
          <Checkbox
            label="Item 3"
            checked={checkedItems.item3}
            onChange={handleItemChange('item3')}
          />
        </FormGroup>
      </Box>
    </Box>
  );
};

export const InteractiveGroup = () => <CheckboxGroup />;

export const SelectAllPattern = () => <SelectAllExample />;

export const AllVariants = () => (
  <Stack spacing={4}>
    <Typography variant="h5" component="h2">Checkbox Sizes</Typography>
    <Stack direction="row" spacing={3} alignItems="center">
      <Checkbox size="sm" label="Small" />
      <Checkbox size="md" label="Medium" />
      <Checkbox size="lg" label="Large" />
    </Stack>

    <Typography variant="h5" component="h2">Checkbox States</Typography>
    <Stack spacing={2}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" checked />
        <Checkbox label="Indeterminate" indeterminate />
      </Stack>
      
      <Stack direction="row" spacing={3} alignItems="center">
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Disabled Checked" disabled checked />
        <Checkbox label="Error" error />
        <Checkbox label="Success" success checked />
      </Stack>
    </Stack>

    <Typography variant="h5" component="h2">With Helper Text</Typography>
    <Stack spacing={2} sx={{ maxWidth: 400 }}>
      <Checkbox
        label="Subscribe to notifications"
        helperText="You'll receive updates about new features and important announcements"
      />
      <Checkbox
        label="Accept terms"
        error
        helperText="Please accept the terms and conditions to continue"
      />
      <Checkbox
        label="Marketing emails"
        success
        checked
        helperText="You've successfully opted in to marketing communications"
      />
    </Stack>

    <Typography variant="h5" component="h2">Interactive Examples</Typography>
    <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      <Box>
        <Typography variant="h6" gutterBottom>Basic Group</Typography>
        <CheckboxGroup />
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom>Select All Pattern</Typography>
        <SelectAllExample />
      </Box>
    </Box>
  </Stack>
);