import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { AuthProvider, useGlobalAuth } from './AuthProvider';
import { AuthApi } from '../api/authApi';
import { AuthStorageService } from '../services/authStorageService';
import { setUnauthorizedInterceptor } from '@/shared/api/apiClient';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

jest.mock('@/shared/api/apiClient', () => ({
  setUnauthorizedInterceptor: jest.fn(),
}));

jest.mock('../api/authApi', () => ({
  AuthApi: {
    useSession: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock('../services/authStorageService', () => ({
  AuthStorageService: {
    getValidSession: jest.fn(),
    saveHybridSession: jest.fn(),
    clearHybridSession: jest.fn(),
  },
}));

jest.mock('@/shared/db/client', () => ({ db: {} }));

const mockedSetUnauthorizedInterceptor = jest.mocked(
  setUnauthorizedInterceptor,
);

const DummyChild = () => {
  const { session, isPending } = useGlobalAuth();
  return (
    <>
      <Text testID="pending-status">{isPending.toString()}</Text>
      <Text testID="user-name">{session ? session.user.name : 'Deslogado'}</Text>
    </>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve inicializar com a sessão do servidor e salvar em cache se estiver online', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true, isInternetReachable: true });
    (AuthApi.useSession as jest.Mock).mockReturnValue({
      data: { session: { id: 'token123' }, user: { name: 'Brunno Servidor' } },
      isPending: false,
    });

    const { getByTestId } = await render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('pending-status').props.children).toBe('false');
      expect(getByTestId('user-name').props.children).toBe('Brunno Servidor');
    });

    expect(AuthStorageService.saveHybridSession).toHaveBeenCalled();
  });

  it('deve carregar a sessão offline do banco de dados se estiver sem internet e a sessão for válida', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false, isInternetReachable: false });
    (AuthApi.useSession as jest.Mock).mockReturnValue({ data: null, isPending: false });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    (AuthStorageService.getValidSession as jest.Mock).mockResolvedValue({
      user: { userId: '1', name: 'Brunno Offline', expiresAt: futureDate.toISOString() },
      session: { id: 'token123' }
    });

    const { getByTestId } = await render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user-name').props.children).toBe('Brunno Offline');
    });
  });

  it('deve injetar a regra de segurança do 401 (IoC) no apiClient durante a montagem', async () => {
    (AuthApi.useSession as jest.Mock).mockReturnValue({ data: null, isPending: false });
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true, isInternetReachable: true });

    const { getByTestId } = await render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('pending-status').props.children).toBe('false');
      expect(setUnauthorizedInterceptor).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  it('deve limpar a sessao e redirecionar quando a API retornar 401', async () => {
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    (AuthApi.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
    });
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
    (AuthStorageService.clearHybridSession as jest.Mock).mockResolvedValue(
      true,
    );
    (AuthApi.signOut as jest.Mock).mockResolvedValue(undefined);

    const { getByTestId } = await render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('pending-status').props.children).toBe(
        'false',
      );
      expect(mockedSetUnauthorizedInterceptor).toHaveBeenCalled();
    });

    const interceptor =
      mockedSetUnauthorizedInterceptor.mock.calls[0]?.[0];

    if (!interceptor) {
      throw new Error('Interceptor 401 nao foi registrado');
    }

    await interceptor();

    expect(AuthStorageService.clearHybridSession).toHaveBeenCalledWith({});
    expect(AuthApi.signOut).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');

    consoleWarnSpy.mockRestore();
  });

  it('deve redirecionar mesmo se a limpeza do 401 falhar', async () => {
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const logoutError = new Error('Falha ao limpar sessao');

    (AuthApi.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
    });
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
    (AuthStorageService.clearHybridSession as jest.Mock).mockRejectedValueOnce(
      logoutError,
    );

    const { getByTestId } = await render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('pending-status').props.children).toBe(
        'false',
      );
      expect(mockedSetUnauthorizedInterceptor).toHaveBeenCalled();
    });

    const interceptor =
      mockedSetUnauthorizedInterceptor.mock.calls[0]?.[0];

    if (!interceptor) {
      throw new Error('Interceptor 401 nao foi registrado');
    }

    await interceptor();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro ao limpar sessão local durante o 401:',
      logoutError,
    );
    expect(AuthApi.signOut).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');

    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('deve finalizar a inicializacao mesmo se NetInfo falhar', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const networkError = new Error('NetInfo indisponivel');

    (AuthApi.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
    });
    (NetInfo.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    const { getByTestId } = await render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('pending-status').props.children).toBe(
        'false',
      );
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Falha na inicialização do fluxo de autenticação offline:',
      networkError,
    );
    expect(AuthStorageService.getValidSession).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('deve permanecer deslogado quando estiver offline sem sessao em cache', async () => {
    (AuthApi.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
    });
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    });
    (AuthStorageService.getValidSession as jest.Mock).mockResolvedValue(null);

    const { getByTestId } = await render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('pending-status').props.children).toBe(
        'false',
      );
      expect(getByTestId('user-name').props.children).toBe(
        'Deslogado',
      );
    });

    expect(AuthStorageService.getValidSession).toHaveBeenCalledWith({});
    expect(AuthStorageService.saveHybridSession).not.toHaveBeenCalled();
  });

  it('deve remover o interceptor 401 ao desmontar o provider', async () => {
    (AuthApi.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
    });
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });

    const { getByTestId, unmount } = await render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('pending-status').props.children).toBe(
        'false',
      );
      expect(mockedSetUnauthorizedInterceptor).toHaveBeenCalled();
    });

    const callsBeforeUnmount =
      mockedSetUnauthorizedInterceptor.mock.calls.length;

    await unmount();

    expect(mockedSetUnauthorizedInterceptor).toHaveBeenCalledTimes(
      callsBeforeUnmount + 1,
    );

    const cleanupInterceptor =
      mockedSetUnauthorizedInterceptor.mock.calls.at(-1)?.[0];

    if (!cleanupInterceptor) {
      throw new Error('Interceptor de cleanup nao foi registrado');
    }

    jest.clearAllMocks();

    await cleanupInterceptor();

    expect(AuthStorageService.clearHybridSession).not.toHaveBeenCalled();
    expect(AuthApi.signOut).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});