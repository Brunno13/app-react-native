import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth';
import { useNotification } from '@/shared/providers/NotificationProvider';
import SignUpScreen from '@/app/(auth)/signup';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, style }: any) => <View style={style}>{children}</View>,
  };
});

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/shared/providers/NotificationProvider', () => ({
  useNotification: jest.fn(),
}));

jest.mock('@/features/auth', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');
  
  return {
    useAuth: jest.fn(),
    
    SignUpForm: ({ onSignUp, onNavigateToLogin, loading }: any) => {
      const [lastError, setLastError] = React.useState('');

      return (
        <View testID="mock-signup-form">
          <Text testID="prop-loading">{String(loading)}</Text>
          <Text testID="prop-error">{lastError}</Text>
          
          <TouchableOpacity 
            testID="trigger-signup" 
            onPress={async () => {
              const result = await onSignUp({ email: 'novo@email.com', password: 'senha', name: 'Usuario Teste' });
              if (result?.error) {
                setLastError(result.error.message);
              }
            }} 
          />
          
          <TouchableOpacity 
            testID="trigger-login" 
            onPress={onNavigateToLogin} 
          />
        </View>
      );
    },
  };
});

describe('SignUpScreen (Camada App)', () => {
  const mockBack = jest.fn();
  const mockSignUp = jest.fn();
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
    (useNotification as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    (useAuth as jest.Mock).mockReturnValue({ signUp: mockSignUp });
  });

  it('deve inicializar com loading falso', async () => {
    const { getByTestId } = await render(<SignUpScreen />);
    
    expect(getByTestId('prop-loading').props.children).toBe('false');
  });

  it('deve acionar o router.back() quando solicitar voltar para o login', async () => {
    const { getByTestId } = await render(<SignUpScreen />);
    
    await act(async () => {
      fireEvent.press(getByTestId('trigger-login'));
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('Fluxo de Sucesso: deve cadastrar, exibir Toast e voltar para a tela anterior', async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });

    const { getByTestId } = await render(<SignUpScreen />);
    
    await act(async () => {
      fireEvent.press(getByTestId('trigger-signup'));
    });

    expect(mockSignUp).toHaveBeenCalledWith('novo@email.com', 'senha', 'Usuario Teste');
    expect(mockShowToast).toHaveBeenCalledWith('alerts.success', 'alerts.accountCreated', 'success');
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('Fluxo de Erro: deve barrar a navegação e retornar o erro se o cadastro falhar', async () => {
    const mockError = new Error('E-mail já em uso');
    mockSignUp.mockResolvedValueOnce({ error: mockError });

    const { getByTestId } = await render(<SignUpScreen />);
    
    await act(async () => {
      fireEvent.press(getByTestId('trigger-signup'));
    });

    expect(mockShowToast).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
    expect(getByTestId('prop-error').props.children).toBe('E-mail já em uso');
  });
});