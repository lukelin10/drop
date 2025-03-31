import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Immediately log startup for debugging
console.log('[main] React initialization starting...');

// Enhanced error handling
try {
  // Find our root element
  console.log('[main] Finding root element...');
  const rootElement = document.getElementById('root');
  console.log('[main] Root element found?', !!rootElement);

  if (rootElement) {
    // Create and render
    console.log('[main] Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    
    console.log('[main] Rendering application...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('[main] React application rendered successfully');
  } else {
    // Root element not found
    console.error('[main] Could not find root element (#root) to mount React app');
    
    // Add a visible error message by creating a new element
    const errorElement = document.createElement('div');
    errorElement.style.padding = '20px';
    errorElement.style.margin = '20px';
    errorElement.style.border = '2px solid red';
    errorElement.style.background = '#fff9f9';
    errorElement.innerHTML = `
      <h1>Error: React Root Not Found</h1>
      <p>The application could not find the root element to mount the React application.</p>
    `;
    document.body.appendChild(errorElement);
  }
} catch (error) {
  // Catch any errors during initialization
  console.error('[main] Critical error during React initialization:', error);
  
  // Add a visible error message to the page
  document.body.innerHTML += `
    <div style="padding: 20px; margin: 20px; border: 2px solid red; background: #fff9f9;">
      <h1>Critical React Error</h1>
      <p>Something went wrong while initializing React:</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}