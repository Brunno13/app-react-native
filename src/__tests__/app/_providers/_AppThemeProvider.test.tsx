import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { DeviceEventEmitter, Text, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AppThemeProvider } from '@/app/_providers/_AppThemeProvider';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(),
}));

jest.mock('@/shared/providers/ThemeProvider', () => {
  const { View, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    SharedThemeProvider: ({ isDark, themePreference, children }: { isDark: boolean; themePreference: 'light' | 'dark' | 'system'; children?: import('react').ReactNode }) => (
      <View testID="mock-shared-theme-provider">
        <Text testID="prop-isDark">{String(isDark)}</Text>
        <Text testID="prop-themePreference">{themePreference}</Text>
        {children}
      </View>
    ),
  };
});

describe('AppThemeProvider', () => {
  const mockUseColorScheme = jest.mocked(useColorScheme);

  beforeEach(() => {
    jest.clearAllMocks();

  });

  it('deve inicializar com o tema "system" (fallback) enquanto aguarda o SecureStore', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    mockUseColorScheme.mockReturnValue('light');

    const { getByTestId, getByText } = await render(
      <AppThemeProvider>
        <Text>Filho</Text>
      </AppThemeProvider>
    );

    expect(getByTestId('prop-themePreference').props.children).toBe('system');
    expect(getByTestId('prop-isDark').props.children).toBe('false');
    expect(getByText('Filho')).toBeTruthy();
  });

  it('deve carregar o tema do SecureStore no mount e atualizar o provider (ex: dark)', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('dark');
    mockUseColorScheme.mockReturnValue('light');

    const { getByTestId } = await render(
      <AppThemeProvider>
        <Text>Filho</Text>
      </AppThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('prop-themePreference').props.children).toBe('dark');
      expect(getByTestId('prop-isDark').props.children).toBe('true');
    });

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('app_theme');
  });

  it('deve escutar o DeviceEventEmitter, atualizar a tela e SALVAR no SecureStore ao trocar para "light"', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    mockUseColorScheme.mockReturnValue('dark');

    const { getByTestId } = await render(
      <AppThemeProvider>
        <Text>Filho</Text>
      </AppThemeProvider>
    );

    await act(() => {
      DeviceEventEmitter.emit('onThemeChange', 'light');
    });

    expect(getByTestId('prop-themePreference').props.children).toBe('light');
    expect(getByTestId('prop-isDark').props.children).toBe('false');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('app_theme', 'light');
  });

  it('deve escutar o DeviceEventEmitter e DELETAR do SecureStore ao trocar para "system"', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('dark');
    mockUseColorScheme.mockReturnValue('light');

    const { getByTestId } = await render(
      <AppThemeProvider>
        <Text>Filho</Text>
      </AppThemeProvider>
    );

    await act(() => {
      DeviceEventEmitter.emit('onThemeChange', 'system');
    });

    expect(getByTestId('prop-themePreference').props.children).toBe('system');
    expect(getByTestId('prop-isDark').props.children).toBe('false');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('app_theme');
  });

  it('deve logar um erro no console se o SecureStore falhar na leitura (graceful fail)', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const dbError = new Error('Falha de permissão no Keychain');

    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(dbError);

    await render(
      <AppThemeProvider>
        <Text>Filho</Text>
      </AppThemeProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar tema do SecureStore:', dbError);
    });

    consoleSpy.mockRestore();
  });

  it('deve remover o listener do DeviceEventEmitter quando o componente for desmontado', async () => {
    const subscription = DeviceEventEmitter.addListener('test-theme-cleanup', () => {});
    const removeSpy = jest.spyOn(subscription, 'remove');
    jest.spyOn(DeviceEventEmitter, 'addListener').mockReturnValueOnce(subscription);

    const { unmount } = await render(
      <AppThemeProvider>
        <Text>Filho</Text>
      </AppThemeProvider>
    );

    await unmount();

    expect(removeSpy).toHaveBeenCalledTimes(1);
  });
});