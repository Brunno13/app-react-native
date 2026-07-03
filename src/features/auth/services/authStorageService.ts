import * as SecureStore from 'expo-secure-store';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { AuthRepository } from '@/shared/db/repositories/authRepository';

const SECURE_SESSION_KEY = 'secure_auth_session_data';

export const AuthStorageService = {
  getValidSession: async (db: ExpoSQLiteDatabase) => {
    try {
      const userCache = await AuthRepository.get(db);
      const secureSessionString = await SecureStore.getItemAsync(SECURE_SESSION_KEY);
      
      if (userCache && secureSessionString) {
        const sessionData = JSON.parse(secureSessionString);
        
        if (new Date(sessionData.expiresAt) < new Date()) {
          await AuthStorageService.clearHybridSession(db);
          return null;
        }

        return { user: userCache, session: sessionData };
      }
      return null;
    } catch (error) {
      console.error('Falha na orquestração de sessão híbrida:', error);
      return null;
    }
  },

  saveHybridSession: async (db: ExpoSQLiteDatabase, session: any, user: any) => {
    if (!session || !user) return false;

    try {
      const dbPayload = {
        id: session.id, 
        userId: user.id,
        email: user.email,
        name: user.name,
        image: user.image || null,
        expiresAt: new Date(session.expiresAt),
        updatedAt: new Date(),
      };

      await AuthRepository.upsert(db, dbPayload);
      await SecureStore.setItemAsync(SECURE_SESSION_KEY, JSON.stringify(session));
      
      return true;
    } catch (error) {
      console.error('Falha ao salvar sessão híbrida:', error);
      return false;
    }
  },

  clearHybridSession: async (db: ExpoSQLiteDatabase) => {
    try {
      await AuthRepository.clear(db);
      await SecureStore.deleteItemAsync(SECURE_SESSION_KEY);
      return true;
    } catch (error) {
      console.error('Falha ao limpar sessão híbrida:', error);
      return false;
    }
  }
};