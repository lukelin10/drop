import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import 'dotenv/config';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:5001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API routes (this also sets up authentication)
const server = registerRoutes(app);

// Start server
const PORT = process.env.PORT || 5000;
// @ts-ignore - Ignore typing issue with the port parameter
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});