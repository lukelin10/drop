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
import { db } from './db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { Store } from 'express-session';
import connectPg from 'connect-pg-simple';
import session from 'express-session';
import { pool } from './db';

// Use Postgres for session storage
const PostgresStore = connectPg(session);

export interface IStorage {
  // Users
  createUser(user: NewUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
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
  sessionStore: Store;
}

export class PostgresStorage implements IStorage {
  sessionStore: Store;
  
  constructor() {
    this.sessionStore = new PostgresStore({
      pool, 
      createTableIfMissing: true,
      tableName: 'session' // Default is 'session'
    });
  }
  
  // User methods
  async createUser(user: NewUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }
  
  async getUserById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }
  
  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  }
  
  async updateUser(id: number, data: Partial<Omit<User, 'id'>>): Promise<User | null> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || null;
  }
  
  // Prompt methods
  async createPrompt(prompt: NewPrompt): Promise<Prompt> {
    const [newPrompt] = await db.insert(prompts).values(prompt).returning();
    return newPrompt;
  }
  
  async getPromptById(id: number): Promise<Prompt | null> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt || null;
  }
  
  async getPromptForDate(date: Date): Promise<Prompt | null> {
    // Try to find a prompt that matches the exact date first
    const formattedDate = date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
    
    const [prompt] = await db
      .select()
      .from(prompts)
      .where(
        and(
          eq(prompts.activeDate, formattedDate),
          eq(prompts.isActive, true)
        )
      );
    
    if (prompt) {
      return prompt;
    }
    
    // If no specific prompt for that date, get the most recent active prompt
    const [latestPrompt] = await db
      .select()
      .from(prompts)
      .where(eq(prompts.isActive, true))
      .orderBy(desc(prompts.activeDate))
      .limit(1);
    
    return latestPrompt || null;
  }
  
  async getActivePrompts(): Promise<Prompt[]> {
    return db
      .select()
      .from(prompts)
      .where(eq(prompts.isActive, true))
      .orderBy(desc(prompts.activeDate));
  }
  
  // Journal Entry methods
  async createJournalEntry(entry: NewJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }
  
  async getJournalEntryById(id: number): Promise<JournalEntry | null> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry || null;
  }
  
  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.entryDate));
  }
  
  async getJournalEntryByUserAndDate(userId: number, date: Date): Promise<JournalEntry | null> {
    const formattedDate = date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
    
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          eq(journalEntries.entryDate, formattedDate)
        )
      );
    
    return entry || null;
  }
  
  async updateJournalEntry(id: number, data: Partial<Omit<JournalEntry, 'id'>>): Promise<JournalEntry | null> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    
    return updatedEntry || null;
  }
  
  // Conversation methods
  async createConversation(conversation: NewConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }
  
  async getConversationById(id: number): Promise<Conversation | null> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || null;
  }
  
  async getConversationByJournalEntryId(journalEntryId: number): Promise<Conversation | null> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.journalEntryId, journalEntryId));
    
    return conversation || null;
  }
  
  async updateConversation(id: number, data: Partial<Omit<Conversation, 'id'>>): Promise<Conversation | null> {
    const [updatedConversation] = await db
      .update(conversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    
    return updatedConversation || null;
  }
  
  // Message methods
  async createMessage(message: NewMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
  
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.sequenceOrder);
  }
  
  // Tag methods
  async createTag(tag: NewTag): Promise<Tag> {
    const [newTag] = await db.insert(tags).values(tag).returning();
    return newTag;
  }
  
  async getTagById(id: number): Promise<Tag | null> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag || null;
  }
  
  async getTagByName(name: string): Promise<Tag | null> {
    const [tag] = await db.select().from(tags).where(eq(tags.name, name));
    return tag || null;
  }
  
  async getAllTags(): Promise<Tag[]> {
    return db.select().from(tags).orderBy(tags.name);
  }
  
  // Entry Tag methods
  async addTagToEntry(entryTag: NewEntryTag): Promise<EntryTag> {
    // Check if this tag is already associated with this entry
    const [existingEntryTag] = await db
      .select()
      .from(entryTags)
      .where(
        and(
          eq(entryTags.journalEntryId, entryTag.journalEntryId),
          eq(entryTags.tagId, entryTag.tagId)
        )
      );
    
    if (existingEntryTag) {
      // Update the existing entry tag if needed
      const [updatedEntryTag] = await db
        .update(entryTags)
        .set({ 
          source: entryTag.source,
          confidenceScore: entryTag.confidenceScore
        })
        .where(eq(entryTags.id, existingEntryTag.id))
        .returning();
      
      return updatedEntryTag;
    }
    
    // Create a new entry tag
    const [newEntryTag] = await db.insert(entryTags).values(entryTag).returning();
    return newEntryTag;
  }
  
  async getTagsByJournalEntryId(journalEntryId: number): Promise<(Tag & { source: string; confidenceScore?: number })[]> {
    // This is a more complex query that joins entry_tags with tags
    const result = await db.execute(sql`
      SELECT t.*, et.source, et.confidence_score
      FROM ${tags} t
      JOIN ${entryTags} et ON t.id = et.tag_id
      WHERE et.journal_entry_id = ${journalEntryId}
      ORDER BY et.confidence_score DESC NULLS LAST, t.name ASC
    `);
    
    return result.rows as (Tag & { source: string; confidenceScore?: number })[];
  }
  
  async getJournalEntriesByTagId(tagId: number): Promise<JournalEntry[]> {
    // Another complex query with a join
    const result = await db.execute(sql`
      SELECT je.*
      FROM ${journalEntries} je
      JOIN ${entryTags} et ON je.id = et.journal_entry_id
      WHERE et.tag_id = ${tagId}
      ORDER BY je.entry_date DESC
    `);
    
    return result.rows as JournalEntry[];
  }
}

// Create and export a single instance of the storage
export const storage: IStorage = new PostgresStorage();