// Production build script
const { spawn } = require('child_process');
const process = require('process');
const fs = require('fs');
const path = require('path');

console.log('Building Drop Journaling App for production...');

// Ensure the dist directory exists
const clientDistDir = path.join(__dirname, 'client', 'dist');
if (!fs.existsSync(clientDistDir)) {
  fs.mkdirSync(clientDistDir, { recursive: true });
}

// Run the Vite build
console.log('\nBuilding frontend with Vite...');
const buildProcess = spawn('npx', ['vite', 'build', 'client'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
  }
});

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`\nBuild process exited with code ${code}`);
    process.exit(code);
  }
  
  console.log('\nBuild completed successfully!');
  console.log('To run the production server, use: NODE_ENV=production node server.js');
});