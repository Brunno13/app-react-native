import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  theme: text('theme', { enum: ['light', 'dark', 'system'] }).default('system'),
  isOfflineModeEnabled: integer('is_offline_mode_enabled', { mode: 'boolean' }).default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
});