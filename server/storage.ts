import { db } from './db';
import { 
  users, 
  prompts, 
  journalEntries, 
  conversations, 
  messages, 
  tags, 
  entryTags,
  type User,
  type NewUser,
  type Prompt,
  type NewPrompt,
  type JournalEntry,
  type NewJournalEntry,
  type Conversation,
  type NewConversation,
  type Message,
  type NewMessage,
  type Tag,
  type NewTag,
  type EntryTag,
  type NewEntryTag
} from '../shared/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { Pool } from 'pg';
import * as expressSession from 'express-session';
import connectPg from 'connect-pg-simple';

const PostgresSessionStore = connectPg(expressSession);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface IStorage {
  // Users
  createUser(user: NewUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: number): Promise<User | null>;
  updateUser(id: number, data: Partial<Omit<User, 'id'>>): Promise<User | null>;
  
  // Prompts
  createPrompt(prompt: NewPrompt): Promise<Prompt>;
  getPromptById(id: number): Promise<Prompt | null>;
  getPromptForDate(date: Date): Promise<Prompt | null>;
  getActivePrompts(): Promise<Prompt[]>;
  
  // Journal Entries
  createJournalEntry(entry: NewJournalEntry): Promise<JournalEntry>;
  getJournalEntryById(id: number): Promise<JournalEntry | null>;
  getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]>;
  getJournalEntryByUserAndDate(userId: number, date: Date): Promise<JournalEntry | null>;
  updateJournalEntry(id: number, data: Partial<Omit<JournalEntry, 'id'>>): Promise<JournalEntry | null>;
  
  // Conversations
  createConversation(conversation: NewConversation): Promise<Conversation>;
  getConversationById(id: number): Promise<Conversation | null>;
  getConversationByJournalEntryId(journalEntryId: number): Promise<Conversation | null>;
  updateConversation(id: number, data: Partial<Omit<Conversation, 'id'>>): Promise<Conversation | null>;
  
  // Messages
  createMessage(message: NewMessage): Promise<Message>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  
  // Tags
  createTag(tag: NewTag): Promise<Tag>;
  getTagById(id: number): Promise<Tag | null>;
  getTagByName(name: string): Promise<Tag | null>;
  getAllTags(): Promise<Tag[]>;
  
  // Entry Tags
  addTagToEntry(entryTag: NewEntryTag): Promise<EntryTag>;
  getTagsByJournalEntryId(journalEntryId: number): Promise<(Tag & { source: string; confidenceScore?: number })[]>;
  getJournalEntriesByTagId(tagId: number): Promise<JournalEntry[]>;
  
  // Session store
  sessionStore: expressSession.Store;
}

export class PostgresStorage implements IStorage {
  sessionStore: expressSession.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // Users
  async createUser(user: NewUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : null;
  }
  
  async getUserById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : null;
  }
  
  async updateUser(id: number, data: Partial<Omit<User, 'id'>>): Promise<User | null> {
    // Create a copy of the data to avoid modifying the original
    const updateData = { ...data };
    
    // If lastLogin is provided and it has a toISOString method, use it
    if (updateData.lastLogin && typeof updateData.lastLogin === 'object' && 'toISOString' in updateData.lastLogin) {
      updateData.lastLogin = updateData.lastLogin.toISOString() as any;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser || null;
  }
  
  // Prompts
  async createPrompt(prompt: NewPrompt): Promise<Prompt> {
    const [newPrompt] = await db.insert(prompts).values(prompt).returning();
    return newPrompt;
  }
  
  async getPromptById(id: number): Promise<Prompt | null> {
    const result = await db.select().from(prompts).where(eq(prompts.id, id));
    return result.length > 0 ? result[0] : null;
  }
  
  async getPromptForDate(date: Date): Promise<Prompt | null> {
    // Format date to YYYY-MM-DD for matching against activeDate
    const formattedDate = date.toISOString().split('T')[0];
    
    const result = await db
      .select()
      .from(prompts)
      .where(and(eq(prompts.activeDate, formattedDate as any), eq(prompts.isActive, true)));
    
    return result.length > 0 ? result[0] : null;
  }
  
  async getActivePrompts(): Promise<Prompt[]> {
    return await db
      .select()
      .from(prompts)
      .where(eq(prompts.isActive, true))
      .orderBy(desc(prompts.activeDate));
  }
  
  // Journal Entries
  async createJournalEntry(entry: NewJournalEntry): Promise<JournalEntry> {
    // Create a copy of the entry to avoid modifying the original
    const entryToCreate = { ...entry };
    
    // Format date to YYYY-MM-DD for storage if it has a toISOString method
    if (entryToCreate.entryDate && typeof entryToCreate.entryDate === 'object' && 'toISOString' in entryToCreate.entryDate) {
      entryToCreate.entryDate = entryToCreate.entryDate.toISOString().split('T')[0] as any;
    }
    
    const [newEntry] = await db.insert(journalEntries).values(entryToCreate).returning();
    return newEntry;
  }
  
  async getJournalEntryById(id: number): Promise<JournalEntry | null> {
    const result = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return result.length > 0 ? result[0] : null;
  }
  
  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.entryDate));
  }
  
  async getJournalEntryByUserAndDate(userId: number, date: Date): Promise<JournalEntry | null> {
    // Format date to YYYY-MM-DD for matching against entryDate
    const formattedDate = date.toISOString().split('T')[0];
    
    const result = await db
      .select()
      .from(journalEntries)
      .where(and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.entryDate, formattedDate as any)
      ));
    
    return result.length > 0 ? result[0] : null;
  }
  
  async updateJournalEntry(id: number, data: Partial<Omit<JournalEntry, 'id'>>): Promise<JournalEntry | null> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    
    return updatedEntry || null;
  }
  
  // Conversations
  async createConversation(conversation: NewConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }
  
  async getConversationById(id: number): Promise<Conversation | null> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id));
    return result.length > 0 ? result[0] : null;
  }
  
  async getConversationByJournalEntryId(journalEntryId: number): Promise<Conversation | null> {
    const result = await db
      .select()
      .from(conversations)
      .where(eq(conversations.journalEntryId, journalEntryId));
    
    return result.length > 0 ? result[0] : null;
  }
  
  async updateConversation(id: number, data: Partial<Omit<Conversation, 'id'>>): Promise<Conversation | null> {
    const [updatedConversation] = await db
      .update(conversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    
    return updatedConversation || null;
  }
  
  // Messages
  async createMessage(message: NewMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
  
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.sequenceOrder);
  }
  
  // Tags
  async createTag(tag: NewTag): Promise<Tag> {
    const [newTag] = await db.insert(tags).values(tag).returning();
    return newTag;
  }
  
  async getTagById(id: number): Promise<Tag | null> {
    const result = await db.select().from(tags).where(eq(tags.id, id));
    return result.length > 0 ? result[0] : null;
  }
  
  async getTagByName(name: string): Promise<Tag | null> {
    const result = await db.select().from(tags).where(eq(tags.name, name));
    return result.length > 0 ? result[0] : null;
  }
  
  async getAllTags(): Promise<Tag[]> {
    return await db.select().from(tags).orderBy(tags.name);
  }
  
  // Entry Tags
  async addTagToEntry(entryTag: NewEntryTag): Promise<EntryTag> {
    // Check if the entry-tag relation already exists
    const existing = await db
      .select()
      .from(entryTags)
      .where(and(
        eq(entryTags.journalEntryId, entryTag.journalEntryId),
        eq(entryTags.tagId, entryTag.tagId)
      ));
    
    if (existing.length > 0) {
      // If it exists but is user-created, don't update it
      if (existing[0].source === 'user') {
        return existing[0];
      }
      
      // Otherwise update it
      const [updated] = await db
        .update(entryTags)
        .set(entryTag)
        .where(and(
          eq(entryTags.journalEntryId, entryTag.journalEntryId),
          eq(entryTags.tagId, entryTag.tagId)
        ))
        .returning();
      
      return updated;
    }
    
    // If it doesn't exist, create it
    const [newEntryTag] = await db.insert(entryTags).values(entryTag).returning();
    return newEntryTag;
  }
  
  async getTagsByJournalEntryId(journalEntryId: number): Promise<(Tag & { source: string; confidenceScore?: number })[]> {
    const result = await db
      .select({
        id: tags.id,
        name: tags.name,
        description: tags.description,
        isSystem: tags.isSystem,
        createdAt: tags.createdAt,
        source: entryTags.source,
        confidenceScore: entryTags.confidenceScore
      })
      .from(entryTags)
      .innerJoin(tags, eq(entryTags.tagId, tags.id))
      .where(eq(entryTags.journalEntryId, journalEntryId));
    
    // Map to the expected return type
    return result.map(item => ({
      ...item,
      confidenceScore: item.confidenceScore ?? undefined
    }));
  }
  
  async getJournalEntriesByTagId(tagId: number): Promise<JournalEntry[]> {
    // Get all journalEntryIds that have the specified tag
    const taggedEntriesResult = await db
      .select({
        journalEntryId: entryTags.journalEntryId
      })
      .from(entryTags)
      .where(eq(entryTags.tagId, tagId));
    
    const journalEntryIds = taggedEntriesResult.map(row => row.journalEntryId);
    
    if (journalEntryIds.length === 0) {
      return [];
    }
    
    // Get all journal entries with those ids
    return await db
      .select()
      .from(journalEntries)
      .where(inArray(journalEntries.id, journalEntryIds))
      .orderBy(desc(journalEntries.entryDate));
  }
}

export const storage: IStorage = new PostgresStorage();