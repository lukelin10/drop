import { pgTable, serial, text, timestamp, boolean, varchar, date, integer, smallint, unique, foreignKey, primaryKey, real } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users Table
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

// Prompts Table
export const prompts = pgTable('prompts', {
  id: serial('id').primaryKey(),
  promptText: text('prompt_text').notNull(),
  category: varchar('category', { length: 100 }),
  activeDate: date('active_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  isActive: boolean('is_active').default(true)
});

// Journal Entries Table
export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  promptId: integer('prompt_id').references(() => prompts.id),
  entryDate: date('entry_date').notNull(),
  initialResponse: text('initial_response').notNull(),
  moodScore: smallint('mood_score'),
  isFavorite: boolean('is_favorite').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => {
  return {
    userEntryDateUnique: unique().on(table.userId, table.entryDate)
  };
});

// Conversations Table
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  journalEntryId: integer('journal_entry_id')
    .references(() => journalEntries.id, { onDelete: 'cascade' })
    .notNull(),
  summary: text('summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Messages Table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  senderType: varchar('sender_type', { length: 10 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  sequenceOrder: integer('sequence_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => {
  return {
    conversationSequenceUnique: unique().on(table.conversationId, table.sequenceOrder)
  };
});

// Tags Table
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// Entry Tags Junction Table
export const entryTags = pgTable('entry_tags', {
  journalEntryId: integer('journal_entry_id')
    .references(() => journalEntries.id, { onDelete: 'cascade' })
    .notNull(),
  tagId: integer('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' })
    .notNull(),
  source: varchar('source', { length: 20 }).notNull(), // 'user', 'system', or 'ai'
  confidenceScore: real('confidence_score'),
}, (table) => {
  return {
    pk: primaryKey(table.journalEntryId, table.tagId)
  };
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  lastLogin: true 
});

export const insertPromptSchema = createInsertSchema(prompts).omit({ 
  id: true, 
  createdAt: true 
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

// Types
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