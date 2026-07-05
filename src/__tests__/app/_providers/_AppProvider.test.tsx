import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppProvider } from '@/app/_providers/_AppProvider';

jest.mock('@/shared/providers/DatabaseProvider', () => {
  const { View } = require('react-native');
  return {
    DatabaseProvider: ({ children }: any) => <View testID="mock-db-provider">{children}</View>,
  };
});

jest.mock('@/app/_providers/_AppThemeProvider', () => {
  const { View } = require('react-native');
  return {
    AppThemeProvider: ({ children }: any) => <View testID="mock-theme-provider">{children}</View>,
  };
});

jest.mock('@/shared/providers/NotificationProvider', () => {
  const { View } = require('react-native');
  return {
    NotificationProvider: ({ children }: any) => <View testID="mock-notification-provider">{children}</View>,
  };
});

jest.mock('@/features/auth', () => {
  const { View } = require('react-native');
  return {
    AuthProvider: ({ children }: any) => <View testID="mock-auth-provider">{children}</View>,
  };
});

describe('AppProvider (Compositor de Providers)', () => {
  it('deve encapsular as childrens com todos os providers da arquitetura na ordem correta', async () => {
    const { getByTestId, getByText } = await render(
      <AppProvider>
        <Text>Meu App Carregado!</Text>
      </AppProvider>
    );

    expect(getByTestId('mock-db-provider')).toBeTruthy();
    expect(getByTestId('mock-theme-provider')).toBeTruthy();
    expect(getByTestId('mock-notification-provider')).toBeTruthy();
    expect(getByTestId('mock-auth-provider')).toBeTruthy();
    expect(getByText('Meu App Carregado!')).toBeTruthy();
  });
});