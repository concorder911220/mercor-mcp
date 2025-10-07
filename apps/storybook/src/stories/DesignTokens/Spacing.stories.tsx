import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import { core } from '@rialto/design-tokens';

const SpacingScale = () => {
  const SpacingExample = ({ value, label }: { value: number; label: string }) => (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ minWidth: 80, fontFamily: 'monospace' }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
        {value}px
      </Typography>
      <Box
        sx={{
          width: value,
          height: 24,
          backgroundColor: 'primary.main',
          borderRadius: 0.5,
        }}
      />
    </Stack>
  );

  const SpacingBox = ({ size, label }: { size: number; label: string }) => (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 'medium' }}>
        {label} ({size}px)
      </Typography>
      <Box
        sx={{
          width: '100%',
          height: 100,
          backgroundColor: 'grey.100',
          borderRadius: 1,
          p: `${size}px`,
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: 'primary.main',
            borderRadius: 0.5,
          }}
        />
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Spacing System
      </Typography>

      <Typography variant="h6" sx={{ mb: 3 }}>
        Spacing Scale
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Our spacing scale is based on a 4px unit. Use these values for consistent spacing throughout the application.
      </Typography>

      <Box sx={{ mb: 6 }}>
        {Object.entries(core.space).map(([key, value]) => (
          <SpacingExample key={key} value={value} label={`space-${key}`} />
        ))}
      </Box>

      <Typography variant="h6" sx={{ mb: 3 }}>
        Spacing Examples
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Visual examples of padding applied to containers
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2,
        }}
      >
        <SpacingBox size={core.space[1]} label="space-1" />
        <SpacingBox size={core.space[2]} label="space-2" />
        <SpacingBox size={core.space[3]} label="space-3" />
        <SpacingBox size={core.space[4]} label="space-4" />
        <SpacingBox size={core.space[6]} label="space-6" />
        <SpacingBox size={core.space[8]} label="space-8" />
      </Box>

      <Typography variant="h6" sx={{ mb: 3, mt: 6 }}>
        Usage in Code
      </Typography>
      <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
        <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 14 }}>
{`// Using theme spacing (MUI integration)
<Box sx={{ p: theme.spacing(2) }} />  // 16px
<Stack spacing={theme.spacing(3)} />   // 24px

// Using design tokens directly
import { core } from '@rialto/design-tokens';
const padding = core.space[4];  // 16px`}
        </Typography>
      </Paper>
    </Box>
  );
};

const meta = {
  title: 'Design Tokens/Spacing',
  component: SpacingScale,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SpacingScale>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};