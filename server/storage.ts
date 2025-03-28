import { users, tags, journalEntries, conversations, messages, entryTags, prompts } from "../shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "./db";
import { User, NewUser, Tag, NewTag, JournalEntry, NewJournalEntry, 
         Conversation, NewConversation, Message, NewMessage, EntryTag, 
         NewEntryTag, Prompt, NewPrompt } from "../shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

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
  sessionStore: session.Store;
}

const PostgresSessionStore = connectPg(session);

export class PostgresStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async createUser(user: NewUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
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

  // Prompts
  async createPrompt(prompt: NewPrompt): Promise<Prompt> {
    const [createdPrompt] = await db.insert(prompts).values(prompt).returning();
    return createdPrompt;
  }

  async getPromptById(id: number): Promise<Prompt | null> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt || null;
  }

  async getPromptForDate(date: Date): Promise<Prompt | null> {
    const [prompt] = await db
      .select()
      .from(prompts)
      .where(and(eq(prompts.activeDate, date), eq(prompts.isActive, true)));
    
    return prompt || null;
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
    const [createdEntry] = await db.insert(journalEntries).values(entry).returning();
    return createdEntry;
  }

  async getJournalEntryById(id: number): Promise<JournalEntry | null> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, id));
    
    return entry || null;
  }

  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.entryDate));
  }

  async getJournalEntryByUserAndDate(userId: number, date: Date): Promise<JournalEntry | null> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.entryDate, date)
      ));
    
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

  // Conversations
  async createConversation(conversation: NewConversation): Promise<Conversation> {
    const [createdConversation] = await db.insert(conversations).values(conversation).returning();
    return createdConversation;
  }

  async getConversationById(id: number): Promise<Conversation | null> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    
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

  // Messages
  async createMessage(message: NewMessage): Promise<Message> {
    const [createdMessage] = await db.insert(messages).values(message).returning();
    return createdMessage;
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.sequenceOrder));
  }

  // Tags
  async createTag(tag: NewTag): Promise<Tag> {
    const [createdTag] = await db.insert(tags).values(tag).returning();
    return createdTag;
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
    return await db.select().from(tags).orderBy(asc(tags.name));
  }

  // Entry Tags
  async addTagToEntry(entryTag: NewEntryTag): Promise<EntryTag> {
    const [createdEntryTag] = await db.insert(entryTags).values(entryTag).returning();
    return createdEntryTag;
  }

  async getTagsByJournalEntryId(journalEntryId: number): Promise<(Tag & { source: string; confidenceScore?: number })[]> {
    const results = await db
      .select({
        ...tags,
        source: entryTags.source,
        confidenceScore: entryTags.confidenceScore
      })
      .from(tags)
      .innerJoin(
        entryTags,
        eq(tags.id, entryTags.tagId)
      )
      .where(eq(entryTags.journalEntryId, journalEntryId));

    return results;
  }

  async getJournalEntriesByTagId(tagId: number): Promise<JournalEntry[]> {
    return await db
      .select({
        ...journalEntries
      })
      .from(journalEntries)
      .innerJoin(
        entryTags,
        eq(journalEntries.id, entryTags.journalEntryId)
      )
      .where(eq(entryTags.tagId, tagId))
      .orderBy(desc(journalEntries.entryDate));
  }
}

export const storage: IStorage = new PostgresStorage();