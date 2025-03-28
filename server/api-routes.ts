import { Router, Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { aiService } from './ai-service';
import { 
  insertUserSchema, 
  insertJournalEntrySchema, 
  insertConversationSchema, 
  insertMessageSchema,
  insertTagSchema,
  User
} from '../shared/schema';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';

// Authentication middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    storage.getUserById(decoded.userId)
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        
        req.user = user;
        next();
      })
      .catch(error => {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Server error' });
      });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
router.post('/auth/register', (req: Request, res: Response) => {
  try {
    const registerSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      preferredTheme: z.enum(['cozy', 'midnight', 'sunset']).optional(),
    });
    
    const userData = registerSchema.parse(req.body);
    
    // Check if user already exists
    storage.getUserByEmail(userData.email)
      .then(existingUser => {
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        return bcrypt.hash(userData.password, 10)
          .then(passwordHash => {
            // Create user
            return storage.createUser({
              email: userData.email,
              passwordHash,
              preferredTheme: userData.preferredTheme || 'cozy',
              notificationPreferences: '{}'
            });
          })
          .then(newUser => {
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
          });
      })
      .catch(error => {
        console.error('Register error:', error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Server error' });
      });
  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });
    
    const credentials = loginSchema.parse(req.body);
    
    // Find user
    storage.getUserByEmail(credentials.email)
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password
        return bcrypt.compare(credentials.password, user.passwordHash)
          .then(isPasswordValid => {
            if (!isPasswordValid) {
              return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            // Update last login
            storage.updateUser(user.id, { lastLogin: new Date() }).catch(err => {
              console.error('Failed to update last login:', err);
            });
            
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
          });
      })
      .catch(error => {
        console.error('Login error:', error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Server error' });
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
router.get('/users/me', authenticate, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    
    let notificationPrefs;
    try {
      notificationPrefs = JSON.parse(user.notificationPreferences || '{}');
    } catch (e) {
      notificationPrefs = {};
    }
    
    res.json({
      id: user.id,
      email: user.email,
      preferredTheme: user.preferredTheme,
      notificationPreferences: notificationPrefs,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/me', authenticate, (req: Request, res: Response) => {
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
    
    storage.updateUser(req.user!.id, dataToUpdate)
      .then(updatedUser => {
        if (!updatedUser) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        let notificationPrefs;
        try {
          notificationPrefs = JSON.parse(updatedUser.notificationPreferences || '{}');
        } catch (e) {
          notificationPrefs = {};
        }
        
        res.json({
          id: updatedUser.id,
          email: updatedUser.email,
          preferredTheme: updatedUser.preferredTheme,
          notificationPreferences: notificationPrefs,
          createdAt: updatedUser.createdAt,
        });
      })
      .catch(error => {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Server error' });
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
router.get('/prompts/today', authenticate, (req: Request, res: Response) => {
  try {
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    storage.getPromptForDate(todayDateOnly)
      .then(prompt => {
        if (prompt) {
          return res.json(prompt);
        }
        
        // If no prompt for today, get the latest active prompt
        return storage.getActivePrompts()
          .then(activePrompts => {
            if (!activePrompts.length) {
              return res.status(404).json({ error: 'No prompt available for today' });
            }
            
            // Sort by date descending and return the most recent
            const latestPrompt = activePrompts.sort((a, b) => 
              new Date(b.activeDate).getTime() - new Date(a.activeDate).getTime()
            )[0];
            
            res.json(latestPrompt);
          });
      })
      .catch(error => {
        console.error('Get today prompt error:', error);
        res.status(500).json({ error: 'Server error' });
      });
  } catch (error) {
    console.error('Get today prompt error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Journal Entries Routes
router.post('/journal/entries', authenticate, (req: Request, res: Response) => {
  try {
    const entrySchema = z.object({
      promptId: z.number(),
      initialResponse: z.string().min(1),
      moodScore: z.number().min(1).max(10).optional(),
    });
    
    const entryData = entrySchema.parse(req.body);
    
    // Set the user ID from the authenticated user
    const userId = req.user!.id;
    
    // Set today's date
    const today = new Date();
    const entryDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Check if user already has an entry for this date
    storage.getJournalEntryByUserAndDate(userId, entryDate)
      .then(existingEntry => {
        if (existingEntry) {
          return res.status(400).json({ error: 'You already have a journal entry for this date' });
        }
        
        // Create journal entry
        return storage.createJournalEntry({
          userId,
          promptId: entryData.promptId,
          entryDate: entryDate,
          initialResponse: entryData.initialResponse,
          moodScore: entryData.moodScore,
        })
        .then(newEntry => {
          // Auto-analyze for tags using AI
          aiService.analyzeTags(entryData.initialResponse)
            .then(analyzedTags => {
              // Process tags asynchronously - don't block response
              const tagPromises = analyzedTags.map(tagData => 
                storage.getTagByName(tagData.name)
                  .then(tag => {
                    if (!tag) {
                      return storage.createTag({
                        name: tagData.name,
                        description: '',
                        isSystem: false,
                      });
                    }
                    return tag;
                  })
                  .then(tag => 
                    storage.addTagToEntry({
                      journalEntryId: newEntry.id,
                      tagId: tag.id,
                      source: 'ai',
                      confidenceScore: tagData.confidenceScore,
                    })
                  )
              );
              
              // Execute all tag promises but don't wait for completion
              Promise.all(tagPromises).catch(err => {
                console.error('Error adding tags:', err);
              });
            })
            .catch(error => {
              console.error('Tag analysis error:', error);
              // Continue even if tag analysis fails
            });
          
          res.status(201).json(newEntry);
        });
      })
      .catch(error => {
        console.error('Create journal entry error:', error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Server error' });
      });
  } catch (error) {
    console.error('Create journal entry error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/journal/entries', authenticate, (req: Request, res: Response) => {
  storage.getJournalEntriesByUserId(req.user!.id)
    .then(entries => {
      res.json(entries);
    })
    .catch(error => {
      console.error('Get journal entries error:', error);
      res.status(500).json({ error: 'Server error' });
    });
});

router.get('/journal/entries/:id', authenticate, (req: Request, res: Response) => {
  const entryId = parseInt(req.params.id);
  
  if (isNaN(entryId)) {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }
  
  storage.getJournalEntryById(entryId)
    .then(entry => {
      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }
      
      // Ensure user can only access their own entries
      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized access to this entry' });
      }
      
      // Get tags for the entry
      return storage.getTagsByJournalEntryId(entryId)
        .then(tags => {
          res.json({
            ...entry,
            tags,
          });
        });
    })
    .catch(error => {
      console.error('Get journal entry error:', error);
      res.status(500).json({ error: 'Server error' });
    });
});

router.patch('/journal/entries/:id', authenticate, (req: Request, res: Response) => {
  const entryId = parseInt(req.params.id);
  
  if (isNaN(entryId)) {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }
  
  storage.getJournalEntryById(entryId)
    .then(entry => {
      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }
      
      // Ensure user can only update their own entries
      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized access to this entry' });
      }
      
      const updateSchema = z.object({
        moodScore: z.number().min(1).max(10).optional(),
        isFavorite: z.boolean().optional(),
      });
      
      const updateData = updateSchema.parse(req.body);
      return storage.updateJournalEntry(entryId, updateData)
        .then(updatedEntry => {
          res.json(updatedEntry);
        });
    })
    .catch(error => {
      console.error('Update journal entry error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Server error' });
    });
});

// Conversations Routes
router.post('/journal/entries/:entryId/conversations', authenticate, (req: Request, res: Response) => {
  const entryId = parseInt(req.params.entryId);
  
  if (isNaN(entryId)) {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }
  
  storage.getJournalEntryById(entryId)
    .then(entry => {
      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }
      
      // Ensure user can only create conversations for their own entries
      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized access to this entry' });
      }
      
      // Check if a conversation already exists for this entry
      return storage.getConversationByJournalEntryId(entryId)
        .then(existingConversation => {
          if (existingConversation) {
            return res.status(400).json({ error: 'A conversation already exists for this entry' });
          }
          
          // Create a new conversation
          return storage.createConversation({
            journalEntryId: entryId,
            summary: null,
          })
          .then(newConversation => {
            // Generate initial AI response
            const initialPrompt = `I just wrote this in my journal: "${entry.initialResponse}". What do you think?`;
            
            return aiService.generateResponse(initialPrompt, [])
              .then(aiResponse => {
                // Add the initial messages
                return Promise.all([
                  storage.createMessage({
                    conversationId: newConversation.id,
                    senderType: 'user',
                    content: initialPrompt,
                    sequenceOrder: 1,
                  }),
                  storage.createMessage({
                    conversationId: newConversation.id,
                    senderType: 'assistant',
                    content: aiResponse,
                    sequenceOrder: 2,
                  })
                ])
                .then(() => 
                  // Get updated messages
                  storage.getMessagesByConversationId(newConversation.id)
                )
                .then(messages => {
                  res.status(201).json({
                    ...newConversation,
                    messages,
                  });
                });
              })
              .catch(error => {
                console.error('Generate AI response error:', error);
                // Return the conversation even if AI response generation fails
                res.status(201).json(newConversation);
              });
          });
        });
    })
    .catch(error => {
      console.error('Create conversation error:', error);
      res.status(500).json({ error: 'Server error' });
    });
});

router.get('/journal/entries/:entryId/conversations', authenticate, (req: Request, res: Response) => {
  const entryId = parseInt(req.params.entryId);
  
  if (isNaN(entryId)) {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }
  
  storage.getJournalEntryById(entryId)
    .then(entry => {
      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }
      
      // Ensure user can only access conversations for their own entries
      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized access to this entry' });
      }
      
      return storage.getConversationByJournalEntryId(entryId)
        .then(conversation => {
          if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found for this entry' });
          }
          
          return storage.getMessagesByConversationId(conversation.id)
            .then(messages => {
              res.json({
                ...conversation,
                messages,
              });
            });
        });
    })
    .catch(error => {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Server error' });
    });
});

// Messages Routes
router.post('/journal/entries/:entryId/conversations/messages', authenticate, (req: Request, res: Response) => {
  const entryId = parseInt(req.params.entryId);
  
  if (isNaN(entryId)) {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }
  
  storage.getJournalEntryById(entryId)
    .then(entry => {
      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }
      
      // Ensure user can only add messages to their own entries' conversations
      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized access to this entry' });
      }
      
      return storage.getConversationByJournalEntryId(entryId)
        .then(conversation => {
          if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found for this entry' });
          }
          
          const messageSchema = z.object({
            content: z.string().min(1),
          });
          
          const messageData = messageSchema.parse(req.body);
          
          // Get all existing messages to build the conversation history
          return storage.getMessagesByConversationId(conversation.id)
            .then(existingMessages => {
              const highestSequence = existingMessages.reduce(
                (max, msg) => Math.max(max, msg.sequenceOrder),
                0
              );
              
              // Add the user message
              return storage.createMessage({
                conversationId: conversation.id,
                senderType: 'user',
                content: messageData.content,
                sequenceOrder: highestSequence + 1,
              })
              .then(() => {
                // Format conversation history for AI
                const conversationHistory = existingMessages.map(msg => ({
                  role: msg.senderType as 'user' | 'assistant',
                  content: msg.content,
                }));
                
                // Get AI response
                return aiService.generateResponse(
                  messageData.content,
                  conversationHistory
                )
                .then(aiResponse => {
                  // Add the AI response
                  return storage.createMessage({
                    conversationId: conversation.id,
                    senderType: 'assistant',
                    content: aiResponse,
                    sequenceOrder: highestSequence + 2,
                  })
                  .then(() => {
                    // Update conversation summary if this is message #5 or more
                    if (existingMessages.length >= 4) {
                      return storage.getMessagesByConversationId(conversation.id)
                        .then(allMessages => {
                          const historyForSummary = allMessages.map(msg => ({
                            role: msg.senderType as 'user' | 'assistant',
                            content: msg.content,
                          }));
                          
                          return aiService.generateSummary(historyForSummary)
                            .then(summary => {
                              return storage.updateConversation(conversation.id, { summary })
                                .catch(err => {
                                  console.error('Failed to update conversation summary:', err);
                                  // Continue even if summary update fails
                                  return conversation;
                                });
                            })
                            .catch(err => {
                              console.error('Failed to generate conversation summary:', err);
                              // Continue even if summary generation fails
                              return conversation;
                            });
                        });
                    }
                    return conversation;
                  });
                })
                .then(() => {
                  // Get all messages to return in response
                  return storage.getMessagesByConversationId(conversation.id)
                    .then(messages => {
                      res.json({
                        ...conversation,
                        messages,
                      });
                    });
                });
              });
            });
        });
    })
    .catch(error => {
      console.error('Add message error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Server error' });
    });
});

// Tags Routes
router.get('/tags', authenticate, (req: Request, res: Response) => {
  storage.getAllTags()
    .then(tags => {
      res.json(tags);
    })
    .catch(error => {
      console.error('Get tags error:', error);
      res.status(500).json({ error: 'Server error' });
    });
});

router.get('/tags/:tagId/entries', authenticate, (req: Request, res: Response) => {
  const tagId = parseInt(req.params.tagId);
  
  if (isNaN(tagId)) {
    return res.status(400).json({ error: 'Invalid tag ID' });
  }
  
  storage.getJournalEntriesByTagId(tagId)
    .then(entries => {
      // Filter to only show entries that belong to the requesting user
      const userEntries = entries.filter(entry => entry.userId === req.user!.id);
      res.json(userEntries);
    })
    .catch(error => {
      console.error('Get entries by tag error:', error);
      res.status(500).json({ error: 'Server error' });
    });
});

export default router;