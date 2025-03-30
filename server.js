// Production server script
const express = require('express');
const path = require('path');
const process = require('process');
const fs = require('fs');

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);

// Start the API server that handles authentication, data, etc.
require('./server/start.js');

// Create a static file server for production-built client assets
const staticApp = express();
const STATIC_PORT = process.env.STATIC_PORT || 3000;

// In production, serve the built files from client/dist
// In development, this server won't be used as Vite handles serving files
if (isProduction) {
  // Serve static assets with proper cache headers
  staticApp.use('/assets', express.static(path.join(__dirname, 'client/dist/assets'), {
    maxAge: '30d',
    immutable: true
  }));
  
  // Serve other static files with shorter cache
  staticApp.use(express.static(path.join(__dirname, 'client/dist'), {
    maxAge: '1d'
  }));
  
  // Direct HTML access routes
  staticApp.get('/direct.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/direct.html'));
  });
  
  // Special handler for static index
  staticApp.get('/static', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index-static.html'));
  });

  // Test static page
  staticApp.get('/test-static', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/test-static.html'));
  });
  
  // Standalone app (fully working with in-browser React)
  staticApp.get('/standalone', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/standalone.html'));
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
      return res.sendFile(staticIndexPath);
    }
    
    // Fall back to the standard index.html
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });

  // Start static server
  staticApp.listen(STATIC_PORT, '0.0.0.0', () => {
    console.log(`Production static file server running on port ${STATIC_PORT}`);
    
    // Detect if running in Replit environment
    const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
    if (isReplit && process.env.REPL_SLUG) {
      console.log(`   - Replit URL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    }
  });
} else {
  console.log('Static file server not started in development mode');
  console.log('Vite development server will handle serving client files');
}