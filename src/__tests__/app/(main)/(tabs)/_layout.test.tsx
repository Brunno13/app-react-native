import React from 'react';
import { render } from '@testing-library/react-native';
import TabsLayout from '@/app/(main)/(tabs)/_layout';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      border: '#E5E5E5',
      primary: '#3B82F6',
      textSecondary: '#9CA3AF',
    },
  }),
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } =
    jest.requireActual<typeof import('react-native')>('react-native');


  return {
    FontAwesome: ({ name, color }: { name: string; color: string }) => (
      <Text
        testID={`icon-${name}`}
        accessibilityLabel={color}
      >
        {name}
      </Text>
    ),
  };
});

jest.mock('expo-router', () => {
  const { View } =
    jest.requireActual<typeof import('react-native')>('react-native');


  const MockTabs = Object.assign(
    ({ children, screenOptions }: { children?: import('react').ReactNode; screenOptions?: unknown }) => (
      <View
        testID="mock-tabs"
        accessibilityLabel={JSON.stringify(screenOptions)}
      >
        {children}
      </View>
    ),
    {
      Screen: ({ name, options }: { name: string; options?: { title?: string; tabBarIcon?: (props: { color: string }) => import('react').ReactNode } }) => {
        const icon = options?.tabBarIcon?.({ color: '#TEST_COLOR' });

        return (
          <View
            testID={`mock-screen-${name}`}
            accessibilityLabel={JSON.stringify({ title: options?.title })}
          >
            {icon}
          </View>
        );
      },
    },
  );

  return { Tabs: MockTabs };
});

describe('TabsLayout (Camada App - Navegação Inferior)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve configurar o Tabs com as cores do tema e sem cabeçalho (headerShown: false)', async () => {
    const { getByTestId } = await render(<TabsLayout />);

    expect(getByTestId('mock-tabs')).toHaveProp(
      'accessibilityLabel',
      JSON.stringify({
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5E5',
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
      }),
    );
  });

  it('deve configurar a aba "home" com o título traduzido e o ícone correto', async () => {
    const { getByTestId } = await render(<TabsLayout />);

    expect(getByTestId('mock-screen-home')).toHaveProp(
      'accessibilityLabel',
      JSON.stringify({ title: 'navigation.home' }),
    );

    expect(getByTestId('icon-home')).toHaveTextContent('home');
    expect(getByTestId('icon-home')).toHaveProp(
      'accessibilityLabel',
      '#TEST_COLOR',
    );
  });

  it('deve configurar a aba "profile" com o título traduzido e o ícone correto', async () => {
    const { getByTestId } = await render(<TabsLayout />);

    expect(getByTestId('mock-screen-profile')).toHaveProp(
      'accessibilityLabel',
      JSON.stringify({ title: 'navigation.profile' }),
    );

    expect(getByTestId('icon-user')).toHaveTextContent('user');
    expect(getByTestId('icon-user')).toHaveProp(
      'accessibilityLabel',
      '#TEST_COLOR',
    );
  });
});
