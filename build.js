// Production build script
const { spawn } = require('child_process');
const process = require('process');
const fs = require('fs');
const path = require('path');

console.log('Building Drop Journaling App for production...');

// Detect if running in Replit environment
const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
const BASE_URL = process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:3000';

// Ensure the dist directory exists
const clientDistDir = path.join(__dirname, 'client', 'dist');
if (!fs.existsSync(clientDistDir)) {
  fs.mkdirSync(clientDistDir, { recursive: true });
}

// Create an assets directory
const assetsDir = path.join(clientDistDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
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
  if (code !== 0) {
    console.error(`\nBuild process exited with code ${code}`);
    process.exit(code);
  }
  
  console.log('\nBuild completed successfully!');
  
  // Copy our static HTML file to the dist directory
  console.log('\nCopying static HTML file to dist directory...');
  fs.copyFileSync(
    path.join(__dirname, 'client', 'index-static.html'),
    path.join(clientDistDir, 'index-static.html')
  );
  
  // Create a simple production-ready index.html that redirects to index-static.html
  const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=/index-static.html">
  <title>Drop Journal</title>
</head>
<body>
  <p>Redirecting to <a href="/index-static.html">app</a>...</p>
</body>
</html>`;

  fs.writeFileSync(path.join(clientDistDir, 'index.html'), redirectHtml);
  
  console.log('To run the production server, use: NODE_ENV=production node server.js');
});