import { AuthRepository } from './authRepository';
import { localSession } from '../schema/auth';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

jest.mock('../schema/auth', () => ({
  localSession: {
    id: 'mock-session-id-column',
  },
}));

describe('AuthRepository', () => {
  let mockFrom: jest.Mock;
  let mockOnConflictDoUpdate: jest.Mock;
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

    mockFrom = jest.fn();
    mockOnConflictDoUpdate = jest.fn();
    mockDelete = jest.fn();

    mockDb = {
      select: jest.fn(() => ({
        from: mockFrom,
      })),
      insert: jest.fn(() => ({
        values: jest.fn(() => ({
          onConflictDoUpdate: mockOnConflictDoUpdate,
        })),
      })),
      delete: mockDelete,
    } as unknown as ExpoSQLiteDatabase;
  });

  describe('get', () => {
    it('deve retornar a primeira sessão se existir no banco', async () => {
      const mockSessionData = { id: 1, token: 'abc-123' };
      mockFrom.mockResolvedValueOnce([mockSessionData]);

      const result = await AuthRepository.get(mockDb);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(localSession);
      expect(result).toEqual(mockSessionData);
    });

    it('deve retornar null se não houver nenhuma sessão no banco', async () => {
      mockFrom.mockResolvedValueOnce([]); 

      const result = await AuthRepository.get(mockDb);

      expect(result).toBeNull();
    });

    it('deve logar o erro e repassar a exceção (throw) em caso de falha', async () => {
      const dbError = new Error('Falha catastrófica de leitura');
      mockFrom.mockRejectedValueOnce(dbError);

      await expect(AuthRepository.get(mockDb)).rejects.toThrow('Falha catastrófica de leitura');
      expect(console.error).toHaveBeenCalledWith('Erro no repositório Auth (get):', dbError);
    });
  });

  describe('upsert', () => {
    const mockData = { id: 1, token: 'abc-123', userId: 'user-1' };

    it('deve inserir ou atualizar os dados da sessão com sucesso e retornar true', async () => {
      mockOnConflictDoUpdate.mockResolvedValueOnce(undefined);

      const result = await AuthRepository.upsert(mockDb, mockData);

      expect(mockDb.insert).toHaveBeenCalledWith(localSession);
      expect(mockOnConflictDoUpdate).toHaveBeenCalledWith({
        target: localSession.id,
        set: mockData,
      });
      expect(result).toBe(true);
    });

    it('deve logar o erro e repassar a exceção em caso de falha de gravação', async () => {
      const dbError = new Error('Disco cheio');
      mockOnConflictDoUpdate.mockRejectedValueOnce(dbError);

      await expect(AuthRepository.upsert(mockDb, mockData)).rejects.toThrow('Disco cheio');
      expect(console.error).toHaveBeenCalledWith('Erro no repositório Auth (upsert):', dbError);
    });
  });

  describe('clear', () => {
    it('deve deletar a sessão e retornar true', async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      const result = await AuthRepository.clear(mockDb);

      expect(mockDb.delete).toHaveBeenCalledWith(localSession);
      expect(result).toBe(true);
    });

    it('deve logar o erro e repassar a exceção em caso de falha ao limpar', async () => {
      const dbError = new Error('Tabela bloqueada');
      mockDelete.mockRejectedValueOnce(dbError);

      await expect(AuthRepository.clear(mockDb)).rejects.toThrow('Tabela bloqueada');
      expect(console.error).toHaveBeenCalledWith('Erro no repositório Auth (clear):', dbError);
    });
  });
});