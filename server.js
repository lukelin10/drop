// Production server script
const express = require('express');
const path = require('path');
const process = require('process');

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
  // Serve static files from the client/dist directory
  staticApp.use(express.static(path.join(__dirname, 'client/dist')));

  // Handle all routes not caught by static serving - return the index.html
  staticApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });

  // Start static server
  staticApp.listen(STATIC_PORT, '0.0.0.0', () => {
    console.log(`Production static file server running on port ${STATIC_PORT}`);
  });
} else {
  console.log('Static file server not started in development mode');
  console.log('Vite development server will handle serving client files');
}