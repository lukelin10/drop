// This script runs the server
const { spawn } = require('child_process');
const process = require('process');

console.log('Starting the Drop Journaling App in development mode...');
console.log('Main server: http://localhost:5000');
console.log('Vite dev server: http://localhost:5001');

// Start the server
require('./server/start.js');

// Start the client in development mode with a better error handling
const buildClient = spawn('npx', ['vite', '--port', '5001', '--host', '0.0.0.0', 'client'], {
  stdio: 'inherit',
  shell: true
});

buildClient.on('close', (code) => {
  console.log(`Client development process exited with code ${code}`);
  if (code !== 0) {
    console.error('Vite development server crashed. Trying to restart...');
    // Wait a bit and then restart the client process
    setTimeout(() => {
      const restartClient = spawn('npx', ['vite', '--port', '5001', '--host', '0.0.0.0', 'client'], {
        stdio: 'inherit',
        shell: true
      });
      
      restartClient.on('close', (code) => {
        console.log(`Restarted client process exited with code ${code}`);
        if (code !== 0) {
          console.error('Client development server failed to restart. Please check for errors.');
        }
      });
    }, 3000);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down development servers...');
  buildClient.kill();
  setTimeout(() => {
    process.exit(0);
  }, 500);
});