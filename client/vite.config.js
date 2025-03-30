import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Detect environment
const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
const isProduction = process.env.NODE_ENV === 'production';

// Determine the base URL for the API and assets
const replitUrl = isReplit && process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
  : '';
const baseUrl = process.env.VITE_BASE_URL || replitUrl || 'http://localhost:5000';
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
    // Allow all hosts to connect (critical for Replit)
    host: true,
    
    // Use default port 5173 unless specified
    port: parseInt(process.env.VITE_PORT || '5173', 10),
    
    // Full CORS support
    cors: true,
    
    // HMR configuration
    hmr: {
      // For Replit, use port 443 for WebSocket connections
      clientPort: isReplit ? 443 : undefined,
      
      // Use secure WebSockets in Replit
      protocol: isReplit ? 'wss' : 'ws',
    },
    
    // Force strict port usage (don't increment if port is in use)
    strictPort: true,
    
    // Allow access from all origins, needed for Replit
    origin: '*',
  },
  
  // Configure the build process
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: !isProduction,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['wouter', '@tanstack/react-query']
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  
  // Support path aliases
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
  
  // Environment variables
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
    'import.meta.env.VITE_BASE_URL': JSON.stringify(baseUrl),
    'import.meta.env.VITE_IS_REPLIT': JSON.stringify(isReplit),
  },
});