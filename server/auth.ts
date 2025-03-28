import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import { User } from '@shared/schema';

// Extend Express User type
declare global {
  namespace Express {
    interface User extends Omit<User, 'passwordHash'> {}
  }
}

const scryptAsync = promisify(scrypt);

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Helper function to compare passwords
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const [hashedPasswordValue, salt] = hashedPassword.split('.');
  const hashedPasswordBuf = Buffer.from(hashedPasswordValue, 'hex');
  const suppliedPasswordBuf = (await scryptAsync(plainPassword, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

// Setup authentication middleware
export function setupAuth(app: Express) {
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'drop-journal-session-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  };

  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy for email/password authentication
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: 'Incorrect email or password.' });
          }

          const isPasswordValid = await comparePasswords(password, user.passwordHash);
          if (!isPasswordValid) {
            return done(null, false, { message: 'Incorrect email or password.' });
          }

          // Update last login time
          await storage.updateUser(user.id, { lastLogin: new Date() });

          // Return user without passwordHash
          const { passwordHash, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword as Express.User);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, (user as Express.User).id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      if (!user) {
        return done(null, false);
      }
      const { passwordHash, ...userWithoutPassword } = user;
      done(null, userWithoutPassword as Express.User);
    } catch (error) {
      done(error);
    }
  });

  // Register route
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, preferredTheme } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create new user
      const user = await storage.createUser({
        email,
        passwordHash,
        preferredTheme: preferredTheme || 'cozy',
        notificationPreferences: '{}'
      });

      // Log in the user
      req.login(
        { 
          id: user.id, 
          email: user.email, 
          preferredTheme: user.preferredTheme,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin,
          notificationPreferences: user.notificationPreferences
        }, 
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Login after registration failed' });
          }
          return res.status(201).json(req.user);
        }
      );
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Could not create user' });
    }
  });

  // Login route
  app.post('/api/auth/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Authentication failed' });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout route
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  // Get current user
  app.get('/api/auth/user', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.status(200).json(req.user);
  });
}

// Authentication middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
}