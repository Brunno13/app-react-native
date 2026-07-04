import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ErrorFallback } from './ErrorFallback';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn().mockReturnValue('light'),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, style }: any) => <View style={style}>{children}</View>,
  };
});

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    FontAwesome: ({ name, color }: any) => (
      <Text testID="icon-mock" style={{ color }}>{name}</Text>
    )
  };
});

jest.mock('@/shared/ui/theme', () => ({
  lightColors: { background: '#FFFFFF', danger: '#FF0000', primary: '#0000FF', text: '#000', textSecondary: '#666' },
  darkColors: { background: '#000000', danger: '#FF4444', primary: '#4444FF', text: '#FFF', textSecondary: '#999' },
  spacing: { xl: 24, lg: 16, md: 8 },
  borderRadius: { md: 8 },
}));

describe('ErrorFallback', () => {
  const mockResetErrorBoundary = jest.fn();
  const mockError = new Error('Falha de renderização simulada');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a interface de erro catastrofico com título, subtítulo e ícone', async () => {
    const { getByText, getByTestId } = await render(
      <ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />
    );

    expect(getByText('errors.catastrophicTitle')).toBeTruthy();
    expect(getByText('errors.catastrophicSubtitle')).toBeTruthy();
    expect(getByText('errors.buttonTryAgain')).toBeTruthy();
    const icon = getByTestId('icon-mock');
    expect(icon.props.children).toBe('exclamation-triangle');
  });

  it('deve chamar a função resetErrorBoundary ao clicar no botão de tentar novamente', async () => {
    const { getByText } = await render(
      <ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />
    );

    const tryAgainBtn = getByText('errors.buttonTryAgain');

    await act(async () => {
      fireEvent.press(tryAgainBtn);
    });

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1);
  });

  it('deve registrar o erro no console se __DEV__ for true', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await render(
      <ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />
    );

    expect(consoleSpy).toHaveBeenCalledWith('🚨 [Catastrophic Error Captured]:', mockError);

    consoleSpy.mockRestore();
  });
});