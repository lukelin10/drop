import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { 
  users, NewUser, User,
  prompts, NewPrompt, Prompt,
  journalEntries, NewJournalEntry, JournalEntry,
  conversations, NewConversation, Conversation,
  messages, NewMessage, Message,
  tags, NewTag, Tag,
  entryTags, NewEntryTag, EntryTag
} from '../shared/schema';
import 'dotenv/config';

// Interface for Storage operations
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
}

// PostgreSQL implementation
export class PostgresStorage implements IStorage {
  private client: postgres.Postgres;
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    this.client = postgres(connectionString);
    this.db = drizzle(this.client);
  }

  // Users
  async createUser(user: NewUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async updateUser(id: number, data: Partial<Omit<User, 'id'>>): Promise<User | null> {
    const result = await this.db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0] || null;
  }

  // Prompts
  async createPrompt(prompt: NewPrompt): Promise<Prompt> {
    const result = await this.db.insert(prompts).values(prompt).returning();
    return result[0];
  }

  async getPromptById(id: number): Promise<Prompt | null> {
    const result = await this.db.select().from(prompts).where(eq(prompts.id, id));
    return result[0] || null;
  }

  async getPromptForDate(date: Date): Promise<Prompt | null> {
    const result = await this.db.select().from(prompts)
      .where(eq(prompts.activeDate, date))
      .limit(1);
    return result[0] || null;
  }

  async getActivePrompts(): Promise<Prompt[]> {
    return await this.db.select().from(prompts).where(eq(prompts.isActive, true));
  }

  // Journal Entries
  async createJournalEntry(entry: NewJournalEntry): Promise<JournalEntry> {
    const result = await this.db.insert(journalEntries).values(entry).returning();
    return result[0];
  }

  async getJournalEntryById(id: number): Promise<JournalEntry | null> {
    const result = await this.db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return result[0] || null;
  }

  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return await this.db.select().from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.entryDate));
  }

  async getJournalEntryByUserAndDate(userId: number, date: Date): Promise<JournalEntry | null> {
    const result = await this.db.select().from(journalEntries)
      .where(and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.entryDate, date)
      ));
    return result[0] || null;
  }

  async updateJournalEntry(id: number, data: Partial<Omit<JournalEntry, 'id'>>): Promise<JournalEntry | null> {
    const result = await this.db.update(journalEntries).set(data).where(eq(journalEntries.id, id)).returning();
    return result[0] || null;
  }

  // Conversations
  async createConversation(conversation: NewConversation): Promise<Conversation> {
    const result = await this.db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async getConversationById(id: number): Promise<Conversation | null> {
    const result = await this.db.select().from(conversations).where(eq(conversations.id, id));
    return result[0] || null;
  }

  async getConversationByJournalEntryId(journalEntryId: number): Promise<Conversation | null> {
    const result = await this.db.select().from(conversations)
      .where(eq(conversations.journalEntryId, journalEntryId));
    return result[0] || null;
  }

  // Messages
  async createMessage(message: NewMessage): Promise<Message> {
    const result = await this.db.insert(messages).values(message).returning();
    return result[0];
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return await this.db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.sequenceOrder));
  }

  // Tags
  async createTag(tag: NewTag): Promise<Tag> {
    const result = await this.db.insert(tags).values(tag).returning();
    return result[0];
  }

  async getTagById(id: number): Promise<Tag | null> {
    const result = await this.db.select().from(tags).where(eq(tags.id, id));
    return result[0] || null;
  }

  async getTagByName(name: string): Promise<Tag | null> {
    const result = await this.db.select().from(tags).where(eq(tags.name, name));
    return result[0] || null;
  }

  async getAllTags(): Promise<Tag[]> {
    return await this.db.select().from(tags);
  }

  // Entry Tags
  async addTagToEntry(entryTag: NewEntryTag): Promise<EntryTag> {
    const result = await this.db.insert(entryTags).values(entryTag).returning();
    return result[0];
  }

  async getTagsByJournalEntryId(journalEntryId: number): Promise<(Tag & { source: string; confidenceScore?: number })[]> {
    return await this.db
      .select({
        ...tags,
        source: entryTags.source,
        confidenceScore: entryTags.confidenceScore
      })
      .from(entryTags)
      .innerJoin(tags, eq(tags.id, entryTags.tagId))
      .where(eq(entryTags.journalEntryId, journalEntryId));
  }

  async getJournalEntriesByTagId(tagId: number): Promise<JournalEntry[]> {
    return await this.db
      .select()
      .from(journalEntries)
      .innerJoin(entryTags, eq(entryTags.journalEntryId, journalEntries.id))
      .where(eq(entryTags.tagId, tagId));
  }
}

// Create a singleton instance for use throughout the app
import { eq, and, desc, asc } from 'drizzle-orm';
export const storage: IStorage = new PostgresStorage();