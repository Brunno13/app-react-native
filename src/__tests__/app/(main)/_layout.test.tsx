import React from 'react';
import { render } from '@testing-library/react-native';
import { useGlobalAuth } from '@/features/auth';
import { usePreferences } from '@/features/profile';
import MainLayout from '@/app/(main)/_layout';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      text: '#000000',
      background: '#F0F0F0',
    },
  }),
}));

jest.mock('@/features/auth', () => {
  const { View, Text } = require('react-native');
  return {
    useGlobalAuth: jest.fn(),
    
    BiometricGate: ({ isBiometricsEnabled, loading, children }: any) => (
      <View testID="mock-biometric-gate">
        <Text testID="prop-bio">{String(isBiometricsEnabled)}</Text>
        <Text testID="prop-loading">{String(loading)}</Text>
        {children}
      </View>
    ),
  };
});

jest.mock('@/features/profile', () => ({
  usePreferences: jest.fn(),
}));

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  
  const MockStack = ({ children, screenOptions }: any) => (
    <View testID="mock-stack" screenOptions={screenOptions}>
      {children}
    </View>
  );
  
  MockStack.Screen = ({ name, options }: any) => (
    <View testID={`mock-screen-${name}`} options={options} />
  );
  
  return { Stack: MockStack };
});

describe('MainLayout (Camada App - Área Protegida)', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();

    (useGlobalAuth as jest.Mock).mockReturnValue({
      session: { user: { id: mockUserId } },
    });

    (usePreferences as jest.Mock).mockReturnValue({
      preferences: { isBiometricsEnabled: true },
      loading: false,
    });
  });

  it('deve repassar o ID do usuário da sessão para o hook usePreferences', async () => {
    await render(<MainLayout />);

    expect(usePreferences).toHaveBeenCalledWith(mockUserId);
  });

  it('deve repassar fallback (false) para isBiometricsEnabled quando preferences for undefined/null', async () => {
    (usePreferences as jest.Mock).mockReturnValue({
      preferences: null,
      loading: false,
    });

    const { getByTestId } = await render(<MainLayout />);

    expect(getByTestId('prop-bio').props.children).toBe('false');
  });

  it('deve repassar o estado correto de loading e biometria habilitada para o BiometricGate', async () => {
    (usePreferences as jest.Mock).mockReturnValue({
      preferences: { isBiometricsEnabled: true },
      loading: true,
    });

    const { getByTestId } = await render(<MainLayout />);

    expect(getByTestId('prop-loading').props.children).toBe('true');
    expect(getByTestId('prop-bio').props.children).toBe('true');
  });

  it('deve configurar o Stack globalmente com as cores corretas do ThemeProvider', async () => {
    const { getByTestId } = await render(<MainLayout />);

    const stack = getByTestId('mock-stack');
    
    expect(stack.props.screenOptions).toEqual(
      expect.objectContaining({
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#000000',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#F0F0F0' },
      })
    );
  });

  it('deve configurar a rota (tabs) para não exibir o cabeçalho (headerShown: false)', async () => {
    const { getByTestId } = await render(<MainLayout />);

    const tabsScreen = getByTestId('mock-screen-(tabs)');
    expect(tabsScreen.props.options).toEqual({ headerShown: false });
  });

  it('deve configurar as rotas edit-profile e security com os títulos traduzidos e formato card', async () => {
    const { getByTestId } = await render(<MainLayout />);

    const editProfileScreen = getByTestId('mock-screen-edit-profile');
    expect(editProfileScreen.props.options).toEqual({ 
      title: 'navigation.editProfile', 
      presentation: 'card' 
    });

    const securityScreen = getByTestId('mock-screen-security');
    expect(securityScreen.props.options).toEqual({ 
      title: 'navigation.security', 
      presentation: 'card' 
    });
  });
});