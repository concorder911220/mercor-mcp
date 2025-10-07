import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Table, TableColumn } from '@rialto/ui';
import { Box, Stack, Typography, Chip, Avatar } from '@mui/material';
import { Edit, Delete, Visibility, CheckCircle, Error } from '@mui/icons-material';

// Sample data
const sampleUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', lastLogin: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'active', lastLogin: '2024-01-14' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'inactive', lastLogin: '2024-01-10' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'active', lastLogin: '2024-01-13' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Viewer', status: 'pending', lastLogin: '2024-01-12' },
];

const basicColumns: TableColumn[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
  { id: 'role', label: 'Role', sortable: true },
  { id: 'lastLogin', label: 'Last Login', sortable: true },
];

const enhancedColumns: TableColumn[] = [
  { 
    id: 'name', 
    label: 'Name', 
    sortable: true,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32 }}>{value.charAt(0)}</Avatar>
        {value}
      </Box>
    )
  },
  { id: 'email', label: 'Email', sortable: true },
  { 
    id: 'role', 
    label: 'Role', 
    sortable: true,
    render: (value) => (
      <Chip 
        label={value} 
        size="small"
        color={value === 'Admin' ? 'primary' : value === 'Editor' ? 'secondary' : 'default'}
      />
    )
  },
  { 
    id: 'status', 
    label: 'Status', 
    sortable: true,
    render: (value) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {value === 'active' && <CheckCircle color="success" sx={{ fontSize: 16 }} />}
        {value === 'inactive' && <Error color="error" sx={{ fontSize: 16 }} />}
        {value === 'pending' && <Error color="warning" sx={{ fontSize: 16 }} />}
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {value}
        </Typography>
      </Box>
    )
  },
  { id: 'lastLogin', label: 'Last Login', sortable: true },
  {
    id: 'actions',
    label: 'Actions',
    align: 'right',
    render: (_, row) => (
      <Stack direction="row" spacing={0.5}>
        <Visibility sx={{ fontSize: 16, cursor: 'pointer', color: 'action.active' }} />
        <Edit sx={{ fontSize: 16, cursor: 'pointer', color: 'action.active' }} />
        <Delete sx={{ fontSize: 16, cursor: 'pointer', color: 'error.main' }} />
      </Stack>
    )
  },
];

const meta = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'striped'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    selectable: {
      control: 'boolean',
    },
    stickyHeader: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: basicColumns,
    rows: sampleUsers,
  },
};

export const Striped: Story = {
  args: {
    variant: 'striped',
    columns: basicColumns,
    rows: sampleUsers,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    columns: basicColumns,
    rows: sampleUsers,
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    columns: basicColumns,
    rows: sampleUsers,
  },
};

export const Selectable: Story = {
  args: {
    selectable: true,
    columns: basicColumns,
    rows: sampleUsers,
  },
};

export const WithCustomRendering: Story = {
  args: {
    columns: enhancedColumns,
    rows: sampleUsers,
  },
};

export const StickyHeader: Story = {
  args: {
    columns: basicColumns,
    rows: [...sampleUsers, ...sampleUsers, ...sampleUsers], // More rows to show scrolling
    stickyHeader: true,
    maxHeight: 300,
  },
};

export const Loading: Story = {
  args: {
    columns: basicColumns,
    rows: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns: basicColumns,
    rows: [],
    emptyMessage: 'No users found',
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    columns: basicColumns,
    rows: [],
    emptyMessage: (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          There are no users to display at this time.
        </Typography>
      </Box>
    ),
  },
};

// Interactive examples
const SortableTableExample = () => {
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortBy(column);
    setSortDirection(direction);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Table
        columns={basicColumns}
        rows={sampleUsers}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Currently sorting by: {sortBy || 'none'} ({sortDirection})
      </Typography>
    </Box>
  );
};

const SelectableTableExample = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  return (
    <Box sx={{ width: '100%' }}>
      <Table
        columns={basicColumns}
        rows={sampleUsers}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Selected: {selectedRows.length} row(s) - {selectedRows.join(', ')}
      </Typography>
    </Box>
  );
};

const FullFeaturedTableExample = () => {
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<string[]>(['2']);

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortBy(column);
    setSortDirection(direction);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Table
        variant="striped"
        columns={enhancedColumns}
        rows={sampleUsers}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        stickyHeader
        maxHeight={400}
      />
    </Box>
  );
};

export const SortableTable = () => <SortableTableExample />;

export const SelectableTable = () => <SelectableTableExample />;

export const FullFeaturedTable = () => <FullFeaturedTableExample />;

export const AllVariants = () => (
  <Stack spacing={4} sx={{ width: '100%' }}>
    <Typography variant="h5" component="h2">Table Variants</Typography>
    
    <Box>
      <Typography variant="h6" gutterBottom>Default</Typography>
      <Table columns={basicColumns.slice(0, 3)} rows={sampleUsers.slice(0, 3)} />
    </Box>
    
    <Box>
      <Typography variant="h6" gutterBottom>Striped</Typography>
      <Table variant="striped" columns={basicColumns.slice(0, 3)} rows={sampleUsers.slice(0, 3)} />
    </Box>

    <Typography variant="h5" component="h2">Table Sizes</Typography>
    
    <Box>
      <Typography variant="h6" gutterBottom>Small</Typography>
      <Table size="sm" columns={basicColumns.slice(0, 3)} rows={sampleUsers.slice(0, 2)} />
    </Box>
    
    <Box>
      <Typography variant="h6" gutterBottom>Medium (Default)</Typography>
      <Table size="md" columns={basicColumns.slice(0, 3)} rows={sampleUsers.slice(0, 2)} />
    </Box>
    
    <Box>
      <Typography variant="h6" gutterBottom>Large</Typography>
      <Table size="lg" columns={basicColumns.slice(0, 3)} rows={sampleUsers.slice(0, 2)} />
    </Box>

    <Typography variant="h5" component="h2">Interactive Examples</Typography>
    
    <Box>
      <Typography variant="h6" gutterBottom>Sortable Table</Typography>
      <SortableTableExample />
    </Box>
    
    <Box>
      <Typography variant="h6" gutterBottom>Selectable Table</Typography>
      <SelectableTableExample />
    </Box>
    
    <Box>
      <Typography variant="h6" gutterBottom>Full Featured Table</Typography>
      <FullFeaturedTableExample />
    </Box>

    <Typography variant="h5" component="h2">Table Features</Typography>
    <Typography variant="body2" color="text.secondary">
      • Sortable columns with visual indicators<br />
      • Row selection with checkboxes<br />
      • Custom cell rendering<br />
      • Sticky headers for long tables<br />
      • Loading and empty states<br />
      • Multiple size variants<br />
      • Striped rows option<br />
      • Responsive design<br />
      • Accessible table navigation
    </Typography>
  </Stack>
);