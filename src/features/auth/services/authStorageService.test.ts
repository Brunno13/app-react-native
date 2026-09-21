import { AuthStorageService } from './authStorageService';
import * as SecureStore from 'expo-secure-store';
import { AuthRepository } from '@/shared/db/repositories/authRepository';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@/shared/db/repositories/authRepository', () => ({
  AuthRepository: {
    get: jest.fn(),
    upsert: jest.fn(),
    clear: jest.fn(),
  },
}));

const mockDb = {} as unknown as ExpoSQLiteDatabase;

describe('AuthStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getValidSession', () => {
    it('deve retornar null se nao houver dados no banco ou no SecureStore', async () => {
      (AuthRepository.get as jest.Mock).mockResolvedValue(null);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await AuthStorageService.getValidSession(mockDb);
      expect(result).toBeNull();
    });

    it('deve retornar a sessao combinada se estiver valida', async () => {
      const mockUser = { name: 'Brunno' };
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const mockSession = { id: 's1', expiresAt: futureDate.toISOString() };

      (AuthRepository.get as jest.Mock).mockResolvedValue(mockUser);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));

      const result = await AuthStorageService.getValidSession(mockDb);
      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it('deve limpar sessao e retornar null se estiver expirada', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Ontem

      (AuthRepository.get as jest.Mock).mockResolvedValue({ id: 1 });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({ id: 'expired-session', expiresAt: pastDate.toISOString() }));

      const result = await AuthStorageService.getValidSession(mockDb);

      expect(AuthRepository.clear).toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('saveHybridSession', () => {
    it('deve salvar dados no DB e no SecureStore com sucesso', async () => {
      const session = { id: 's1', expiresAt: new Date() };
      const user = { id: "u1", email: "b@b.com", name: "Brunno" };

      const result = await AuthStorageService.saveHybridSession(mockDb, session, user);

      expect(AuthRepository.upsert).toHaveBeenCalled();
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'secure_auth_session_data',
        JSON.stringify(session)
      );
      expect(result).toBe(true);
    });

    it('deve retornar false se os inputs forem invalidos', async () => {
      const result = await AuthStorageService.saveHybridSession(mockDb, null, null);
      expect(result).toBe(false);
    });
  });

  describe('clearHybridSession', () => {
    it('deve limpar ambos os armazenamentos', async () => {
      await AuthStorageService.clearHybridSession(mockDb);

      expect(AuthRepository.clear).toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('secure_auth_session_data');
    });
  });

  describe('cenarios defensivos de persistencia', () => {
    it('deve limpar sessao quando o SecureStore contiver estrutura invalida', async () => {
      (AuthRepository.get as jest.Mock).mockResolvedValue({ id: 'u1' });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify('sessao-invalida'),
      );

      const result = await AuthStorageService.getValidSession(mockDb);

      expect(result).toBeNull();
      expect(AuthRepository.clear).toHaveBeenCalledTimes(1);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'secure_auth_session_data',
      );
    });

    it('deve tratar JSON corrompido no SecureStore', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      (AuthRepository.get as jest.Mock).mockResolvedValue({ id: 'u1' });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('{json-invalido');

      const result = await AuthStorageService.getValidSession(mockDb);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Falha na orquestração de sessão híbrida:',
        expect.any(SyntaxError),
      );

      consoleSpy.mockRestore();
    });

    it('deve rejeitar sessao com data de expiracao invalida', async () => {
      (AuthRepository.get as jest.Mock).mockResolvedValue({ id: 'u1' });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({
          id: 'invalid-expiration',
          expiresAt: 'data-invalida',
        }),
      );

      const result = await AuthStorageService.getValidSession(mockDb);

      expect(result).toBeNull();
      expect(AuthRepository.clear).toHaveBeenCalledTimes(1);
    });

    it('deve recusar saveHybridSession com data invalida', async () => {
      const result = await AuthStorageService.saveHybridSession(
        mockDb,
        { id: 'invalid-session', expiresAt: 'data-invalida' },
        { id: 'u1', email: 'b@b.com', name: 'Brunno' },
      );

      expect(result).toBe(false);
      expect(AuthRepository.upsert).not.toHaveBeenCalled();
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('deve retornar false se falhar ao salvar a sessao hibrida', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const persistenceError = new Error('Falha no banco');

      (AuthRepository.upsert as jest.Mock).mockRejectedValueOnce(persistenceError);

      const result = await AuthStorageService.saveHybridSession(
        mockDb,
        { id: 's1', expiresAt: new Date() },
        { id: 'u1', email: 'b@b.com', name: 'Brunno' },
      );

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Falha ao salvar sessão híbrida:',
        persistenceError,
      );

      consoleSpy.mockRestore();
    });

    it('deve retornar false se falhar ao limpar a sessao hibrida', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const persistenceError = new Error('Falha ao limpar banco');

      (AuthRepository.clear as jest.Mock).mockRejectedValueOnce(persistenceError);

      const result = await AuthStorageService.clearHybridSession(mockDb);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Falha ao limpar sessão híbrida:',
        persistenceError,
      );

      consoleSpy.mockRestore();
    });
  });
});