// This script runs the development servers
const { spawn } = require('child_process');
const process = require('process');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuration - Use port 5000 for Replit's public facing port
const REPLIT_PORT = 5000;
const VITE_PORT = process.env.VITE_PORT || 5173;
const SERVER_PORT = process.env.PORT || REPLIT_PORT;

// Set NODE_ENV to development to ensure we're in development mode
process.env.NODE_ENV = 'development';

// Detect if running in Replit environment
const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
const BASE_URL = process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
  : `http://localhost:${SERVER_PORT}`;

// Print useful debug information
console.log('Starting the Drop Journaling App in development mode...');
console.log(`Environment: ${isReplit ? 'Replit' : 'Local'}`);
console.log(`Server port: ${SERVER_PORT}`);
console.log(`Base URL: ${BASE_URL}`);

// Get the configured API server from server/start.js
const apiApp = require('./server/start.js');

// Create a main development server
const app = express();

// Use API routes
app.use('/api', apiApp);

// Serve static assets from build directory in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
}

// Start the Vite dev server in development
if (process.env.NODE_ENV !== 'production') {
  const { spawn } = require('child_process');
  
  console.log('Starting Vite development server...');
  // Start the Vite server as a separate process on port 5173
  const viteProcess = spawn('npx', ['vite', 'client', '--host', '0.0.0.0', '--port', VITE_PORT], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      VITE_API_BASE_URL: BASE_URL,
      VITE_BASE_URL: BASE_URL
    }
  });
  
  // Create a proxy to the Vite dev server for all non-API requests
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${VITE_PORT}`,
    changeOrigin: true,
    ws: true,
    logLevel: 'warn'
  }));
  
  // Handle Vite process exit
  viteProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Vite process exited with code ${code}`);
    }
    process.exit(code);
  });
  
  // Ensure Vite process is killed on exit
  process.on('exit', () => {
    viteProcess.kill();
  });
}

// Start the unified server
app.listen(SERVER_PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${SERVER_PORT}`);
  if (isReplit) {
    console.log(`Replit URL: ${BASE_URL}`);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});