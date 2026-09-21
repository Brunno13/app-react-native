import * as SecureStore from 'expo-secure-store';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { AuthRepository } from '@/shared/db/repositories/authRepository';
import type {
  AppAuthSessionMetadata,
  AppAuthUser,
  StoredAuthSession,
} from '../types/auth';

const SECURE_SESSION_KEY = 'secure_auth_session_data';

const isStoredAuthSession = (
  value: unknown,
): value is StoredAuthSession => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    typeof record.expiresAt === 'string'
  );
};

export const AuthStorageService = {
  getValidSession: async (db: ExpoSQLiteDatabase) => {
    try {
      const userCache = await AuthRepository.get(db);
      const secureSessionString =
        await SecureStore.getItemAsync(SECURE_SESSION_KEY);

      if (!userCache || !secureSessionString) {
        return null;
      }

      const parsedSession: unknown =
        JSON.parse(secureSessionString);

      if (!isStoredAuthSession(parsedSession)) {
        await AuthStorageService.clearHybridSession(db);
        return null;
      }

      const expirationDate =
        new Date(parsedSession.expiresAt);

      if (
        Number.isNaN(expirationDate.getTime()) ||
        expirationDate < new Date()
      ) {
        await AuthStorageService.clearHybridSession(db);
        return null;
      }

      return {
        user: userCache,
        session: parsedSession,
      };
    } catch (error: unknown) {
      console.error(
        'Falha na orquestração de sessão híbrida:',
        error,
      );

      return null;
    }
  },

  saveHybridSession: async (
    db: ExpoSQLiteDatabase,
    session: AppAuthSessionMetadata | null | undefined,
    user: AppAuthUser | null | undefined,
  ) => {
    if (!session || !user) {
      return false;
    }

    try {
      const expiresAt =
        session.expiresAt instanceof Date
          ? session.expiresAt
          : new Date(session.expiresAt);

      if (Number.isNaN(expiresAt.getTime())) {
        return false;
      }

      const dbPayload = {
        id: session.id,
        userId: user.id,
        email: user.email,
        name: user.name,
        image: user.image ?? null,
        expiresAt,
        updatedAt: new Date(),
      };

      await AuthRepository.upsert(db, dbPayload);

      await SecureStore.setItemAsync(
        SECURE_SESSION_KEY,
        JSON.stringify({
          ...session,
          expiresAt: expiresAt.toISOString(),
        }),
      );

      return true;
    } catch (error: unknown) {
      console.error(
        'Falha ao salvar sessão híbrida:',
        error,
      );

      return false;
    }
  },

  clearHybridSession: async (
    db: ExpoSQLiteDatabase,
  ) => {
    try {
      await AuthRepository.clear(db);
      await SecureStore.deleteItemAsync(
        SECURE_SESSION_KEY,
      );

      return true;
    } catch (error: unknown) {
      console.error(
        'Falha ao limpar sessão híbrida:',
        error,
      );

      return false;
    }
  },
};
