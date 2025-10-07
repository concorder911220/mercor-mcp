# Rialto Design System Storybook

This Storybook showcases the Rialto Design System, including design tokens, theme components, and UI library components.

## Features

- **Design Tokens**: Colors, spacing, typography scales
- **Theme Visualization**: Light and dark themes
- **UI Components**: Button, Input, Chip, and more from `@rialto/ui`
- **Interactive Examples**: Try components with different props
- **Documentation**: Auto-generated docs for each component

## Getting Started

### Install Dependencies

```bash
cd apps/storybook
npm install
```

### Run Storybook

```bash
npm run storybook
```

This will start Storybook on `http://localhost:6006`

### Build Storybook

```bash
npm run build-storybook
```

This creates a static build in `storybook-static/` that can be deployed.

### Serve Built Storybook

```bash
npm run serve-storybook
```

## Structure

```
src/
  stories/
    DesignTokens/
      Colors.stories.tsx          # Color palette visualization
      Spacing.stories.tsx         # Spacing scale examples
      Typography.stories.tsx      # Typography scale and usage
    Components/
      Button.stories.tsx          # Button component variants
      Input.stories.tsx           # Input component examples
      Chip.stories.tsx            # Chip component showcase
      [other-components]/
```

## Adding New Stories

1. Create a new `.stories.tsx` file in the appropriate folder
2. Import your component from `@rialto/ui` or create inline examples
3. Define the meta object with component info
4. Create story variations as exports
5. Include an "All Variants" story to show comprehensive examples

Example:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from '@rialto/ui';

const meta = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // component props
  },
};
```

## Design System Integration

This Storybook automatically uses your design system packages:

- `@rialto/design-tokens` - Core design tokens
- `@rialto/theme` - Theme configuration  
- `@rialto/ui` - UI component library

All stories support both light and dark themes via the theme switcher in the toolbar.