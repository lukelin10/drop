import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Detect if we're running in Replit
const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
const isProduction = process.env.NODE_ENV === 'production';

// Determine the base URL for the API and assets
const replitUrl = isReplit && process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
  : '';
const baseUrl = process.env.VITE_BASE_URL || replitUrl || 'http://localhost:3000';
const apiBaseUrl = process.env.VITE_API_BASE_URL || baseUrl;

console.log(`Vite config: Using base URL: ${baseUrl}`);
console.log(`Vite config: Using API base URL: ${apiBaseUrl}`);
console.log(`Vite config: Running in ${isProduction ? 'production' : 'development'} mode`);
console.log(`Vite config: Running in ${isReplit ? 'Replit' : 'local'} environment`);

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
    // Optimize chunk sizes for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['wouter', '@tanstack/react-query']
        },
        // Add cache busting for production
        entryFileNames: isProduction ? 'assets/[name].[hash].js' : 'assets/[name].js',
        chunkFileNames: isProduction ? 'assets/[name].[hash].js' : 'assets/[name].js',
        assetFileNames: isProduction ? 'assets/[name].[hash].[ext]' : 'assets/[name].[ext]'
      }
    }
  },
  // Support path aliases from tsconfig
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, '../attached_assets'),
      '@shared': resolve(__dirname, '../shared'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@pages': resolve(__dirname, './src/pages'),
      '@lib': resolve(__dirname, './src/lib')
    },
  },
  // Make environment variables available to the client
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
    'import.meta.env.VITE_BASE_URL': JSON.stringify(baseUrl),
    'import.meta.env.VITE_IS_REPLIT': JSON.stringify(isReplit),
  },
});