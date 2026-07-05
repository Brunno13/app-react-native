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
  const { Text } = require('react-native');
  return {
    FontAwesome: ({ name, color }: any) => (
      <Text testID={`icon-${name}`} style={{ color }}>{name}</Text>
    )
  };
});

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  
  const MockTabs = ({ children, screenOptions }: any) => (
    <View testID="mock-tabs" screenOptions={screenOptions}>
      {children}
    </View>
  );
  
  MockTabs.Screen = ({ name, options }: any) => {
    const IconComponent = options.tabBarIcon ? options.tabBarIcon({ color: '#TEST_COLOR' }) : null;
    
    return (
      <View testID={`mock-screen-${name}`} options={options}>
        {IconComponent}
      </View>
    );
  };
  
  return { Tabs: MockTabs };
});

describe('TabsLayout (Camada App - Navegação Inferior)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve configurar o Tabs com as cores do tema e sem cabeçalho (headerShown: false)', async () => {
    const { getByTestId } = await render(<TabsLayout />);
    
    const tabs = getByTestId('mock-tabs');
    
    expect(tabs.props.screenOptions).toEqual({
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E5E5E5',
      },
      tabBarActiveTintColor: '#3B82F6',
      tabBarInactiveTintColor: '#9CA3AF',
      headerShown: false,
    });
  });

  it('deve configurar a aba "home" com o título traduzido e o ícone correto', async () => {
    const { getByTestId } = await render(<TabsLayout />);
    
    const homeScreen = getByTestId('mock-screen-home');
    expect(homeScreen.props.options.title).toBe('navigation.home');
    
    const homeIcon = getByTestId('icon-home');
    expect(homeIcon.props.children).toBe('home');
    expect(homeIcon.props.style.color).toBe('#TEST_COLOR');
  });

  it('deve configurar a aba "profile" com o título traduzido e o ícone correto', async () => {
    const { getByTestId } = await render(<TabsLayout />);
    
    const profileScreen = getByTestId('mock-screen-profile');
    expect(profileScreen.props.options.title).toBe('navigation.profile');

    const profileIcon = getByTestId('icon-user');
    expect(profileIcon.props.children).toBe('user');
    expect(profileIcon.props.style.color).toBe('#TEST_COLOR');
  });
});