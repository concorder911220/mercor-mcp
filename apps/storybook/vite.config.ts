import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@rialto/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@rialto/theme': path.resolve(__dirname, '../../packages/theme/src'),
      '@rialto/design-tokens': path.resolve(__dirname, '../../packages/design-tokens/src'),
    },
  },
});