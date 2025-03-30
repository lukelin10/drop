import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Detect if we're running in Replit
const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
const isProduction = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    // Configure HMR for Replit
    hmr: {
      // Use 443 for Replit HTTPS
      clientPort: isReplit ? 443 : undefined,
      // Use secure protocol in Replit
      protocol: isReplit ? 'wss' : 'ws',
    },
    // Ensure the server is accessible from outside
    host: '0.0.0.0',
    // Port comes from environment or falls back to 5001
    port: parseInt(process.env.VITE_PORT || '5001', 10),
    // Proxy API requests to our backend Express server
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 5000}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Configure the build process
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: !isProduction,
  },
  // Support path aliases from tsconfig
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, '../attached_assets'),
      '@shared': resolve(__dirname, '../shared'),
    },
  },
});