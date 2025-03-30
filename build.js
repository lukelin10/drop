// Production build script
const { spawn } = require('child_process');
const process = require('process');
const fs = require('fs');
const path = require('path');

console.log('Building Drop Journaling App for production...');

// Detect if running in Replit environment
const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
const BASE_URL = process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
  : 'http://localhost:3000';

// Ensure the dist directory exists
const clientDistDir = path.join(__dirname, 'client', 'dist');
if (!fs.existsSync(clientDistDir)) {
  fs.mkdirSync(clientDistDir, { recursive: true });
}

// Run the Vite build
console.log('\nBuilding frontend with Vite...');
console.log(`Base URL: ${BASE_URL}`);

const buildProcess = spawn('npx', ['vite', 'build', 'client'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    VITE_API_BASE_URL: BASE_URL,
    VITE_BASE_URL: BASE_URL,
  }
});

buildProcess.on('close', (code) => {
  console.log(`Vite build process exited with code ${code}`);
  
  if (code !== 0) {
    console.error('Build failed. Please check the errors above.');
    process.exit(code);
  }
  
  // List all files in the dist directory for verification
  console.log('\nVerifying build contents:');
  try {
    const distFiles = fs.readdirSync(clientDistDir);
    console.log('Files in dist directory:');
    distFiles.forEach(file => console.log(`- ${file}`));
    
    const assetsDir = path.join(clientDistDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const assetFiles = fs.readdirSync(assetsDir);
      console.log('\nFiles in assets directory:');
      assetFiles.forEach(file => console.log(`- ${file}`));
    }
  } catch (err) {
    console.error('Error listing directory contents:', err.message);
  }
  
  console.log('\nBuild process completed successfully!');
  console.log('To run the production server, use: NODE_ENV=production node server.js');
});