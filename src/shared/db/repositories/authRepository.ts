import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { localSession } from '../schema/auth';

export type LocalSession = typeof localSession.$inferSelect;
export type LocalSessionInsert = typeof localSession.$inferInsert;

export const AuthRepository = {
  get: async (db: ExpoSQLiteDatabase): Promise<LocalSession | null> => {
    try {
      const result = await db.select().from(localSession);
      return result[0] || null;
    } catch (error: unknown) {
      console.error('Erro no repositório Auth (get):', error);
      throw error;
    }
  },

  upsert: async (db: ExpoSQLiteDatabase, data: LocalSessionInsert) => {
    try {
      await db.insert(localSession)
        .values(data)
        .onConflictDoUpdate({
          target: localSession.id,
          set: data,
        });
      return true;
    } catch (error: unknown) {
      console.error('Erro no repositório Auth (upsert):', error);
      throw error;
    }
  },

  clear: async (db: ExpoSQLiteDatabase) => {
    try {
      await db.delete(localSession);
      return true;
    } catch (error: unknown) {
      console.error('Erro no repositório Auth (clear):', error);
      throw error;
    }
  }
};
