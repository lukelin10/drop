// This script runs the server
const { spawn } = require('child_process');

// Start the server
require('./server/start.js');

// Start the client in development mode
const buildClient = spawn('npx', ['vite', '--port', '5001', 'client'], {
  stdio: 'inherit',
  shell: true
});

buildClient.on('close', (code) => {
  console.log(`Client development process exited with code ${code}`);
});