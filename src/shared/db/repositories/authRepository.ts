import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { localSession } from '../schema/auth';

export const AuthRepository = {
  get: async (db: ExpoSQLiteDatabase) => {
    try {
      const result = await db.select().from(localSession);
      return result[0] || null;
    } catch (error) {
      console.error('Erro no repositório Auth (get):', error);
      throw error;
    }
  },

  upsert: async (db: ExpoSQLiteDatabase, data: any) => {
    try {
      await db.insert(localSession)
        .values(data)
        .onConflictDoUpdate({
          target: localSession.id,
          set: data,
        });
      return true;
    } catch (error) {
      console.error('Erro no repositório Auth (upsert):', error);
      throw error;
    }
  },

  clear: async (db: ExpoSQLiteDatabase) => {
    try {
      await db.delete(localSession);
      return true;
    } catch (error) {
      console.error('Erro no repositório Auth (clear):', error);
      throw error;
    }
  }
};