import { AuthStorageService } from './authStorageService';
import * as SecureStore from 'expo-secure-store';
import { AuthRepository } from '@/shared/db/repositories/authRepository';

// Mocks
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

const mockDb = {} as any;

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
      const mockSession = { expiresAt: futureDate.toISOString() };

      (AuthRepository.get as jest.Mock).mockResolvedValue(mockUser);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));

      const result = await AuthStorageService.getValidSession(mockDb);
      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it('deve limpar sessao e retornar null se estiver expirada', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Ontem
      
      (AuthRepository.get as jest.Mock).mockResolvedValue({ id: 1 });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({ expiresAt: pastDate.toISOString() }));

      const result = await AuthStorageService.getValidSession(mockDb);
      
      expect(AuthRepository.clear).toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('saveHybridSession', () => {
    it('deve salvar dados no DB e no SecureStore com sucesso', async () => {
      const session = { id: 's1', expiresAt: new Date() };
      const user = { id: 'u1', email: 'b@b.com' };

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
});