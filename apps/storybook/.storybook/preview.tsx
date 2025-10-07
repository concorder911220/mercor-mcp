import type { Preview } from '@storybook/react';
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { createRialtoTheme } from '@rialto/theme';
import { makeSemantic } from '@rialto/design-tokens';

// Create themes using the Rialto theme factory
const lightTheme = createRialtoTheme('light');
const darkTheme = createRialtoTheme('dark');

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'padded',
  },
  decorators: [
    withThemeFromJSXProvider({
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
      defaultTheme: 'light',
      Provider: ThemeProvider,
      GlobalStyles: CssBaseline,
    }),
  ],
};

export default preview;