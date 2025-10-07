import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Box, Typography, Stack, Paper, Grid, Divider } from '@mui/material';
import { Button, Input, Chip, Select, Card, IconButton, Checkbox } from '@rialto/ui';
import { core, makeSemantic, lightPalette, darkPalette } from '@rialto/design-tokens';
import { createRialtoTheme } from '@rialto/theme';
import { useTheme } from '@mui/material/styles';
import { Add, Edit, Delete, Search, Star, Person, Favorite } from '@mui/icons-material';

const ThemeShowcase = ({ mode }: { mode: 'light' | 'dark' }) => {
  const theme = useTheme(); // Get the actual MUI theme being used
  const semantic = makeSemantic(mode);
  const palette = mode === 'light' ? lightPalette : darkPalette;

  const ColorSwatch = ({ color, label, size = 'md' }: { color: string; label: string; size?: 'sm' | 'md' }) => (
    <Box sx={{ textAlign: 'center', minWidth: size === 'sm' ? 60 : 100 }}>
      <Box
        sx={{
          width: size === 'sm' ? 60 : 100,
          height: size === 'sm' ? 40 : 60,
          backgroundColor: color,
          borderRadius: 1,
          mb: 0.5,
          border: '1px solid rgba(0,0,0,0.1)',
        }}
      />
      <Typography variant="caption" display="block" sx={{ fontSize: size === 'sm' ? 10 : 12 }}>
        {label}
      </Typography>
    </Box>
  );

  const TypographyExample = ({ variant, text }: { variant: string; text: string }) => (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="baseline">
        <Typography variant="caption" sx={{ minWidth: 60, fontWeight: 'medium', color: 'text.secondary' }}>
          {variant}
        </Typography>
        <Typography variant={variant as any}>
          {text}
        </Typography>
      </Stack>
    </Box>
  );

  const ComponentSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: semantic.color.text.primary }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );

  return (
    <Box sx={{ p: 3, backgroundColor: semantic.color.background.default, minHeight: '100vh' }}>
      <Typography 
        variant="h3" 
        sx={{ 
          mb: 4, 
          textAlign: 'center',
          fontSize: semantic.typography.scale.h1,
          fontWeight: semantic.typography.weight.bold,
          color: semantic.color.text.primary
        }}
      >
        Rialto Design System ({mode} theme)
      </Typography>

      <Grid container spacing={4}>
        {/* Colors Section */}
        <Grid item xs={12} md={6}>
          <ComponentSection title="Brand Colors">
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <ColorSwatch color={semantic.color.primary.main} label="primary" />
              <ColorSwatch color={semantic.color.secondary.main} label="secondary" />
              <ColorSwatch color={semantic.action.primary} label="action" />
            </Stack>
            
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Navy Palette</Typography>
            <Stack direction="row" spacing={0.5} sx={{ mb: 2, overflowX: 'auto' }}>
              {Object.entries(palette.navy).slice(0, 6).map(([shade, color]) => (
                <ColorSwatch key={shade} color={color} label={shade} size="sm" />
              ))}
            </Stack>

            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Forest Palette</Typography>
            <Stack direction="row" spacing={0.5} sx={{ mb: 2, overflowX: 'auto' }}>
              {Object.entries(palette.forest).slice(0, 6).map(([shade, color]) => (
                <ColorSwatch key={shade} color={color} label={shade} size="sm" />
              ))}
            </Stack>

            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Status Colors</Typography>
            <Stack direction="row" spacing={1}>
              <ColorSwatch color={semantic.status.success} label="success" size="sm" />
              <ColorSwatch color={semantic.status.warning} label="warning" size="sm" />
              <ColorSwatch color={semantic.status.error} label="error" size="sm" />
              <ColorSwatch color={semantic.status.info} label="info" size="sm" />
            </Stack>
          </ComponentSection>
        </Grid>

        {/* Typography Section */}
        <Grid item xs={12} md={6}>
          <ComponentSection title="Typography Scale">
            <TypographyExample variant="h1" text="Heading 1 - Page Title" />
            <TypographyExample variant="h2" text="Heading 2 - Section Title" />
            <TypographyExample variant="h3" text="Heading 3 - Subsection" />
            <TypographyExample variant="h4" text="Heading 4 - Card Title" />
            <TypographyExample variant="h5" text="Heading 5 - Small Title" />
            <TypographyExample variant="h6" text="Heading 6 - Micro Title" />
            <TypographyExample variant="body1" text="Body 1 - Primary text for content" />
            <TypographyExample variant="body2" text="Body 2 - Secondary text and descriptions" />
            <TypographyExample variant="caption" text="Caption - Small text for labels and metadata" />

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Font Family: {semantic.typography.fontFamily}
            </Typography>
          </ComponentSection>
        </Grid>

        {/* Buttons Section */}
        <Grid item xs={12} md={6}>
          <ComponentSection title="Buttons">
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button variant="primary">
                  <Add sx={{ fontSize: 18, mr: 0.5 }} />
                  Add Item
                </Button>
                <Button variant="secondary">
                  Save
                  <Star sx={{ fontSize: 18, ml: 0.5 }} />
                </Button>
                <IconButton>
                  <Edit />
                </IconButton>
                <IconButton color="error">
                  <Delete />
                </IconButton>
              </Stack>

              <Button disabled>Disabled Button</Button>
            </Stack>
          </ComponentSection>
        </Grid>

        {/* Form Controls Section */}
        <Grid item xs={12} md={6}>
          <ComponentSection title="Form Controls">
            <Stack spacing={2}>
              <Input placeholder="Default input" />
              <Input size="sm" placeholder="Small input" />
              <Input 
                placeholder="Search..." 
                startAdornment={<Search sx={{ fontSize: 20, color: 'text.secondary' }} />}
              />
              <Input error placeholder="Error state" />
              <Input disabled placeholder="Disabled input" />
              
              <Select 
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
                placeholder="Select option..."
              />

              <Stack direction="row" spacing={2} alignItems="center">
                <Checkbox />
                <Typography>Checkbox option</Typography>
                <Checkbox defaultChecked />
                <Typography>Checked option</Typography>
              </Stack>
            </Stack>
          </ComponentSection>
        </Grid>

        {/* Chips & Tags Section */}
        <Grid item xs={12} md={6}>
          <ComponentSection title="Chips & Status">
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="Default" />
                <Chip label="Primary" color="primary" />
                <Chip label="Success" color="success" />
                <Chip label="Warning" color="warning" />
                <Chip label="Error" color="error" />
              </Stack>

              <Stack direction="row" spacing={1}>
                <Chip label="Small" size="sm" color="primary" />
                <Chip label="Medium" size="md" color="primary" />
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="With Icon" icon={<Person />} />
                <Chip label="Deletable" onDelete={() => {}} />
                <Chip label="Clickable" clickable onClick={() => {}} />
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="React" size="sm" variant="outlined" />
                <Chip label="TypeScript" size="sm" variant="outlined" />
                <Chip label="Design System" size="sm" variant="outlined" />
              </Stack>
            </Stack>
          </ComponentSection>
        </Grid>

        {/* Cards Section */}
        <Grid item xs={12} md={6}>
          <ComponentSection title="Cards & Surfaces">
            <Stack spacing={2}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Card Title
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This is a sample card with some content. Cards are used to group related information.
                </Typography>
              </Card>

              <Paper sx={{ p: 2, backgroundColor: semantic.surface.secondary }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Secondary Surface
                </Typography>
                <Typography variant="body2">
                  Different surface colors create visual hierarchy.
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, backgroundColor: semantic.surface.tertiary }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Tertiary Surface
                </Typography>
                <Typography variant="body2">
                  Used for subtle backgrounds and groupings.
                </Typography>
              </Paper>
            </Stack>
          </ComponentSection>
        </Grid>

        {/* Spacing & Layout Section */}
        <Grid item xs={12}>
          <ComponentSection title="Spacing & Layout Examples">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: core.space[2], backgroundColor: semantic.surface.secondary }}>
                  <Typography variant="body2">Spacing: {core.space[2]}px (space-2)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: core.space[4], backgroundColor: semantic.surface.secondary }}>
                  <Typography variant="body2">Spacing: {core.space[4]}px (space-4)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: core.space[6], backgroundColor: semantic.surface.secondary }}>
                  <Typography variant="body2">Spacing: {core.space[6]}px (space-6)</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Border Radius Examples</Typography>
              <Stack direction="row" spacing={2}>
                <Box sx={{ 
                  width: 80, 
                  height: 40, 
                  backgroundColor: semantic.color.primary.main, 
                  borderRadius: `${core.radius.sm}px`
                }}>
                  <Typography variant="caption" sx={{ color: 'white', p: 1 }}>sm</Typography>
                </Box>
                <Box sx={{ 
                  width: 80, 
                  height: 40, 
                  backgroundColor: semantic.color.primary.main, 
                  borderRadius: `${core.radius.md}px`
                }}>
                  <Typography variant="caption" sx={{ color: 'white', p: 1 }}>md</Typography>
                </Box>
                <Box sx={{ 
                  width: 80, 
                  height: 40, 
                  backgroundColor: semantic.color.primary.main, 
                  borderRadius: `${core.radius.lg}px`
                }}>
                  <Typography variant="caption" sx={{ color: 'white', p: 1 }}>lg</Typography>
                </Box>
                <Box sx={{ 
                  width: 80, 
                  height: 40, 
                  backgroundColor: semantic.color.primary.main, 
                  borderRadius: `${core.radius.pill}px`
                }}>
                  <Typography variant="caption" sx={{ color: 'white', p: 1 }}>pill</Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Shadow Examples</Typography>
              <Stack direction="row" spacing={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      width: 100, 
                      height: 60, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mb: 1,
                      backgroundColor: semantic.surface.primary,
                      boxShadow: core.shadow.sm
                    }}
                  >
                    <Typography variant="caption">sm</Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary">Small</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      width: 100, 
                      height: 60, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mb: 1,
                      backgroundColor: semantic.surface.primary,
                      boxShadow: core.shadow.md
                    }}
                  >
                    <Typography variant="caption">md</Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary">Medium</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      width: 100, 
                      height: 60, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mb: 1,
                      backgroundColor: semantic.surface.primary,
                      boxShadow: core.shadow.lg
                    }}
                  >
                    <Typography variant="caption">lg</Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary">Large</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Paper 
                    elevation={1}
                    sx={{ 
                      width: 100, 
                      height: 60, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mb: 1,
                      backgroundColor: semantic.surface.primary,
                    }}
                  >
                    <Typography variant="caption">MUI 1</Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary">Theme</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Paper 
                    elevation={3}
                    sx={{ 
                      width: 100, 
                      height: 60, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mb: 1,
                      backgroundColor: semantic.surface.primary,
                    }}
                  >
                    <Typography variant="caption">MUI 3</Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary">Theme</Typography>
                </Box>
              </Stack>
            </Box>
          </ComponentSection>
        </Grid>

        {/* Usage Guidelines */}
        <Grid item xs={12}>
          <ComponentSection title="Usage Guidelines">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: semantic.status.success }}>
                  ✅ Do
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">• Use semantic color tokens (primary, secondary, status)</Typography>
                  <Typography variant="body2">• Follow the typography scale for consistent sizing</Typography>
                  <Typography variant="body2">• Use spacing tokens for consistent layouts</Typography>
                  <Typography variant="body2">• Apply proper component variants for different contexts</Typography>
                  <Typography variant="body2">• Test components in both light and dark themes</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: semantic.status.error }}>
                  ❌ Don't
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">• Hardcode color values or spacing</Typography>
                  <Typography variant="body2">• Mix different font sizes arbitrarily</Typography>
                  <Typography variant="body2">• Use non-standard button or input variants</Typography>
                  <Typography variant="body2">• Ignore accessibility guidelines</Typography>
                  <Typography variant="body2">• Create custom components without using tokens</Typography>
                </Stack>
              </Grid>
            </Grid>
          </ComponentSection>
        </Grid>
      </Grid>
    </Box>
  );
};

const meta = {
  title: 'Theme/Complete Showcase',
  component: ThemeShowcase,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete showcase of the Rialto Design System including colors, typography, components, and usage guidelines.',
      },
    },
  },
} satisfies Meta<typeof ThemeShowcase>;

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