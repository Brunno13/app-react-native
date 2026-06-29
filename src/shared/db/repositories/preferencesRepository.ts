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
      
      const prefs = result[0];
      
      if (!prefs) return null;

      return {
        theme: (prefs.theme as 'light' | 'dark' | 'system') || 'system',
        isOfflineModeEnabled: prefs.isOfflineModeEnabled ?? false,
        isBiometricsEnabled: prefs.isBiometricsEnabled ?? false,
      };
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
      return null;
    }
  },

  upsert: async (
    db: ExpoSQLiteDatabase, 
    userId: string, 
    data: PartialPreferences
  ) => {
    try {
      const now = new Date();
      
      await db.insert(userPreferences)
        .values({
          id: userId,
          userId,
          theme: data.theme ?? 'system',
          isOfflineModeEnabled: data.isOfflineModeEnabled ?? false,
          isBiometricsEnabled: data.isBiometricsEnabled ?? false,
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
      console.error('Erro ao salvar preferências:', error);
      return false;
    }
  },

  deleteByUser: async (db: ExpoSQLiteDatabase, userId: string) => {
    try {
      await db.delete(userPreferences).where(eq(userPreferences.userId, userId));
      return true;
    } catch (error) {
      console.error('Erro ao deletar dados do usuário:', error);
      return false;
    }
  }
};