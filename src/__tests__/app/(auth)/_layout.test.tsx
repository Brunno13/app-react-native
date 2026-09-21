import React, { type PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';
import AuthLayout from '@/app/(auth)/_layout';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('expo-router', () => {
  const { View } =
    jest.requireActual<typeof import('react-native')>('react-native');

  type MockStackProps = PropsWithChildren<{
    screenOptions?: {
      animation?: string;
    };
  }>;

  type MockScreenProps = {
    name: string;
    options?: {
      title?: string;
      headerShown?: boolean;
    };
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

describe('AuthLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o Stack contêiner com a animação correta', async () => {
    const { getByTestId } = await render(<AuthLayout />);

    expect(getByTestId('mock-stack')).toHaveProp(
      'accessibilityLabel',
      JSON.stringify({ animation: 'slide_from_right' }),
    );
  });

  it('deve configurar a tela de login sem cabeçalho (headerShown: false)', async () => {
    const { getByTestId } = await render(<AuthLayout />);

    expect(getByTestId('mock-screen-login')).toHaveProp(
      'accessibilityLabel',
      JSON.stringify({ headerShown: false }),
    );
  });

  it('deve configurar a tela de signup com o título traduzido e sem cabeçalho', async () => {
    const { getByTestId } = await render(<AuthLayout />);

    expect(getByTestId('mock-screen-signup')).toHaveProp(
      'accessibilityLabel',
      JSON.stringify({
        title: 'navigation.signUp',
        headerShown: false,
      }),
    );
  });

  it('deve configurar a tela de forgot-password com o título traduzido e sem cabeçalho', async () => {
    const { getByTestId } = await render(<AuthLayout />);

    expect(getByTestId('mock-screen-forgot-password')).toHaveProp(
      'accessibilityLabel',
      JSON.stringify({
        title: 'navigation.forgotPassword',
        headerShown: false,
      }),
    );
  });
});
