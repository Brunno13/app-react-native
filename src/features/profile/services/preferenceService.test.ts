import { PreferenceService } from './preferenceService';
import { PreferencesRepository } from '@/shared/db/repositories/preferencesRepository';

jest.mock('@/shared/db/repositories/preferencesRepository', () => ({
  PreferencesRepository: {
    get: jest.fn(),
    upsert: jest.fn(),
  },
}));

describe('PreferenceService', () => {
  const mockDb = {} as any;
  const mockUserId = 'user-123';

  const DEFAULT_PREFERENCES = {
    theme: 'system',
    isOfflineModeEnabled: false,
    isBiometricsEnabled: false,
  };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPreferences', () => {
    it('deve retornar as preferências formatadas corretamente quando o repositório encontrar os dados', async () => {
      (PreferencesRepository.get as jest.Mock).mockResolvedValueOnce({
        theme: 'dark',
        isOfflineModeEnabled: true,
        isBiometricsEnabled: true,
      });

      const result = await PreferenceService.getUserPreferences(mockDb, mockUserId);

      expect(PreferencesRepository.get).toHaveBeenCalledWith(mockDb, mockUserId);
      expect(result).toEqual({
        theme: 'dark',
        isOfflineModeEnabled: true,
        isBiometricsEnabled: true,
      });
    });

    it('deve usar os valores default caso o repositório retorne dados parciais ou inválidos', async () => {
      (PreferencesRepository.get as jest.Mock).mockResolvedValueOnce({
        theme: null,
        isOfflineModeEnabled: true,
      });

      const result = await PreferenceService.getUserPreferences(mockDb, mockUserId);

      expect(result).toEqual({
        theme: 'system',
        isOfflineModeEnabled: true,
        isBiometricsEnabled: false,
      });
    });

    it('deve retornar DEFAULT_PREFERENCES se o repositório retornar null', async () => {
      (PreferencesRepository.get as jest.Mock).mockResolvedValueOnce(null);

      const result = await PreferenceService.getUserPreferences(mockDb, mockUserId);

      expect(result).toEqual(DEFAULT_PREFERENCES);
    });

    it('deve retornar DEFAULT_PREFERENCES em caso de exceção no repositório', async () => {
      (PreferencesRepository.get as jest.Mock).mockRejectedValueOnce(new Error('DB Query Failed'));

      const result = await PreferenceService.getUserPreferences(mockDb, mockUserId);

      expect(result).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('updateUserPreferences', () => {
    it('deve repassar a atualização para o repositório e retornar o sucesso da operação', async () => {
      const updates = { theme: 'light' as const };
      
      (PreferencesRepository.upsert as jest.Mock).mockResolvedValueOnce(true);

      const result = await PreferenceService.updateUserPreferences(mockDb, mockUserId, updates);

      expect(PreferencesRepository.upsert).toHaveBeenCalledWith(mockDb, mockUserId, updates);
      expect(result).toBe(true);
    });

    it('deve capturar erros, registrar no console e retornar false em caso de falha', async () => {
      const updates = { isBiometricsEnabled: true };
      
      const dbError = new Error('Disk Full');
      (PreferencesRepository.upsert as jest.Mock).mockRejectedValueOnce(dbError);

      const result = await PreferenceService.updateUserPreferences(mockDb, mockUserId, updates);

      expect(console.error).toHaveBeenCalledWith('Falha ao atualizar preferências no serviço:', dbError);
      expect(result).toBe(false);
    });
  });
});