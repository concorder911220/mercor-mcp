import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Box, Typography, Stack, Paper, Divider } from '@mui/material';
import { makeSemantic } from '@rialto/design-tokens';

const TypographyScale = () => {
  const semantic = makeSemantic('light');
  const { typography } = semantic;

  const TypeExample = ({ 
    label, 
    size, 
    weight, 
    lineHeight 
  }: { 
    label: string; 
    size: number; 
    weight: number; 
    lineHeight: number;
  }) => (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 'medium', minWidth: 100 }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {size}px / {weight} / {lineHeight}lh
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: size,
          fontWeight: weight,
          lineHeight: lineHeight,
          fontFamily: typography.fontFamily,
        }}
      >
        The quick brown fox jumps over the lazy dog
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Typography System
      </Typography>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Font Family
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {typography.fontFamily}
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Typography variant="h6" sx={{ mb: 3 }}>
        Type Scale
      </Typography>
      
      <TypeExample 
        label="3xl" 
        size={typography.scale['3xl']} 
        weight={typography.weight.bold}
        lineHeight={typography.lineHeight.tight}
      />
      <TypeExample 
        label="2xl" 
        size={typography.scale['2xl']} 
        weight={typography.weight.bold}
        lineHeight={typography.lineHeight.tight}
      />
      <TypeExample 
        label="xl" 
        size={typography.scale.xl} 
        weight={typography.weight.semibold}
        lineHeight={typography.lineHeight.tight}
      />
      <TypeExample 
        label="lg" 
        size={typography.scale.lg} 
        weight={typography.weight.semibold}
        lineHeight={typography.lineHeight.normal}
      />
      <TypeExample 
        label="md (base)" 
        size={typography.scale.md} 
        weight={typography.weight.regular}
        lineHeight={typography.lineHeight.normal}
      />
      <TypeExample 
        label="sm" 
        size={typography.scale.sm} 
        weight={typography.weight.regular}
        lineHeight={typography.lineHeight.normal}
      />
      <TypeExample 
        label="xs" 
        size={typography.scale.xs} 
        weight={typography.weight.regular}
        lineHeight={typography.lineHeight.relaxed}
      />

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ mb: 3 }}>
        Font Weights
      </Typography>

      <Stack spacing={2}>
        {Object.entries(typography.weight).map(([name, value]) => (
          <Stack key={name} direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" sx={{ minWidth: 100, fontWeight: 'medium' }}>
              {name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50 }}>
              {value}
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: value,
                fontFamily: typography.fontFamily,
              }}
            >
              The quick brown fox jumps over the lazy dog
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ mb: 3 }}>
        Line Heights
      </Typography>

      <Stack spacing={3}>
        {Object.entries(typography.lineHeight).map(([name, value]) => (
          <Box key={name}>
            <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 'medium', minWidth: 100 }}>
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {value}
              </Typography>
            </Stack>
            <Paper sx={{ p: 2, maxWidth: 600 }}>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: typography.weight.regular,
                  lineHeight: value,
                  fontFamily: typography.fontFamily,
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </Typography>
            </Paper>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ mb: 3 }}>
        Usage in Code
      </Typography>
      <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
        <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 14 }}>
{`// Using MUI Typography component
<Typography variant="h1">Heading</Typography>
<Typography variant="body1">Body text</Typography>

// Using design tokens directly
import { makeSemantic } from '@rialto/design-tokens';
const { typography } = makeSemantic('light');

<Box sx={{ 
  fontSize: typography.scale.lg,
  fontWeight: typography.weight.semibold,
  lineHeight: typography.lineHeight.tight
}} />`}
        </Typography>
      </Paper>
    </Box>
  );
};

const meta = {
  title: 'Design Tokens/Typography',
  component: TypographyScale,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TypographyScale>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};