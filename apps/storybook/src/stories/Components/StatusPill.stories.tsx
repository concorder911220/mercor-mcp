import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { StatusPill } from '@rialto/ui';
import { Box, Stack, Typography } from '@mui/material';

const meta = {
  title: 'Components/StatusPill',
  component: StatusPill,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    kind: {
      control: 'select',
      options: ['forReview', 'inProgress', 'completed', 'error', 'draft', 'pending'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
    onClick: {
      action: 'clicked',
    },
  },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ForReview: Story = {
  args: {
    kind: 'forReview',
  },
};

export const InProgress: Story = {
  args: {
    kind: 'inProgress',
  },
};

export const Completed: Story = {
  args: {
    kind: 'completed',
  },
};

export const Error: Story = {
  args: {
    kind: 'error',
  },
};

export const Draft: Story = {
  args: {
    kind: 'draft',
  },
};

export const Pending: Story = {
  args: {
    kind: 'pending',
  },
};

export const SmallSize: Story = {
  args: {
    kind: 'completed',
    size: 'small',
  },
};

export const MediumSize: Story = {
  args: {
    kind: 'completed',
    size: 'medium',
  },
};

export const Clickable: Story = {
  args: {
    kind: 'inProgress',
    onClick: () => console.log('Status pill clicked'),
  },
};

export const AllVariants = () => (
  <Stack spacing={4}>
    <Typography variant="h5" component="h2">All Status Types</Typography>
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      <StatusPill kind="forReview" />
      <StatusPill kind="inProgress" />
      <StatusPill kind="completed" />
      <StatusPill kind="error" />
      <StatusPill kind="draft" />
      <StatusPill kind="pending" />
    </Stack>

    <Typography variant="h5" component="h2">Sizes</Typography>
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2" sx={{ minWidth: 60 }}>Small:</Typography>
        <StatusPill kind="completed" size="small" />
        <StatusPill kind="inProgress" size="small" />
        <StatusPill kind="error" size="small" />
      </Stack>
      
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2" sx={{ minWidth: 60 }}>Medium:</Typography>
        <StatusPill kind="completed" size="medium" />
        <StatusPill kind="inProgress" size="medium" />
        <StatusPill kind="error" size="medium" />
      </Stack>
    </Stack>

    <Typography variant="h5" component="h2">Use Cases</Typography>
    <Stack spacing={2}>
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1">Project Alpha</Typography>
          <StatusPill kind="inProgress" size="small" />
        </Stack>
      </Box>
      
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1">Task #123: Update documentation</Typography>
          <StatusPill kind="completed" size="small" />
        </Stack>
      </Box>
      
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1">Bug Report #456</Typography>
          <StatusPill kind="error" size="small" />
        </Stack>
      </Box>
      
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1">Feature Request #789</Typography>
          <StatusPill kind="forReview" size="small" />
        </Stack>
      </Box>
    </Stack>

    <Typography variant="h5" component="h2">Status Legend</Typography>
    <Stack spacing={1}>
      <Stack direction="row" spacing={2} alignItems="center">
        <StatusPill kind="draft" size="small" />
        <Typography variant="body2" color="text.secondary">
          Item is in draft state and not yet submitted
        </Typography>
      </Stack>
      
      <Stack direction="row" spacing={2} alignItems="center">
        <StatusPill kind="pending" size="small" />
        <Typography variant="body2" color="text.secondary">
          Waiting for external action or approval
        </Typography>
      </Stack>
      
      <Stack direction="row" spacing={2} alignItems="center">
        <StatusPill kind="forReview" size="small" />
        <Typography variant="body2" color="text.secondary">
          Ready for review by team members
        </Typography>
      </Stack>
      
      <Stack direction="row" spacing={2} alignItems="center">
        <StatusPill kind="inProgress" size="small" />
        <Typography variant="body2" color="text.secondary">
          Actively being worked on
        </Typography>
      </Stack>
      
      <Stack direction="row" spacing={2} alignItems="center">
        <StatusPill kind="completed" size="small" />
        <Typography variant="body2" color="text.secondary">
          Successfully finished and verified
        </Typography>
      </Stack>
      
      <Stack direction="row" spacing={2} alignItems="center">
        <StatusPill kind="error" size="small" />
        <Typography variant="body2" color="text.secondary">
          Encountered an error or requires attention
        </Typography>
      </Stack>
    </Stack>
  </Stack>
);