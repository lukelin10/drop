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

// Start server
const PORT = process.env.PORT || 5000;
// @ts-ignore - Ignore typing issue with the port parameter
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});