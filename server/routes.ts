import { Router } from 'express';
import { storage } from './storage';
import { 
  insertUserSchema, 
  insertJournalEntrySchema, 
  insertConversationSchema, 
  insertMessageSchema,
  insertTagSchema
} from '../shared/schema';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';

// Authentication middleware
const authenticate = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    const user = await storage.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
router.post('/auth/register', async (req, res) => {
  try {
    const registerSchema = insertUserSchema.extend({
      password: z.string().min(8),
    }).omit({ passwordHash: true });
    
    const userData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const newUser = await storage.createUser({
      ...userData,
      passwordHash,
    });
    
    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        preferredTheme: newUser.preferredTheme,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });
    
    const credentials = loginSchema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByEmail(credentials.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await storage.updateUser(user.id, { lastLogin: new Date() });
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        preferredTheme: user.preferredTheme,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// User Routes
router.get('/users/me', authenticate, async (req: any, res) => {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      email: user.email,
      preferredTheme: user.preferredTheme,
      notificationPreferences: JSON.parse(user.notificationPreferences),
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/me', authenticate, async (req: any, res) => {
  try {
    const updateSchema = z.object({
      preferredTheme: z.enum(['cozy', 'midnight', 'sunset']).optional(),
      notificationPreferences: z.record(z.boolean()).optional(),
    });
    
    const updateData = updateSchema.parse(req.body);
    let dataToUpdate: any = {};
    
    if (updateData.preferredTheme) {
      dataToUpdate.preferredTheme = updateData.preferredTheme;
    }
    
    if (updateData.notificationPreferences) {
      dataToUpdate.notificationPreferences = JSON.stringify(updateData.notificationPreferences);
    }
    
    const updatedUser = await storage.updateUser(req.user.id, dataToUpdate);
    
    res.json({
      id: updatedUser!.id,
      email: updatedUser!.email,
      preferredTheme: updatedUser!.preferredTheme,
      notificationPreferences: JSON.parse(updatedUser!.notificationPreferences),
      createdAt: updatedUser!.createdAt,
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Prompts Routes
router.get('/prompts/today', authenticate, async (req, res) => {
  try {
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let prompt = await storage.getPromptForDate(todayDateOnly);
    
    // If no prompt for today, get the latest active prompt
    if (!prompt) {
      const activePrompts = await storage.getActivePrompts();
      prompt = activePrompts.sort((a, b) => 
        b.activeDate.getTime() - a.activeDate.getTime()
      )[0] || null;
    }
    
    if (!prompt) {
      return res.status(404).json({ error: 'No prompt available for today' });
    }
    
    res.json(prompt);
  } catch (error) {
    console.error('Get today prompt error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Journal Entries Routes
router.post('/journal/entries', authenticate, async (req: any, res) => {
  try {
    const entrySchema = insertJournalEntrySchema.extend({
      userId: z.number().optional(), // We'll set this from the authenticated user
    });
    
    const entryData = entrySchema.parse(req.body);
    
    // Set the user ID from the authenticated user
    entryData.userId = req.user.id;
    
    // Ensure entry date is today if not specified
    if (!entryData.entryDate) {
      const today = new Date();
      entryData.entryDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
    
    // Check if user already has an entry for this date
    const existingEntry = await storage.getJournalEntryByUserAndDate(
      req.user.id,
      entryData.entryDate
    );
    
    if (existingEntry) {
      return res.status(400).json({ error: 'You already have a journal entry for this date' });
    }
    
    const newEntry = await storage.createJournalEntry(entryData);
    
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Create journal entry error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/journal/entries', authenticate, async (req: any, res) => {
  try {
    const entries = await storage.getJournalEntriesByUserId(req.user.id);
    res.json(entries);
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/journal/entries/:id', authenticate, async (req: any, res) => {
  try {
    const entryId = parseInt(req.params.id);
    const entry = await storage.getJournalEntryById(entryId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Ensure user can only access their own entries
    if (entry.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to this entry' });
    }
    
    // Get tags for the entry
    const tags = await storage.getTagsByJournalEntryId(entryId);
    
    res.json({
      ...entry,
      tags,
    });
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/journal/entries/:id', authenticate, async (req: any, res) => {
  try {
    const entryId = parseInt(req.params.id);
    const entry = await storage.getJournalEntryById(entryId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Ensure user can only update their own entries
    if (entry.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to this entry' });
    }
    
    const updateSchema = z.object({
      moodScore: z.number().min(1).max(10).optional(),
      isFavorite: z.boolean().optional(),
    });
    
    const updateData = updateSchema.parse(req.body);
    const updatedEntry = await storage.updateJournalEntry(entryId, updateData);
    
    res.json(updatedEntry);
  } catch (error) {
    console.error('Update journal entry error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Conversations Routes
router.post('/journal/entries/:entryId/conversations', authenticate, async (req: any, res) => {
  try {
    const entryId = parseInt(req.params.entryId);
    const entry = await storage.getJournalEntryById(entryId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Ensure user can only create conversations for their own entries
    if (entry.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to this entry' });
    }
    
    // Check if a conversation already exists for this entry
    const existingConversation = await storage.getConversationByJournalEntryId(entryId);
    if (existingConversation) {
      return res.status(400).json({ error: 'A conversation already exists for this entry' });
    }
    
    const conversationData: any = {
      journalEntryId: entryId,
    };
    
    const newConversation = await storage.createConversation(conversationData);
    
    // Add the initial message from the assistant
    const initialMessage = {
      conversationId: newConversation.id,
      senderType: 'assistant',
      content: `Let's reflect on your response: "${entry.initialResponse}"`,
      sequenceOrder: 1,
    };
    
    await storage.createMessage(initialMessage);
    
    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/journal/entries/:entryId/conversations', authenticate, async (req: any, res) => {
  try {
    const entryId = parseInt(req.params.entryId);
    const entry = await storage.getJournalEntryById(entryId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Ensure user can only access conversations for their own entries
    if (entry.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to this entry' });
    }
    
    const conversation = await storage.getConversationByJournalEntryId(entryId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found for this entry' });
    }
    
    const messages = await storage.getMessagesByConversationId(conversation.id);
    
    res.json({
      ...conversation,
      messages,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Messages Routes
router.post('/journal/entries/:entryId/conversations/messages', authenticate, async (req: any, res) => {
  try {
    const entryId = parseInt(req.params.entryId);
    const entry = await storage.getJournalEntryById(entryId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Ensure user can only add messages to their own entries' conversations
    if (entry.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to this entry' });
    }
    
    const conversation = await storage.getConversationByJournalEntryId(entryId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found for this entry' });
    }
    
    const messageSchema = insertMessageSchema.extend({
      conversationId: z.number().optional(), // We'll set this from the conversation
      senderType: z.enum(['user', 'assistant']),
      sequenceOrder: z.number().optional(), // We'll calculate this
    });
    
    const messageData = messageSchema.parse(req.body);
    
    // Set the conversation ID
    messageData.conversationId = conversation.id;
    
    // Get the current highest sequence order
    const existingMessages = await storage.getMessagesByConversationId(conversation.id);
    const highestSequence = existingMessages.reduce(
      (max, msg) => Math.max(max, msg.sequenceOrder),
      0
    );
    
    // Set the sequence order to the next available
    messageData.sequenceOrder = highestSequence + 1;
    
    const newMessage = await storage.createMessage(messageData);
    
    // If the message is from the user, we need to get an AI response
    if (messageData.senderType === 'user') {
      // Note: In a real implementation, we would call the Anthropic API here
      // For now, we'll add a placeholder AI response
      const aiResponseData = {
        conversationId: conversation.id,
        senderType: 'assistant',
        content: `I'm here to help you reflect on your thoughts. Tell me more about how you're feeling.`,
        sequenceOrder: highestSequence + 2,
      };
      
      await storage.createMessage(aiResponseData);
    }
    
    // Return the updated messages
    const updatedMessages = await storage.getMessagesByConversationId(conversation.id);
    
    res.status(201).json(updatedMessages);
  } catch (error) {
    console.error('Add message error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Tags Routes
router.get('/tags', authenticate, async (req, res) => {
  try {
    const tags = await storage.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/journal/entries/:entryId/tags', authenticate, async (req: any, res) => {
  try {
    const entryId = parseInt(req.params.entryId);
    const entry = await storage.getJournalEntryById(entryId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Ensure user can only add tags to their own entries
    if (entry.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to this entry' });
    }
    
    const tagSchema = z.object({
      name: z.string().min(1).max(100),
      source: z.enum(['user', 'system', 'ai']).default('user'),
      confidenceScore: z.number().min(0).max(1).optional(),
    });
    
    const tagData = tagSchema.parse(req.body);
    
    // Check if tag already exists
    let tag = await storage.getTagByName(tagData.name);
    
    // If not, create it
    if (!tag) {
      tag = await storage.createTag({
        name: tagData.name,
        isSystem: tagData.source === 'system',
      });
    }
    
    // Add the tag to the entry
    await storage.addTagToEntry({
      journalEntryId: entryId,
      tagId: tag.id,
      source: tagData.source,
      confidenceScore: tagData.confidenceScore,
    });
    
    // Get all tags for the entry
    const tags = await storage.getTagsByJournalEntryId(entryId);
    
    res.status(201).json(tags);
  } catch (error) {
    console.error('Add tag error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;