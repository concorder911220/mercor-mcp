import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Card } from '@rialto/ui';
import { Box, Stack, Typography } from '@mui/material';
import { MoreVert, Edit, Bookmark, Favorite, Star } from '@mui/icons-material';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outlined', 'flat'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    hover: {
      control: 'boolean',
    },
    dividers: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <Typography>
        This is an elevated card with default styling. It has a subtle shadow that creates depth and hierarchy.
      </Typography>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <Typography>
        This is an outlined card with a border instead of a shadow. Perfect for subtle separation.
      </Typography>
    ),
  },
};

export const Flat: Story = {
  args: {
    variant: 'flat',
    children: (
      <Typography>
        This is a flat card with no shadow or border. Minimal and clean styling.
      </Typography>
    ),
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: (
      <Typography>
        This card includes a title in the header section. The title is styled consistently across all cards.
      </Typography>
    ),
  },
};

export const WithTitleAndSubtitle: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'This is a subtitle that provides additional context',
    children: (
      <Typography>
        This card includes both a title and subtitle in the header. The subtitle appears below the title in a lighter color.
      </Typography>
    ),
  },
};

export const WithHeaderAction: Story = {
  args: {
    title: 'Card with Action',
    subtitle: 'Action button in the header',
    headerAction: <MoreVert />,
    children: (
      <Typography>
        This card includes an action element in the header, typically used for menus or secondary actions.
      </Typography>
    ),
  },
};

export const WithActions: Story = {
  args: {
    title: 'Card with Actions',
    children: (
      <Typography>
        This card includes action buttons in the footer area. Actions are right-aligned by default.
      </Typography>
    ),
    actions: (
      <Stack direction="row" spacing={1}>
        <Bookmark />
        <Favorite />
        <Edit />
      </Stack>
    ),
  },
};

export const WithDividers: Story = {
  args: {
    title: 'Card with Dividers',
    subtitle: 'Dividers separate sections',
    dividers: true,
    children: (
      <Typography>
        This card uses dividers to clearly separate the header, content, and actions sections.
      </Typography>
    ),
    actions: (
      <Stack direction="row" spacing={1}>
        <Bookmark />
        <Star />
      </Stack>
    ),
  },
};

export const Hoverable: Story = {
  args: {
    title: 'Hoverable Card',
    subtitle: 'Try hovering over this card',
    hover: true,
    children: (
      <Typography>
        This card has hover effects enabled. The appearance changes when you hover over it to indicate interactivity.
      </Typography>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    title: 'Small Padding',
    children: (
      <Typography>
        This card uses small padding for a more compact layout.
      </Typography>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    title: 'Large Padding',
    children: (
      <Typography>
        This card uses large padding for a more spacious layout.
      </Typography>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <Box sx={{ p: 2 }}>
        <Typography>
          This card has no internal padding, allowing for custom spacing control.
        </Typography>
      </Box>
    ),
  },
};

export const AllVariants = () => (
  <Stack spacing={3} sx={{ maxWidth: 800 }}>
    <Typography variant="h5" component="h2">Card Variants</Typography>
    
    <Stack direction="row" spacing={2} flexWrap="wrap">
      <Card variant="elevated" sx={{ width: 250 }}>
        <Typography variant="h6">Elevated</Typography>
        <Typography variant="body2" color="text.secondary">
          Uses shadow for depth
        </Typography>
      </Card>
      
      <Card variant="outlined" sx={{ width: 250 }}>
        <Typography variant="h6">Outlined</Typography>
        <Typography variant="body2" color="text.secondary">
          Uses border for separation
        </Typography>
      </Card>
      
      <Card variant="flat" sx={{ width: 250 }}>
        <Typography variant="h6">Flat</Typography>
        <Typography variant="body2" color="text.secondary">
          Minimal styling
        </Typography>
      </Card>
    </Stack>

    <Typography variant="h5" component="h2">Card with Full Features</Typography>
    
    <Card
      variant="elevated"
      title="Project Dashboard"
      subtitle="Overview of current projects and tasks"
      headerAction={<MoreVert />}
      hover
      dividers
      actions={
        <Stack direction="row" spacing={1}>
          <Bookmark />
          <Favorite />
          <Edit />
        </Stack>
      }
      sx={{ maxWidth: 600 }}
    >
      <Typography paragraph>
        This card demonstrates all available features: title, subtitle, header action, 
        hover effects, dividers, and footer actions.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Cards are versatile containers that can be customized to fit various use cases 
        while maintaining visual consistency.
      </Typography>
    </Card>

    <Typography variant="h5" component="h2">Padding Variations</Typography>
    
    <Stack direction="row" spacing={2} flexWrap="wrap">
      <Card padding="sm" title="Small" sx={{ width: 180 }}>
        <Typography variant="body2">Compact spacing</Typography>
      </Card>
      
      <Card padding="md" title="Medium" sx={{ width: 180 }}>
        <Typography variant="body2">Default spacing</Typography>
      </Card>
      
      <Card padding="lg" title="Large" sx={{ width: 180 }}>
        <Typography variant="body2">Spacious layout</Typography>
      </Card>
    </Stack>
  </Stack>
);