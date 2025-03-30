import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import 'dotenv/config';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API routes (this also sets up authentication)
const server = registerRoutes(app);

// In development mode, we'll start the server in dev.js
// In production mode, we'll start the server in server.js
// This approach avoids having multiple HTTP servers listening on different ports
if (process.env.NODE_ENV !== 'development') {
  const PORT = parseInt(process.env.PORT || '3000', 10);
  server.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
} else {
  console.log('API routes registered for development use');
}

// Export the app for use in dev.js and server.js
export default app;