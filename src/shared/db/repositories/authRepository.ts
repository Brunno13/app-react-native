import * as SecureStore from 'expo-secure-store';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { localSession } from '../schema/auth';

const SECURE_SESSION_KEY = 'secure_auth_session_data';

export const AuthRepository = {
  get: async (db: ExpoSQLiteDatabase) => {
    try {
      const result = await db.select().from(localSession);
      const userCache = result[0] || null;
      
      const secureSessionString = await SecureStore.getItemAsync(SECURE_SESSION_KEY);
      
      if (userCache && secureSessionString) {
        const sessionData = JSON.parse(secureSessionString);
        return { user: userCache, session: sessionData };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar sessão híbrida:', error);
      return null;
    }
  },

  save: async (db: ExpoSQLiteDatabase, data: any) => {
    try {
      if (!data?.session || !data?.user) return false;
      const { session, user } = data;
      const now = new Date();

      await db.insert(localSession)
        .values({
          id: session.id, 
          userId: user.id,
          email: user.email,
          name: user.name,
          image: user.image || null,
          expiresAt: new Date(session.expiresAt),
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: localSession.id,
          set: {
            userId: user.id,
            email: user.email,
            name: user.name,
            image: user.image || null,
            expiresAt: new Date(session.expiresAt),
            updatedAt: now,
          },
        });

      await SecureStore.setItemAsync(SECURE_SESSION_KEY, JSON.stringify(session));
      return true;
    } catch (error) {
      console.error('Erro ao persistir sessão híbrida:', error);
      return false;
    }
  },

  clear: async (db: ExpoSQLiteDatabase) => {
    try {
      await db.delete(localSession);
      await SecureStore.deleteItemAsync(SECURE_SESSION_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar sessão híbrida:', error);
      return false;
    }
  }
};