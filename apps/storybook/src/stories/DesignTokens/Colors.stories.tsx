import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import { core, makeSemantic, lightPalette, darkPalette } from '@rialto/design-tokens';

const ColorPalette = ({ mode }: { mode: 'light' | 'dark' }) => {
  const semantic = makeSemantic(mode);
  const palette = mode === 'light' ? lightPalette : darkPalette;
  
  const ColorSwatch = ({ color, label }: { color: string; label: string }) => (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      <Box
        sx={{
          width: '100%',
          height: 80,
          backgroundColor: color,
          borderRadius: 1,
          mb: 1,
          border: '1px solid rgba(0,0,0,0.1)',
        }}
      />
      <Typography variant="caption" display="block" fontWeight="medium">
        {label}
      </Typography>
      <Typography variant="caption" display="block" color="text.secondary">
        {color}
      </Typography>
    </Paper>
  );

  const ColorScale = ({ name, colors }: { name: string; colors: Record<string, string> }) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
        {name}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 2,
        }}
      >
        {Object.entries(colors).map(([shade, value]) => (
          <ColorSwatch key={shade} color={value} label={`${name}-${shade}`} />
        ))}
      </Box>
    </Box>
  );

  const SemanticColorSection = ({ title, colors }: { title: string; colors: Record<string, string> }) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 2,
        }}
      >
        {Object.entries(colors).map(([name, value]) => (
          <ColorSwatch key={name} color={value} label={name} />
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Color System ({mode})
      </Typography>

      {/* Semantic Colors Section */}
      <Typography variant="h5" sx={{ mb: 3 }}>
        Semantic Colors
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        These are the semantic color tokens used throughout the application. They automatically adapt based on the theme mode.
      </Typography>

      <SemanticColorSection title="Primary & Secondary" colors={{
        'primary.main': semantic.color.primary.main,
        'primary.light': semantic.color.primary.light,
        'primary.dark': semantic.color.primary.dark,
        'secondary.main': semantic.color.secondary.main,
        'secondary.light': semantic.color.secondary.light,
        'secondary.dark': semantic.color.secondary.dark,
      }} />

      <SemanticColorSection title="Text Colors" colors={{
        'text.primary': semantic.color.text.primary,
        'text.secondary': semantic.color.text.secondary,
        'text.disabled': semantic.color.text.disabled,
      }} />

      <SemanticColorSection title="Background Colors" colors={{
        'background.default': semantic.color.background.default,
        'background.paper': semantic.color.background.paper,
        'surface.primary': semantic.surface.primary,
        'surface.secondary': semantic.surface.secondary,
        'surface.tertiary': semantic.surface.tertiary,
      }} />

      <SemanticColorSection title="Status Colors" colors={semantic.status} />

      <SemanticColorSection title="Action Colors" colors={semantic.action} />

      <SemanticColorSection title="Border Colors" colors={semantic.border} />

      {/* Palette Colors Section */}
      <Typography variant="h5" sx={{ mb: 3, mt: 6 }}>
        Color Palettes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Raw color palettes that adapt to light/dark mode. These are the foundation colors used to build semantic tokens.
      </Typography>

      <ColorScale name="navy" colors={palette.navy} />
      <ColorScale name="forest" colors={palette.forest} />
      <ColorScale name="gray" colors={palette.gray} />
      
      <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
        Status Palettes
      </Typography>
      <ColorScale name="green" colors={palette.green} />
      <ColorScale name="red" colors={palette.red} />
      <ColorScale name="blue" colors={palette.blue} />
      <ColorScale name="yellow" colors={palette.yellow} />

      {/* Chart Colors */}
      <Typography variant="h5" sx={{ mb: 3, mt: 6 }}>
        Chart Colors
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Data visualization color palette (10-color categorical scale)
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 2,
        }}
      >
        {core.chart10.map((color, index) => (
          <ColorSwatch key={index} color={color} label={`Chart ${index + 1}`} />
        ))}
      </Box>

      {/* Usage Examples */}
      <Typography variant="h5" sx={{ mb: 3, mt: 6 }}>
        Usage Examples
      </Typography>
      <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
        <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 14 }}>
{`// Import design tokens
import { makeSemantic, core } from '@rialto/design-tokens';

// Get semantic tokens for current mode
const semantic = makeSemantic('light'); // or 'dark'

// Use semantic colors (recommended)
<Box sx={{ color: semantic.color.text.primary }} />
<Button sx={{ backgroundColor: semantic.action.primary }} />

// Use status colors
<Alert sx={{ backgroundColor: semantic.status.error }} />

// Use chart colors for data viz
const chartColor = core.chart10[0];`}
        </Typography>
      </Paper>
    </Box>
  );
};

const meta = {
  title: 'Design Tokens/Colors',
  component: ColorPalette,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ColorPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
  args: {
    mode: 'light',
  },
};

export const Dark: Story = {
  args: {
    mode: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};