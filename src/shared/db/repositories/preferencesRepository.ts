import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { userPreferences } from '@/shared/db/schema';

export const PreferencesRepository = {
  get: async (db: ExpoSQLiteDatabase, userId: string) => {
    try {
      const result = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));
      
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
      return null;
    }
  },

  upsert: async (
    db: ExpoSQLiteDatabase, 
    userId: string, 
    data: { theme?: 'light' | 'dark' | 'system', isOfflineModeEnabled?: boolean }
  ) => {
    try {
      const now = new Date();
      
      await db.insert(userPreferences)
        .values({
          id: userId,
          userId,
          theme: data.theme ?? 'system',
          isOfflineModeEnabled: data.isOfflineModeEnabled ?? false,
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
  }
};