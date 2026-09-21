import React from 'react';
import { render } from '@testing-library/react-native';
import { useGlobalAuth } from '@/features/auth';
import { usePreferences } from '@/features/profile';
import MainLayout from '@/app/(main)/_layout';

type BiometricGateMockProps = React.ComponentProps<(typeof import('@/features/auth'))['BiometricGate']>;

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
  const { View, Text } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    useGlobalAuth: jest.fn(),

    BiometricGate: ({ isBiometricsEnabled, loading, children }: BiometricGateMockProps) => (
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
  const { View } =
    jest.requireActual<typeof import('react-native')>('react-native');

  type MockStackProps = React.PropsWithChildren<{
    screenOptions?: unknown;
  }>;

  type MockScreenProps = {
    name: string;
    options?: unknown;
  };

  const MockStack = Object.assign(
    ({ children, screenOptions }: MockStackProps) => (
      <View
        testID="mock-stack"
        accessibilityLabel={JSON.stringify(screenOptions)}
      >
        {children}
      </View>
    ),
    {
      Screen: ({ name, options }: MockScreenProps) => (
        <View
          testID={`mock-screen-${name}`}
          accessibilityLabel={JSON.stringify(options)}
        />
      ),
    },
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

    expect(getByTestId('mock-stack')).toHaveProp(
      'accessibilityLabel',
      JSON.stringify({
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#000000',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#F0F0F0' },
      }),
    );
  });

  it('deve configurar a rota (tabs) para não exibir o cabeçalho (headerShown: false)', async () => {
    const { getByTestId } = await render(<MainLayout />);

    expect(getByTestId('mock-screen-(tabs)')).toHaveProp(
      'accessibilityLabel',
      JSON.stringify({ headerShown: false }),
    );
  });

  it('deve configurar as rotas edit-profile e security com os títulos traduzidos e formato card', async () => {
    const { getByTestId } = await render(<MainLayout />);

    expect(getByTestId('mock-screen-edit-profile')).toHaveProp(
      'accessibilityLabel',
      JSON.stringify({
        title: 'navigation.editProfile',
        presentation: 'card',
      }),
    );

    expect(getByTestId('mock-screen-security')).toHaveProp(
      'accessibilityLabel',
      JSON.stringify({
        title: 'navigation.security',
        presentation: 'card',
      }),
    );
  });
});
