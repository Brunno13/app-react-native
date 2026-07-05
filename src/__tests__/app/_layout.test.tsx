import React from 'react';
import { render } from '@testing-library/react-native';
import { useRouter, useSegments } from 'expo-router';
import { useGlobalAuth } from '@/features/auth';
import RootLayout from '@/app/_layout';

jest.mock('../../shared/config/i18n', () => ({}));

jest.mock('@/features/auth', () => ({
  useGlobalAuth: jest.fn(),
}));

jest.mock('@/app/_providers/_AppProvider', () => {
  const { View } = require('react-native');
  return {
    AppProvider: ({ children }: any) => <View testID="mock-app-provider">{children}</View>,
  };
});

jest.mock('react-error-boundary', () => {
  const { View } = require('react-native');
  return {
    ErrorBoundary: ({ children }: any) => <View testID="mock-error-boundary">{children}</View>,
  };
});

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  const MockStack = ({ children }: any) => <View testID="mock-stack">{children}</View>;
  MockStack.Screen = ({ name }: any) => <View testID={`mock-screen-${name}`} />;
  
  return {
    Stack: MockStack,
    useRouter: jest.fn(),
    useSegments: jest.fn(),
  };
});

describe('RootLayout & AppNavigation', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  describe('Renderização Estrutural', () => {
    it('deve encapsular a navegação com o ErrorBoundary e o AppProvider', async () => {
      (useGlobalAuth as jest.Mock).mockReturnValue({ session: null, isPending: true });
      (useSegments as jest.Mock).mockReturnValue([]);

      const { getByTestId } = await render(<RootLayout />);

      expect(getByTestId('mock-error-boundary')).toBeTruthy();
      expect(getByTestId('mock-app-provider')).toBeTruthy();
      expect(getByTestId('mock-stack')).toBeTruthy();
      expect(getByTestId('mock-screen-(auth)')).toBeTruthy();
      expect(getByTestId('mock-screen-(main)')).toBeTruthy();
    });
  });

  describe('Lógica de Roteamento (Guarda de Rotas)', () => {
    it('não deve redirecionar se o estado de autenticação estiver pendente (carregando)', async () => {
      (useGlobalAuth as jest.Mock).mockReturnValue({ session: null, isPending: true });
      (useSegments as jest.Mock).mockReturnValue(['(main)']);

      await render(<RootLayout />);

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('deve redirecionar para /(auth)/login se o usuário NÃO tiver sessão e NÃO estiver no grupo de auth', async () => {
      (useGlobalAuth as jest.Mock).mockReturnValue({ session: null, isPending: false });
      (useSegments as jest.Mock).mockReturnValue(['(main)']);

      await render(<RootLayout />);

      expect(mockReplace).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });

    it('NÃO deve redirecionar para login se o usuário não tiver sessão, mas já estiver em uma tela pública', async () => {
      (useGlobalAuth as jest.Mock).mockReturnValue({ session: null, isPending: false });
      (useSegments as jest.Mock).mockReturnValue(['(auth)', 'login']);

      await render(<RootLayout />);

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('deve redirecionar para a HOME se o usuário TIVER sessão e estiver na raiz do app', async () => {
      (useGlobalAuth as jest.Mock).mockReturnValue({ session: { user: 'Brunno' }, isPending: false });
      (useSegments as jest.Mock).mockReturnValue([]);

      await render(<RootLayout />);

      expect(mockReplace).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/(main)/(tabs)/home');
    });

    it('deve redirecionar para a HOME se o usuário TIVER sessão e tentar acessar uma tela de login/cadastro', async () => {
      (useGlobalAuth as jest.Mock).mockReturnValue({ session: { user: 'Brunno' }, isPending: false });
      (useSegments as jest.Mock).mockReturnValue(['(auth)', 'login']);

      await render(<RootLayout />);

      expect(mockReplace).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/(main)/(tabs)/home');
    });

    it('NÃO deve redirecionar se o usuário TIVER sessão e já estiver dentro do fluxo principal (main)', async () => {
      (useGlobalAuth as jest.Mock).mockReturnValue({ session: { user: 'Brunno' }, isPending: false });
      (useSegments as jest.Mock).mockReturnValue(['(main)', '(tabs)', 'home']);

      await render(<RootLayout />);

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});