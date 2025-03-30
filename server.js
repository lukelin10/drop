// Production server script
const express = require('express');
const path = require('path');
const process = require('process');
const fs = require('fs');

// Always run in production mode for deployment
const isProduction = true; // Force production mode for better reliability in Replit
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);

// Start the API server that handles authentication, data, etc.
require('./server/start.js');

// Create a static file server for production-built client assets
const staticApp = express();
const STATIC_PORT = process.env.STATIC_PORT || 4000; // Use port 4000 to avoid conflicts

// In production, serve the built files from client/dist
// In development, this server won't be used as Vite handles serving files
if (isProduction) {
  // Log details about available files for debugging
  console.log('Checking available static files:');
  
  // Check if assets directory exists
  const assetsDir = path.join(__dirname, 'client/dist/assets');
  if (fs.existsSync(assetsDir)) {
    console.log('- Assets directory exists');
    try {
      const files = fs.readdirSync(assetsDir);
      console.log(`- Found ${files.length} files in assets directory:`);
      files.forEach(file => console.log(`  - ${file}`));
    } catch (err) {
      console.error('Error reading assets directory:', err);
    }
  } else {
    console.log('- Assets directory does not exist');
  }
  
  // Verify individual files
  const indexPath = path.join(__dirname, 'client/dist/index.html');
  const staticIndexPath = path.join(__dirname, 'client/dist/index-static.html');
  const indexJsPath = path.join(__dirname, 'client/dist/assets/index.js');
  const indexCssPath = path.join(__dirname, 'client/dist/assets/index.css');
  
  console.log(`- index.html exists: ${fs.existsSync(indexPath)}`);
  console.log(`- index-static.html exists: ${fs.existsSync(staticIndexPath)}`);
  console.log(`- assets/index.js exists: ${fs.existsSync(indexJsPath)}`);
  console.log(`- assets/index.css exists: ${fs.existsSync(indexCssPath)}`);

  // Serve static assets with proper cache headers
  staticApp.use('/assets', express.static(path.join(__dirname, 'client/dist/assets'), {
    maxAge: '30d',
    immutable: true
  }));
  
  // Serve other static files with shorter cache
  staticApp.use(express.static(path.join(__dirname, 'client/dist'), {
    maxAge: '1d'
  }));
  
  // Explicitly serve all HTML files from both client and client/dist directories
  staticApp.get('/direct.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/direct.html'));
  });
  
  staticApp.get('/index-static.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index-static.html'));
  });
  
  staticApp.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
  
  // Special handler for static index to make it easy to access
  staticApp.get('/static', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index-static.html'));
  });

  // Handle all routes not caught by static serving
  staticApp.get('*', (req, res) => {
    // Check if the request is for an API route
    if (req.url.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // First try serving index-static.html if it exists
    const staticIndexPath = path.join(__dirname, 'client/dist/index-static.html');
    if (fs.existsSync(staticIndexPath)) {
      console.log(`Serving index-static.html for request: ${req.url}`);
      return res.sendFile(staticIndexPath);
    }
    
    // Fall back to the standard index.html
    console.log(`Serving index.html for request: ${req.url}`);
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });

  // Start static server
  staticApp.listen(STATIC_PORT, '0.0.0.0', () => {
    console.log(`Production static file server running on port ${STATIC_PORT}`);
    
    // Detect if running in Replit environment
    const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
    if (isReplit) {
      const replitDomain = process.env.REPL_SLUG ? 
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` :
        'your Replit URL';
      console.log(`   - Replit URL: ${replitDomain}`);
    }
    
    console.log('\nApplication paths:');
    console.log('- Main application: /');
    console.log('- Static version: /static');
    console.log('- Direct HTML version: /direct.html');
  });
} else {
  console.log('Static file server not started in development mode');
  console.log('Vite development server will handle serving client files');
}