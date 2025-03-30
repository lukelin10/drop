// This script runs the development servers
const { spawn } = require('child_process');
const process = require('process');
const fs = require('fs');
const path = require('path');

// Configuration
const API_PORT = 5000;
const VITE_PORT = 5001;

// Print useful debug information
console.log('Starting the Drop Journaling App in development mode...');
console.log(`API server: http://localhost:${API_PORT}`);
console.log(`Vite dev server: http://localhost:${VITE_PORT}`);

// Verify the existence of critical files
const clientDir = path.join(__dirname, 'client');
const clientIndexHtml = path.join(clientDir, 'index.html');
const mainTsx = path.join(clientDir, 'src', 'main.tsx');

console.log('\nChecking critical files:');
console.log(`client/index.html: ${fs.existsSync(clientIndexHtml) ? 'Found ✓' : 'MISSING ✗'}`);
console.log(`client/src/main.tsx: ${fs.existsSync(mainTsx) ? 'Found ✓' : 'MISSING ✗'}`);

// Start the API server
require('./server/start.js');

// Start the client Vite dev server with detailed error reporting
const buildClient = spawn('npx', ['vite', '--port', VITE_PORT, '--host', '0.0.0.0', 'client'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // Enable verbose logging
    DEBUG: 'vite:*',
    VITE_CJS_TRACE: '1'
  }
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