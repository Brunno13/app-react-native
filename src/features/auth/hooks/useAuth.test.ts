import { renderHook, act } from '@testing-library/react-native';
import { DeviceEventEmitter } from 'react-native';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './useAuth';
import { AuthApi } from '../api/authApi';
import { AuthStorageService } from '../services/authStorageService';
import { useNotification } from '@/shared/providers/NotificationProvider';

type UseAuthResult = ReturnType<typeof useAuth>;
type SignInResult = Awaited<ReturnType<UseAuthResult['signIn']>>;
type SignInPromise = ReturnType<UseAuthResult['signIn']>;
type SignInApiResponse = Awaited<ReturnType<typeof AuthApi.signInWithEmail>>;

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
}));
const deviceEmitSpy = jest.spyOn(DeviceEventEmitter, 'emit');

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
    signUpWithEmail: jest.fn(),
    forgetPassword: jest.fn(),
    signInWithSocial: jest.fn(),
    changePassword: jest.fn(),
    listSessions: jest.fn(),
    revokeSession: jest.fn(),
    updateUser: jest.fn(),
    getSession: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock('../services/authStorageService', () => ({
  AuthStorageService: {
    clearHybridSession: jest.fn(),
    saveHybridSession: jest.fn(),
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

  it('deve bloquear o login e retornar erro se o dispositivo estiver offline', async () => {
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValueOnce({
      isConnected: false,
      isInternetReachable: false,
    });

    const { result } = await renderHook(() => useAuth());

    let response: SignInResult | undefined;
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

    let response: SignInResult | undefined;
    await act(async () => {
      response = await result.current.signIn('teste@teste.com', 'senha123');
    });

    expect(AuthApi.signInWithEmail).toHaveBeenCalledWith('teste@teste.com', 'senha123');
    expect(response?.data).toEqual({ user: 'Brunno' });
    expect(result.current.loading).toBe(false);
  });

 it('deve disparar erro de TIMEOUT se a API demorar mais de 10 segundos', async () => {
    jest.useFakeTimers();

    const fakeApiPromise = new Promise<SignInApiResponse>(() => undefined);

    (AuthApi.signInWithEmail as jest.Mock).mockImplementationOnce(() => fakeApiPromise);

    const { result } = await renderHook(() => useAuth());

    let promiseToResolve: SignInPromise | undefined;
    await act(() => {
      promiseToResolve = result.current.signIn('lento@teste.com', '123');
    });

    await act(() => {
      jest.advanceTimersByTime(11000);
    });

    if (!promiseToResolve) {
      throw new Error('Promise de login nao foi criada');
    }

    const response = await promiseToResolve;

    expect(response.error?.code).toBe('TIMEOUT');
    expect(response.error?.message).toBe('alerts.timeoutMessage');
    expect(result.current.loading).toBe(false);


    jest.runOnlyPendingTimers();
  });

  it('deve limpar dados, redefinir tema e redirecionar no signOut', async () => {
    const { result } = await renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(AuthStorageService.clearHybridSession).toHaveBeenCalledTimes(1);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('app_theme');
    expect(deviceEmitSpy).toHaveBeenCalledWith('onThemeChange', 'system');
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

  it('deve delegar as demais ações de autenticação para AuthApi', async () => {
    const successResponse = { data: null, error: null };

    (AuthApi.signUpWithEmail as jest.Mock).mockResolvedValueOnce(successResponse);
    (AuthApi.forgetPassword as jest.Mock).mockResolvedValueOnce(successResponse);
    (AuthApi.signInWithSocial as jest.Mock).mockResolvedValueOnce(successResponse);
    (AuthApi.changePassword as jest.Mock).mockResolvedValueOnce(successResponse);
    (AuthApi.listSessions as jest.Mock).mockResolvedValueOnce(successResponse);
    (AuthApi.revokeSession as jest.Mock).mockResolvedValueOnce(successResponse);

    const { result } = await renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp('novo@teste.com', 'senha123', 'Novo Usuario');
      await result.current.forgetPassword('novo@teste.com');
      await result.current.signInWithSocial('google');
      await result.current.changePassword('novaSenha123', 'senhaAtual123');
      await result.current.getActiveSessions();
      await result.current.revokeDeviceSession('session-token');
    });

    expect(AuthApi.signUpWithEmail).toHaveBeenCalledWith(
      'novo@teste.com',
      'senha123',
      'Novo Usuario',
    );
    expect(AuthApi.forgetPassword).toHaveBeenCalledWith('novo@teste.com');
    expect(AuthApi.signInWithSocial).toHaveBeenCalledWith('google');
    expect(AuthApi.changePassword).toHaveBeenCalledWith(
      'novaSenha123',
      'senhaAtual123',
    );
    expect(AuthApi.listSessions).toHaveBeenCalledTimes(1);
    expect(AuthApi.revokeSession).toHaveBeenCalledWith('session-token');
    expect(result.current.loading).toBe(false);
  });

  it('deve normalizar exceção lançada por uma ação de autenticação', async () => {
    (AuthApi.signInWithSocial as jest.Mock).mockRejectedValueOnce(
      new Error('Falha social'),
    );

    const { result } = await renderHook(() => useAuth());

    let response:
      | Awaited<ReturnType<UseAuthResult['signInWithSocial']>>
      | undefined;

    await act(async () => {
      response = await result.current.signInWithSocial('github');
    });

    expect(response?.data).toBeNull();
    expect(response?.error).toEqual({
      code: 'UNKNOWN',
      message: 'Falha social',
    });
    expect(result.current.loading).toBe(false);
  });

  it('deve usar a mensagem de fallback para erro sem estrutura', async () => {
    (AuthApi.forgetPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: 'erro-sem-estrutura',
    });

    const { result } = await renderHook(() => useAuth());

    let response:
      | Awaited<ReturnType<UseAuthResult['forgetPassword']>>
      | undefined;

    await act(async () => {
      response = await result.current.forgetPassword('teste@teste.com');
    });

    expect(response?.error).toEqual({
      code: 'UNKNOWN',
      message: 'alerts.unknownError',
    });
  });

  it('deve atualizar o usuario e persistir a sessão renovada', async () => {
    const updateResponse = {
      data: { updated: true },
      error: null,
    };
    const freshSession = {
      session: { id: 'session-1' },
      user: { id: 'user-1' },
    };

    (AuthApi.updateUser as jest.Mock).mockResolvedValueOnce(updateResponse);
    (AuthApi.getSession as jest.Mock).mockResolvedValueOnce({
      data: freshSession,
      error: null,
    });
    (AuthStorageService.saveHybridSession as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = await renderHook(() => useAuth());

    await act(async () => {
      await result.current.updateUser({ name: 'Brunno Atualizado' });
    });

    expect(AuthApi.updateUser).toHaveBeenCalledWith({
      name: 'Brunno Atualizado',
    });
    expect(AuthApi.getSession).toHaveBeenCalledTimes(1);
    expect(AuthStorageService.saveHybridSession).toHaveBeenCalledWith(
      {},
      freshSession.session,
      freshSession.user,
    );
  });

  it('deve ignorar persistência quando a sessão renovada não tiver dados', async () => {
    (AuthApi.updateUser as jest.Mock).mockResolvedValueOnce({
      data: { updated: true },
      error: null,
    });
    (AuthApi.getSession as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const { result } = await renderHook(() => useAuth());

    await act(async () => {
      await result.current.updateUser({ image: 'avatar.png' });
    });

    expect(AuthApi.getSession).toHaveBeenCalledTimes(1);
    expect(AuthStorageService.saveHybridSession).not.toHaveBeenCalled();
  });

  it('não deve renovar a sessão quando updateUser retornar erro', async () => {
    (AuthApi.updateUser as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Falha ao atualizar',
      },
    });

    const { result } = await renderHook(() => useAuth());

    let response:
      | Awaited<ReturnType<UseAuthResult['updateUser']>>
      | undefined;

    await act(async () => {
      response = await result.current.updateUser({ name: 'Falha' });
    });

    expect(response?.error).toEqual({
      code: 'UPDATE_FAILED',
      message: 'Falha ao atualizar',
    });
    expect(AuthApi.getSession).not.toHaveBeenCalled();
    expect(AuthStorageService.saveHybridSession).not.toHaveBeenCalled();
  });
});