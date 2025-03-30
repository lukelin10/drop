import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Create a simple App component directly in main.tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Drop - Journal App</h1>
        <p className="text-gray-600 mb-6">Your daily reflection companion</p>
        <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
          <p className="text-sm text-blue-800">
            Simple version for debugging - {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple mount with error handling
console.log('[main] Mounting React application...');
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('[main] React application mounted successfully');
} else {
  console.error('[main] Could not find root element (#root) to mount React app');
  document.body.innerHTML = `
    <div style="padding: 20px; margin: 20px; border: 2px solid red; background: #fff9f9;">
      <h1>Error: React Root Not Found</h1>
      <p>The application could not find the root element to mount the React application.</p>
    </div>
  `;
}