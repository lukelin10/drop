// This script runs the development servers
const { spawn } = require('child_process');
const process = require('process');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuration
const API_PORT = process.env.PORT || 5000;
const VITE_PORT = 5001;
const PROXY_PORT = 3000;

// Detect if running in Replit environment
const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
const BASE_URL = process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : `http://localhost:${PROXY_PORT}`;

// Print useful debug information
console.log('Starting the Drop Journaling App in development mode...');
console.log(`Environment: ${isReplit ? 'Replit' : 'Local'}`);
console.log(`API server port: ${API_PORT}`);
console.log(`Vite dev server port: ${VITE_PORT}`);
console.log(`Public access URL: ${BASE_URL}`);

// Verify the existence of critical files
const clientDir = path.join(__dirname, 'client');
const clientIndexHtml = path.join(clientDir, 'index.html');
const mainTsx = path.join(clientDir, 'src', 'main.tsx');

console.log('\nChecking critical files:');
console.log(`client/index.html: ${fs.existsSync(clientIndexHtml) ? 'Found ✓' : 'MISSING ✗'}`);
console.log(`client/src/main.tsx: ${fs.existsSync(mainTsx) ? 'Found ✓' : 'MISSING ✗'}`);

// If direct.html exists, we have a workaround available
if (fs.existsSync(path.join(clientDir, 'direct.html'))) {
  console.log('direct.html: Found ✓ (Backup React implementation available)');
}

// Start the API server
require('./server/start.js');

// Configure Vite command based on environment
const viteArgs = [
  'vite', 
  '--port', VITE_PORT, 
  '--host', '0.0.0.0',
  'client'
];

// Start the client Vite dev server with detailed error reporting
const buildClient = spawn('npx', viteArgs, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    VITE_PORT: VITE_PORT.toString(),
    VITE_API_BASE_URL: BASE_URL, // Pass the API base URL to the frontend
    VITE_BASE_URL: BASE_URL,     // Pass the base URL to the frontend
    // Enable clientPort for HMR in Replit
    VITE_HMR_CLIENT_PORT: isReplit ? '443' : VITE_PORT.toString(),
    // Enable verbose logging
    DEBUG: 'vite:*',
    VITE_CJS_TRACE: '1'
  }
});

// Create a proxy server to handle both the API and Vite
console.log(`\nSetting up proxy server on port ${PROXY_PORT}...`);
const app = express();

// Proxy API requests to our API server
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
}));

// Special handler for our HTML files
app.get('/direct.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'direct.html'));
});

// Special handler for static index
app.get('/static', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index-static.html'));
});

// Test static page
app.get('/test-static', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'test-static.html'));
});

// Proxy all other requests to Vite
app.use('/', createProxyMiddleware({
  target: `http://localhost:${VITE_PORT}`,
  changeOrigin: true,
  ws: true, // Enable WebSocket proxy for HMR
}));

// Start the proxy server
app.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`Proxy server running at http://localhost:${PROXY_PORT}`);
});

// Handle client server crashes
buildClient.on('close', (code) => {
  if (code !== 0) {
    console.error(`\nClient development process exited with code ${code}`);
    console.error('This may indicate an issue with the Vite configuration or React application.');
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down development servers...');
  buildClient.kill();
  process.exit(0);
});