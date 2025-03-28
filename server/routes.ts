import { Express, Request, Response } from 'express';
import { createServer, type Server } from 'http';
import { isAuthenticated, setupAuth } from './auth';
import { storage } from './storage';
import { aiService } from './ai-service';
import { z } from 'zod';
import {
  insertJournalEntrySchema,
  insertConversationSchema,
  insertMessageSchema,
  insertTagSchema,
  insertEntryTagSchema
} from '../shared/schema';

export function registerRoutes(app: Express): Server {
  // Setup authentication
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // User profile endpoint
  app.get('/api/users/me', isAuthenticated, async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    return res.json(user);
  });
  
  // Update user profile
  app.patch('/api/users/me', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Create a schema for updating user profile
    const updateUserSchema = z.object({
      preferredTheme: z.enum(['cozy', 'midnight', 'sunset']).optional(),
      notificationPreferences: z.string().optional()
    });
    
    try {
      const validatedData = updateUserSchema.parse(req.body);
      
      // Update the user
      const updatedUser = await storage.updateUser(req.user.id, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove passwordHash from the response
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      return res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.format() });
      }
      console.error('Error updating user:', error);
      return res.status(500).json({ message: 'Error updating user' });
    }
  });
  
  // Get today's prompt
  app.get('/api/prompts/today', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const today = new Date();
      const prompt = await storage.getPromptForDate(today);
      
      if (!prompt) {
        // If no specific prompt for today, return a default prompt
        return res.json({
          id: 0,
          text: "What's something you're looking forward to?",
          activeDate: today.toISOString().split('T')[0],
          isActive: true
        });
      }
      
      return res.json(prompt);
    } catch (error) {
      console.error('Error fetching today\'s prompt:', error);
      return res.status(500).json({ message: 'Error fetching prompt' });
    }
  });
  
  // Create a journal entry
  app.post('/api/journal/entries', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      // Validate the request body
      const validatedData = insertJournalEntrySchema.parse({
        ...req.body,
        userId: req.user.id,
        entryDate: req.body.entryDate || new Date().toISOString().split('T')[0]
      });
      
      // Check if the user already has an entry for this date
      const existingEntry = await storage.getJournalEntryByUserAndDate(
        req.user.id,
        new Date(validatedData.entryDate)
      );
      
      if (existingEntry) {
        return res.status(409).json({ 
          message: 'Entry already exists for this date',
          entry: existingEntry
        });
      }
      
      // Create the entry
      const newEntry = await storage.createJournalEntry(validatedData);
      
      // Analyze the entry text for tags
      const extractedTags = await aiService.analyzeTags(validatedData.initialResponse);
      
      // Create tags and associate them with the entry
      for (const tagData of extractedTags) {
        // Check if the tag already exists
        let tag = await storage.getTagByName(tagData.name);
        
        // If not, create it
        if (!tag) {
          tag = await storage.createTag({
            name: tagData.name,
            description: '',
            isSystem: true
          });
        }
        
        // Associate the tag with the entry
        await storage.addTagToEntry({
          journalEntryId: newEntry.id,
          tagId: tag.id,
          source: 'ai',
          confidenceScore: tagData.confidenceScore
        });
      }
      
      return res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.format() });
      }
      console.error('Error creating journal entry:', error);
      return res.status(500).json({ message: 'Error creating journal entry' });
    }
  });
  
  // Get all journal entries for the authenticated user
  app.get('/api/journal/entries', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const entries = await storage.getJournalEntriesByUserId(req.user.id);
      return res.json(entries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return res.status(500).json({ message: 'Error fetching journal entries' });
    }
  });
  
  // Get a specific journal entry
  app.get('/api/journal/entries/:id', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }
      
      // Ensure the entry belongs to the authenticated user
      if (entry.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      return res.json(entry);
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      return res.status(500).json({ message: 'Error fetching journal entry' });
    }
  });
  
  // Update a journal entry
  app.patch('/api/journal/entries/:id', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }
      
      // Ensure the entry belongs to the authenticated user
      if (entry.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Define the schema for updating a journal entry
      const updateEntrySchema = z.object({
        initialResponse: z.string().optional(),
        moodScore: z.number().min(1).max(10).optional(),
        isFavorite: z.boolean().optional()
      });
      
      // Validate the request body
      const validatedData = updateEntrySchema.parse(req.body);
      
      // Update the entry
      const updatedEntry = await storage.updateJournalEntry(entryId, validatedData);
      
      // If the content was updated, reanalyze tags
      if (validatedData.initialResponse) {
        const extractedTags = await aiService.analyzeTags(validatedData.initialResponse);
        
        // Create tags and associate them with the entry
        for (const tagData of extractedTags) {
          // Check if the tag already exists
          let tag = await storage.getTagByName(tagData.name);
          
          // If not, create it
          if (!tag) {
            tag = await storage.createTag({
              name: tagData.name,
              description: '',
              isSystem: true
            });
          }
          
          // Associate the tag with the entry
          await storage.addTagToEntry({
            journalEntryId: entryId,
            tagId: tag.id,
            source: 'ai',
            confidenceScore: tagData.confidenceScore
          });
        }
      }
      
      return res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.format() });
      }
      console.error('Error updating journal entry:', error);
      return res.status(500).json({ message: 'Error updating journal entry' });
    }
  });
  
  // Create a conversation for a journal entry
  app.post('/api/journal/entries/:entryId/conversations', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const entryId = parseInt(req.params.entryId);
      const entry = await storage.getJournalEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }
      
      // Ensure the entry belongs to the authenticated user
      if (entry.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if a conversation already exists for this entry
      const existingConversation = await storage.getConversationByJournalEntryId(entryId);
      if (existingConversation) {
        return res.status(409).json({ 
          message: 'Conversation already exists for this entry',
          conversation: existingConversation
        });
      }
      
      // Create the conversation
      const newConversation = await storage.createConversation({
        journalEntryId: entryId
      });
      
      // Create the first AI message based on the journal entry
      const aiResponse = await aiService.generateResponse(
        `I just responded to the journal prompt "What's something you're looking forward to?" with this: "${entry.initialResponse}"`,
        []
      );
      
      // Save the AI message
      await storage.createMessage({
        conversationId: newConversation.id,
        content: aiResponse,
        role: 'assistant',
        sequenceOrder: 1
      });
      
      return res.status(201).json(newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      return res.status(500).json({ message: 'Error creating conversation' });
    }
  });
  
  // Get a conversation for a journal entry
  app.get('/api/journal/entries/:entryId/conversations', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const entryId = parseInt(req.params.entryId);
      const entry = await storage.getJournalEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }
      
      // Ensure the entry belongs to the authenticated user
      if (entry.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Get the conversation
      const conversation = await storage.getConversationByJournalEntryId(entryId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      // Get the messages for the conversation
      const messages = await storage.getMessagesByConversationId(conversation.id);
      
      return res.json({
        conversation,
        messages
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return res.status(500).json({ message: 'Error fetching conversation' });
    }
  });
  
  // Add a message to a conversation
  app.post('/api/journal/entries/:entryId/conversations/messages', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const entryId = parseInt(req.params.entryId);
      const entry = await storage.getJournalEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }
      
      // Ensure the entry belongs to the authenticated user
      if (entry.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Get the conversation
      const conversation = await storage.getConversationByJournalEntryId(entryId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      // Validate the request body
      const messageSchema = z.object({
        content: z.string().min(1),
      });
      
      const validatedData = messageSchema.parse(req.body);
      
      // Get the current messages for the conversation
      const messages = await storage.getMessagesByConversationId(conversation.id);
      
      // Create the user message
      const userMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: validatedData.content,
        role: 'user',
        sequenceOrder: messages.length + 1
      });
      
      // Format the conversation history for the AI
      const conversationHistory = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      
      // Add the new user message
      conversationHistory.push({
        role: 'user',
        content: validatedData.content
      });
      
      // Generate the AI response
      const aiResponse = await aiService.generateResponse('', conversationHistory);
      
      // Create the AI message
      const aiMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: aiResponse,
        role: 'assistant',
        sequenceOrder: messages.length + 2
      });
      
      // Check if we need to update the conversation summary
      if (messages.length >= 10 && !conversation.summary) {
        const summary = await aiService.generateSummary(conversationHistory.concat([{
          role: 'assistant',
          content: aiResponse
        }]));
        
        await storage.updateConversation(conversation.id, { summary });
      }
      
      return res.status(201).json({
        userMessage,
        aiMessage
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.format() });
      }
      console.error('Error creating message:', error);
      return res.status(500).json({ message: 'Error creating message' });
    }
  });
  
  // Get all tags
  app.get('/api/tags', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const tags = await storage.getAllTags();
      return res.json(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      return res.status(500).json({ message: 'Error fetching tags' });
    }
  });
  
  // Get journal entries by tag
  app.get('/api/tags/:tagId/entries', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const tagId = parseInt(req.params.tagId);
      const tag = await storage.getTagById(tagId);
      
      if (!tag) {
        return res.status(404).json({ message: 'Tag not found' });
      }
      
      const entries = await storage.getJournalEntriesByTagId(tagId);
      
      // Filter entries to only include those belonging to the authenticated user
      const userEntries = entries.filter(entry => entry.userId === req.user!.id);
      
      return res.json({
        tag,
        entries: userEntries
      });
    } catch (error) {
      console.error('Error fetching entries by tag:', error);
      return res.status(500).json({ message: 'Error fetching entries' });
    }
  });
  
  return httpServer;
}