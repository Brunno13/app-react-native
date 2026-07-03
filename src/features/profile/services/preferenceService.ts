import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { PreferencesRepository, type PartialPreferences } from '@/shared/db/repositories/preferencesRepository';

const DEFAULT_PREFERENCES = {
  theme: 'system' as const,
  isOfflineModeEnabled: false,
  isBiometricsEnabled: false,
};

export const PreferenceService = {
  getUserPreferences: async (db: ExpoSQLiteDatabase, userId: string) => {
    try {
      const rawPrefs = await PreferencesRepository.get(db, userId);
      
      if (!rawPrefs) return DEFAULT_PREFERENCES;

      return {
        theme: (rawPrefs.theme as 'light' | 'dark' | 'system') || DEFAULT_PREFERENCES.theme,
        isOfflineModeEnabled: rawPrefs.isOfflineModeEnabled ?? DEFAULT_PREFERENCES.isOfflineModeEnabled,
        isBiometricsEnabled: rawPrefs.isBiometricsEnabled ?? DEFAULT_PREFERENCES.isBiometricsEnabled,
      };
    } catch (error) {
      return DEFAULT_PREFERENCES;
    }
  },

  updateUserPreferences: async (db: ExpoSQLiteDatabase, userId: string, updates: PartialPreferences) => {
    try {
      return await PreferencesRepository.upsert(db, userId, updates);
    } catch (error) {
      console.error('Falha ao atualizar preferências no serviço:', error);
      return false; 
    }
  }
};