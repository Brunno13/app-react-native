import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const localSession = sqliteTable('local_session', {
  id: text('id').primaryKey(), // ID único da sessão do servidor
  userId: text('user_id').notNull(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  image: text('image'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});