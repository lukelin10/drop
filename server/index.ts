import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import 'dotenv/config';
import { setupAuth } from './auth';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up authentication
setupAuth(app);

// Register API routes
const server = registerRoutes(app);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});