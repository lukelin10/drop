// This file declares global types for the Express Request object
import { User } from '../shared/schema';

declare global {
  namespace Express {
    // Add the user property to the Request interface
    interface Request {
      user?: User;
    }
  }
}