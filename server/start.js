require('esbuild-register');
require('dotenv').config();

// Set environment to development
process.env.NODE_ENV = 'development';

// In development, we want to import the app without starting the server
const app = require('./index.ts').default;

// Export the configured app
module.exports = app;