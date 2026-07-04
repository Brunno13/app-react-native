import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { AuthProvider, useGlobalAuth } from './AuthProvider';
import { AuthApi } from '../api/authApi';
import { AuthStorageService } from '../services/authStorageService';
import { setUnauthorizedInterceptor } from '@/shared/api/apiClient';

// --- MOCKS ---
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
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

// Componente "Dublê" apenas para ler o que o Provider está distribuindo
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
    // 1. Simula falta de internet
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false, isInternetReachable: false });
    (AuthApi.useSession as jest.Mock).mockReturnValue({ data: null, isPending: false });
    
    // 2. Simula um cache válido no SQLite (expira apenas amanhã)
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

    // 3. Garante que a interface recebe os dados do banco local
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
});