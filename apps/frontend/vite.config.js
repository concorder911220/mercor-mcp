import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: '3000'
  },
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'ignore-vfile-imports',
          resolveId(id) {
            if (id === '#minpath' || id === '#minproc' || id === '#minurl') {
              return id;
            }
            return null;
          },
          load(id) {
            if (id === '#minpath') {
              return 'export const minpath = {}; export default {};';
            }
            if (id === '#minproc') {
              return 'export const minproc = {}; export default {};';
            }
            if (id === '#minurl') {
              return 'export const urlToPath = () => ""; export const isUrl = () => false; export default {};';
            }
            return null;
          }
        }
      ]
    }
  }
})