// This script runs the development servers
const { spawn } = require('child_process');
const process = require('process');

// Configuration
const API_PORT = 5000;
const VITE_PORT = 5001;

console.log('Starting the Drop Journaling App in development mode...');
console.log(`API server: http://localhost:${API_PORT}`);
console.log(`Vite dev server: http://localhost:${VITE_PORT}`);

// Start the API server
require('./server/start.js');

// Start the client Vite dev server
const buildClient = spawn('npx', ['vite', '--port', VITE_PORT, '--host', '0.0.0.0', 'client'], {
  stdio: 'inherit',
  shell: true
});

// Handle client server crashes
buildClient.on('close', (code) => {
  if (code !== 0) {
    console.error(`Client development process exited with code ${code}`);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down development servers...');
  buildClient.kill();
  process.exit(0);
});