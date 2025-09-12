import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'library') {
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'CaseCreationFeature',
          fileName: (format) => `index.${format}.js`,
          formats: ['es', 'cjs']
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            }
          }
        }
      },
      optimizeDeps: {
        exclude: ['lucide-react'],
      },
    };
  }

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});