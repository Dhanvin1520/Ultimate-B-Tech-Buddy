import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  return {
    plugins: [react()],
    base: '/',
    server: {
      port: 3000,
      host: true,
      open: mode === 'development',
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      target: 'esnext',
      minify: mode === 'production' ? 'terser' : false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@tanstack/react-query', 'axios', 'date-fns'],
          },
        },
      },
    },
    define: {
      'process.env': {},
      global: 'globalThis',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      target: 'esnext',
    },
  };
});