import { pgTable, serial, varchar, text, timestamp, boolean, integer, date, real } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  preferredTheme: varchar('preferred_theme', { length: 50 }).default('cozy'),
  notificationPreferences: text('notification_preferences').default('{}')
});

// Prompts
export const prompts = pgTable('prompts', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  activeDate: date('active_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Journal Entries
export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  promptId: integer('prompt_id').references(() => prompts.id),
  initialResponse: text('initial_response').notNull(),
  moodScore: integer('mood_score'),
  userId: integer('user_id').notNull().references(() => users.id),
  entryDate: date('entry_date').notNull(),
  isFavorite: boolean('is_favorite').default(false)
});

// Conversations
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  journalEntryId: integer('journal_entry_id').notNull().references(() => journalEntries.id),
  summary: text('summary')
});

// Messages
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id),
  content: text('content').notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  sequenceOrder: integer('sequence_order').notNull()
});

// Tags
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// Entry Tags (junction table between journal entries and tags)
export const entryTags = pgTable('entry_tags', {
  id: serial('id').primaryKey(),
  journalEntryId: integer('journal_entry_id').notNull().references(() => journalEntries.id),
  tagId: integer('tag_id').notNull().references(() => tags.id),
  source: varchar('source', { length: 20 }).notNull(), // 'user', 'ai'
  confidenceScore: real('confidence_score')
});

// Zod schemas for inserts
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true, 
  updatedAt: true
});

export const insertPromptSchema = createInsertSchema(prompts).omit({ 
  id: true,
  createdAt: true, 
  updatedAt: true
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ 
  id: true,
  createdAt: true, 
  updatedAt: true
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ 
  id: true,
  createdAt: true, 
  updatedAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true,
  createdAt: true
});

export const insertTagSchema = createInsertSchema(tags).omit({ 
  id: true,
  createdAt: true
});

export const insertEntryTagSchema = createInsertSchema(entryTags);

// Type definitions
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;

export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = z.infer<typeof insertPromptSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type NewMessage = z.infer<typeof insertMessageSchema>;

export type Tag = typeof tags.$inferSelect;
export type NewTag = z.infer<typeof insertTagSchema>;

export type EntryTag = typeof entryTags.$inferSelect;
export type NewEntryTag = z.infer<typeof insertEntryTagSchema>;