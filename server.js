// Production server script
const express = require('express');
const path = require('path');
const process = require('process');
const fs = require('fs');

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Starting server in ${isProduction ? 'production' : 'development'} mode`);

// Start the API server (this doesn't start its own HTTP server)
require('./server/start.js');

// Create a unified server for both API and static files
const app = express();
const PORT = process.env.PORT || 3000;

// In production mode, serve the built files from client/dist
if (isProduction) {
  console.log('Serving static files from client/dist');
  
  // Serve static assets with proper cache headers
  app.use('/assets', express.static(path.join(__dirname, 'client/dist/assets'), {
    maxAge: '30d',
    immutable: true
  }));
  
  // Serve other static files with shorter cache
  app.use(express.static(path.join(__dirname, 'client/dist'), {
    maxAge: '1d'
  }));

  // Handle client-side routing by serving index.html for any non-API/non-asset routes
  app.get('*', (req, res, next) => {
    // Skip API routes and let the API handlers handle them
    if (req.url.startsWith('/api/')) {
      return next();
    }
    
    // Skip asset routes that should be handled by express.static
    if (req.url.startsWith('/assets/')) {
      return next();
    }
    
    console.log(`Serving SPA for route: ${req.url}`);
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

// Start the unified server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  
  // Detect if running in Replit environment
  const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
  if (isReplit) {
    const replitDomain = process.env.REPL_SLUG ? 
      `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` :
      'your Replit URL';
    console.log(`Application URL: ${replitDomain}`);
  } else {
    console.log(`Application URL: http://localhost:${PORT}`);
  }
});