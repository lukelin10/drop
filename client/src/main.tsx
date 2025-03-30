import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add extra debugging code
console.log('main.tsx is executing');
console.log('Looking for #root element...');
const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (rootElement) {
  console.log('Creating React root and rendering app...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered successfully');
} else {
  console.error('Could not find root element to mount React app');
  // Create a fallback element if the root doesn't exist
  const fallback = document.createElement('div');
  fallback.innerHTML = `
    <div style="padding: 20px; margin: 20px; border: 2px solid red; background: #fff9f9;">
      <h1>Error: React Root Not Found</h1>
      <p>The application could not find the root element to mount the React application.</p>
      <p>This might be due to an issue with the HTML structure.</p>
    </div>
  `;
  document.body.appendChild(fallback);
}