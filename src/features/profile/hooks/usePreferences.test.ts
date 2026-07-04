import { renderHook, act, waitFor } from '@testing-library/react-native';
import { DeviceEventEmitter } from 'react-native';
import { usePreferences } from './usePreferences';
import { PreferenceService } from '../services/preferenceService';

jest.mock('@/shared/providers', () => {
  const mockDb = { mock: 'sqlite-db-instance' };
  
  return {
    useDatabase: () => ({
      db: mockDb,
    }),
  };
});

jest.mock('../services/preferenceService', () => ({
  PreferenceService: {
    getUserPreferences: jest.fn(),
    updateUserPreferences: jest.fn(),
  },
}));

describe('usePreferences Hook', () => {
  const mockUserId = 'user-123';
  const initialPrefs = { theme: 'system', isOfflineModeEnabled: false };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(DeviceEventEmitter, 'emit');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('deve retornar loading falso e preferências nulas se não houver userId', async () => {
    const { result } = await renderHook(() => usePreferences(undefined));

    expect(result.current.loading).toBe(false);
    expect(result.current.preferences).toBeNull();
    expect(PreferenceService.getUserPreferences).not.toHaveBeenCalled();
  });

  it('deve carregar as preferências do usuário na montagem', async () => {
    (PreferenceService.getUserPreferences as jest.Mock).mockResolvedValueOnce(initialPrefs);

    const { result } = await renderHook(() => usePreferences(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(PreferenceService.getUserPreferences).toHaveBeenCalledWith(
      { mock: 'sqlite-db-instance' }, 
      mockUserId
    );
    expect(result.current.preferences).toEqual(initialPrefs);
  });

  it('deve atualizar as preferências de forma otimista e emitir evento se alterar o tema', async () => {
    (PreferenceService.getUserPreferences as jest.Mock).mockResolvedValueOnce(initialPrefs);
    (PreferenceService.updateUserPreferences as jest.Mock).mockResolvedValueOnce(true); 

    const { result } = await renderHook(() => usePreferences(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success: boolean = false;
    await act(async () => {
      success = await result.current.updatePreferences({ theme: 'dark' });
    });

    expect(success).toBe(true);
    expect(PreferenceService.updateUserPreferences).toHaveBeenCalledWith(
      { mock: 'sqlite-db-instance' },
      mockUserId,
      { theme: 'dark' }
    );
    
    expect(result.current.preferences).toEqual({
      ...initialPrefs,
      theme: 'dark',
    });

    expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('onThemeChange', 'dark');
  });

  it('deve reverter o estado (UI Otimista) se a atualização no banco de dados falhar', async () => {
    (PreferenceService.getUserPreferences as jest.Mock).mockResolvedValueOnce(initialPrefs);
    (PreferenceService.updateUserPreferences as jest.Mock).mockResolvedValueOnce(false); 

    const { result } = await renderHook(() => usePreferences(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.preferences?.isBiometricsEnabled).toBeUndefined();

    let success: boolean = true;
    await act(async () => {
      success = await result.current.updatePreferences({ isBiometricsEnabled: true });
    });

    expect(success).toBe(false);
    expect(result.current.preferences).toEqual(initialPrefs);
    expect(DeviceEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('deve acionar updatePreferences indiretamente ao chamar toggleOfflineMode', async () => {
    (PreferenceService.getUserPreferences as jest.Mock).mockResolvedValueOnce(initialPrefs);
    (PreferenceService.updateUserPreferences as jest.Mock).mockResolvedValueOnce(true);

    const { result } = await renderHook(() => usePreferences(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleOfflineMode(true);
    });

    expect(PreferenceService.updateUserPreferences).toHaveBeenCalledWith(
      expect.anything(),
      mockUserId,
      { isOfflineModeEnabled: true }
    );
    expect(result.current.preferences?.isOfflineModeEnabled).toBe(true);
  });
});