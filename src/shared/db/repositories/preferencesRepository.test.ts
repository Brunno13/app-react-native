import { PreferencesRepository } from './preferencesRepository';
import { userPreferences } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

jest.mock('@/shared/db/schema', () => ({
  userPreferences: {
    id: 'mock-pref-id-col',
    userId: 'mock-pref-userid-col',
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((col, val) => `eq(${col},${val})`),
}));

describe('PreferencesRepository', () => {
  const mockUserId = 'user-123';

  let mockWhereSelect: jest.Mock;
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockOnConflictDoUpdate: jest.Mock;
  let mockValues: jest.Mock;
  let mockInsert: jest.Mock;
  let mockWhereDelete: jest.Mock;
  let mockDelete: jest.Mock;

  let mockDb: ExpoSQLiteDatabase;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockWhereSelect = jest.fn();
    mockFrom = jest.fn(() => ({ where: mockWhereSelect }));
    mockSelect = jest.fn(() => ({ from: mockFrom }));

    mockOnConflictDoUpdate = jest.fn();
    mockValues = jest.fn(() => ({ onConflictDoUpdate: mockOnConflictDoUpdate }));
    mockInsert = jest.fn(() => ({ values: mockValues }));

    mockWhereDelete = jest.fn();
    mockDelete = jest.fn(() => ({ where: mockWhereDelete }));

    mockDb = {
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
    } as unknown as ExpoSQLiteDatabase;
  });

  describe('get', () => {
    it('deve retornar as preferências se o usuário for encontrado no banco', async () => {
      const mockPrefs = { theme: 'dark', isOfflineModeEnabled: true };
      
      mockWhereSelect.mockResolvedValueOnce([mockPrefs]);

      const result = await PreferencesRepository.get(mockDb, mockUserId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(userPreferences);
      expect(eq).toHaveBeenCalledWith(userPreferences.userId, mockUserId);
      expect(mockWhereSelect).toHaveBeenCalledWith(`eq(mock-pref-userid-col,${mockUserId})`);
      expect(result).toEqual(mockPrefs);
    });

    it('deve retornar null se as preferências do usuário não existirem', async () => {
      mockWhereSelect.mockResolvedValueOnce([]);

      const result = await PreferencesRepository.get(mockDb, mockUserId);

      expect(result).toBeNull();
    });

    it('deve logar o erro e propagar a exceção em caso de falha', async () => {
      const dbError = new Error('Erro de conexão SQLite');
      mockWhereSelect.mockRejectedValueOnce(dbError);

      await expect(PreferencesRepository.get(mockDb, mockUserId)).rejects.toThrow('Erro de conexão SQLite');
      expect(console.error).toHaveBeenCalledWith('Erro no repositório Preferences (get):', dbError);
    });
  });

  describe('upsert', () => {
    const mockData = { theme: 'light' as const, isBiometricsEnabled: true };

    it('deve inserir ou atualizar as preferências, injetando a data atual', async () => {
      mockOnConflictDoUpdate.mockResolvedValueOnce(undefined);

      const result = await PreferencesRepository.upsert(mockDb, mockUserId, mockData);

      expect(mockDb.insert).toHaveBeenCalledWith(userPreferences);
      
      expect(mockValues).toHaveBeenCalledWith({
        id: mockUserId,
        userId: mockUserId,
        theme: mockData.theme,
        isOfflineModeEnabled: undefined,
        isBiometricsEnabled: mockData.isBiometricsEnabled,
        updatedAt: expect.any(Date),
      });

      expect(mockOnConflictDoUpdate).toHaveBeenCalledWith({
        target: userPreferences.id,
        set: {
          ...mockData,
          updatedAt: expect.any(Date),
        },
      });

      expect(result).toBe(true);
    });

    it('deve logar o erro e propagar a exceção em caso de falha de gravação', async () => {
      const dbError = new Error('Falha de I/O no Upsert');
      mockOnConflictDoUpdate.mockRejectedValueOnce(dbError);

      await expect(PreferencesRepository.upsert(mockDb, mockUserId, mockData)).rejects.toThrow('Falha de I/O no Upsert');
      expect(console.error).toHaveBeenCalledWith('Erro no repositório Preferences (upsert):', dbError);
    });
  });

  describe('deleteByUser', () => {
    it('deve deletar as preferências do usuário retornando true', async () => {
      mockWhereDelete.mockResolvedValueOnce(undefined);

      const result = await PreferencesRepository.deleteByUser(mockDb, mockUserId);

      expect(mockDb.delete).toHaveBeenCalledWith(userPreferences);
      expect(eq).toHaveBeenCalledWith(userPreferences.userId, mockUserId);
      expect(mockWhereDelete).toHaveBeenCalledWith(`eq(mock-pref-userid-col,${mockUserId})`);
      expect(result).toBe(true);
    });

    it('deve logar erro e propagar a exceção em caso de falha na exclusão', async () => {
      const dbError = new Error('Tabela bloqueada');
      mockWhereDelete.mockRejectedValueOnce(dbError);

      await expect(PreferencesRepository.deleteByUser(mockDb, mockUserId)).rejects.toThrow('Tabela bloqueada');
      expect(console.error).toHaveBeenCalledWith('Erro no repositório Preferences (delete):', dbError);
    });
  });
});