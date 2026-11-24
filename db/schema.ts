import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const decisions = sqliteTable('decisions', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull(),
  title: text('title').notNull(),
  context: text('context').notNull(),
  optionA: text('option_a').notNull(),
  optionB: text('option_b').notNull(),
  optionADescription: text('option_a_description').notNull().default(''),
  optionBDescription: text('option_b_description').notNull().default(''),
  category: text('category').notNull(),
  goal: text('goal').notNull(),
  risk: text('risk').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  decisionId: text('decision_id').notNull().references(() => decisions.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull(),
  choice: text('choice').notNull(),
  angle: text('angle').notNull(),
  reason: text('reason').notNull(),
  createdAt: integer('created_at').notNull(),
  allowContact: integer('allow_contact').notNull().default(0),
}, (table) => [
  uniqueIndex('review_one_per_person').on(table.decisionId, table.authorId),
  index('reviews_by_decision').on(table.decisionId),
]);


// Retired chat tables remain declared to preserve historical data in future migrations.
export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  decisionId: text('decision_id').notNull().references(() => decisions.id, { onDelete: 'cascade' }),
  reviewId: text('review_id').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull(),
  reviewerId: text('reviewer_id').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  uniqueIndex('conversation_by_review').on(table.reviewId),
  index('conversations_by_author').on(table.authorId),
  index('conversations_by_reviewer').on(table.reviewerId),
]);

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull(),
  body: text('body').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => [index('messages_by_conversation').on(table.conversationId, table.createdAt)]);

export const identityKeys = sqliteTable('identity_keys', {
  userId: text('user_id').primaryKey(),
  backup: text('backup').notNull(),
  fingerprint: text('fingerprint').notNull(),
});
