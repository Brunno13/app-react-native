import { renderHook, act } from '@testing-library/react-native';
import { DeviceEventEmitter } from 'react-native';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './useAuth';
import { AuthApi } from '../api/authApi';
import { AuthStorageService } from '../services/authStorageService';
import { useNotification } from '@/shared/providers/NotificationProvider';

// --- MOCKS ---

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
}));
jest.spyOn(DeviceEventEmitter, 'emit');

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/shared/providers/NotificationProvider', () => ({
  useNotification: jest.fn(),
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('../api/authApi', () => ({
  AuthApi: {
    signInWithEmail: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock('../services/authStorageService', () => ({
  AuthStorageService: {
    clearHybridSession: jest.fn(),
  },
}));

jest.mock('@/shared/db/client', () => ({
  db: {},
}));

describe('useAuth Hook', () => {
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNotification as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // --- SUÍTE 1: LOGIN ---

  it('deve bloquear o login e retornar erro se o dispositivo estiver offline', async () => {
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValueOnce({
      isConnected: false,
      isInternetReachable: false,
    });

    const { result } = await renderHook(() => useAuth());

    let response: any;
    await act(async () => {
      response = await result.current.signIn('teste@teste.com', '123');
    });

    expect(response?.error?.code).toBe('OFFLINE');
    expect(response?.error?.message).toBe('alerts.networkOfflineMessage');
    expect(AuthApi.signInWithEmail).not.toHaveBeenCalled();
  });

  it('deve realizar login com sucesso em cenário ideal', async () => {
    (AuthApi.signInWithEmail as jest.Mock).mockResolvedValueOnce({
      data: { user: 'Brunno' },
      error: null,
    });

    const { result } = await renderHook(() => useAuth());

    let response: any;
    await act(async () => {
      response = await result.current.signIn('teste@teste.com', 'senha123');
    });

    expect(AuthApi.signInWithEmail).toHaveBeenCalledWith('teste@teste.com', 'senha123');
    expect(response?.data?.user).toBe('Brunno');
    expect(result.current.loading).toBe(false);
  });

 it('deve disparar erro de TIMEOUT se a API demorar mais de 10 segundos', async () => {
    jest.useFakeTimers();

    let resolveFakeApi: (value: any) => void;
    const fakeApiPromise = new Promise((resolve) => {
      resolveFakeApi = resolve;
    });

    (AuthApi.signInWithEmail as jest.Mock).mockImplementationOnce(() => fakeApiPromise);

    const { result } = await renderHook(() => useAuth());

    let promiseToResolve: Promise<any>;
    await act(async () => {
      promiseToResolve = result.current.signIn('lento@teste.com', '123');
    });

    await act(async () => {
      jest.advanceTimersByTime(11000);
    });

    const response = await promiseToResolve!;

    expect(response.error.code).toBe('TIMEOUT');
    expect(response.error.message).toBe('alerts.timeoutMessage');
    expect(result.current.loading).toBe(false);

    resolveFakeApi!({ data: null, error: null });
    
    jest.runOnlyPendingTimers();
  });

  // --- SUÍTE 2: LOGOUT ---

  it('deve limpar dados, redefinir tema e redirecionar no signOut', async () => {
    const { result } = await renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(AuthStorageService.clearHybridSession).toHaveBeenCalledTimes(1);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('app_theme');
    expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('onThemeChange', 'system');
    expect(AuthApi.signOut).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('deve exibir um Toast de erro se a rotina de signOut falhar no meio', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (AuthStorageService.clearHybridSession as jest.Mock).mockRejectedValueOnce(new Error('DB falhou'));

    const { result } = await renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      'alerts.error', 
      'alerts.logoutFailed', 
      'error'
    );
    expect(result.current.loading).toBe(false);

    consoleSpy.mockRestore();
  });
});