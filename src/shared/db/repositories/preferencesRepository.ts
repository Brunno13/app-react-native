import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { userPreferences } from '@/shared/db/schema';

export interface PartialPreferences {
  theme?: 'light' | 'dark' | 'system';
  isOfflineModeEnabled?: boolean;
  isBiometricsEnabled?: boolean;
}

export const PreferencesRepository = {
  get: async (db: ExpoSQLiteDatabase, userId: string) => {
    try {
      const result = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));
      
      return result[0] || null; 
    } catch (error) {
      console.error('Erro no repositório Preferences (get):', error);
      throw error;
    }
  },

  upsert: async (db: ExpoSQLiteDatabase, userId: string, data: PartialPreferences) => {
    try {
      const now = new Date();
      
      await db.insert(userPreferences)
        .values({
          id: userId,
          userId,
          theme: data.theme, 
          isOfflineModeEnabled: data.isOfflineModeEnabled,
          isBiometricsEnabled: data.isBiometricsEnabled,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: userPreferences.id,
          set: {
            ...data,
            updatedAt: now,
          },
        });
        
      return true;
    } catch (error) {
      console.error('Erro no repositório Preferences (upsert):', error);
      throw error;
    }
  },

  deleteByUser: async (db: ExpoSQLiteDatabase, userId: string) => {
    try {
      await db.delete(userPreferences).where(eq(userPreferences.userId, userId));
      return true;
    } catch (error) {
      console.error('Erro no repositório Preferences (delete):', error);
      throw error;
    }
  }
};