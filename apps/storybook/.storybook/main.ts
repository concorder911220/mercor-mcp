import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@rialto/ui': path.resolve(__dirname, '../../../packages/ui/src'),
          '@rialto/theme': path.resolve(__dirname, '../../../packages/theme/src'),
          '@rialto/design-tokens': path.resolve(__dirname, '../../../packages/design-tokens/src'),
        },
      },
      esbuild: {
        loader: 'tsx',
        include: /\.(ts|tsx|js|jsx)$/,
        exclude: [],
      },
      optimizeDeps: {
        include: ['@rialto/design-tokens', '@rialto/ui', '@rialto/theme'],
      },
    });
  },
};
export default config;