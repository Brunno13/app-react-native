import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth';
import ForgotPasswordRoute from '@/app/(auth)/forgot-password';

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, style }: any) => <View style={style}>{children}</View>,
  };
});

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/features/auth', () => {
  const { View, TouchableOpacity, Text } = require('react-native');
  
  return {
    useAuth: jest.fn(),
    
    ForgotPasswordForm: ({ onResetPassword, onNavigateToLogin, loading }: any) => (
      <View testID="mock-forgot-form">
        <Text testID="prop-loading">{String(loading)}</Text>
        
        <TouchableOpacity 
          testID="trigger-reset" 
          onPress={() => onResetPassword('teste@email.com')} 
        />
        
        <TouchableOpacity 
          testID="trigger-back" 
          onPress={onNavigateToLogin} 
        />
      </View>
    ),
  };
});

describe('ForgotPasswordRoute (Camada App)', () => {
  const mockBack = jest.fn();
  const mockForgetPassword = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
    
    (useAuth as jest.Mock).mockReturnValue({
      forgetPassword: mockForgetPassword,
      loading: false,
    });
  });

  it('deve injetar o estado de loading do useAuth diretamente no ForgotPasswordForm', async () => {
    (useAuth as jest.Mock).mockReturnValue({ forgetPassword: mockForgetPassword, loading: true });

    const { getByTestId } = await render(<ForgotPasswordRoute />);
    
    expect(getByTestId('prop-loading').props.children).toBe('true');
  });

  it('deve acionar o router.back() quando o formulário solicitar a navegação para o login', async () => {
    const { getByTestId } = await render(<ForgotPasswordRoute />);
    
    await act(async () => {
      fireEvent.press(getByTestId('trigger-back'));
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('deve acionar a função forgetPassword repassando o email recebido do formulário', async () => {
    mockForgetPassword.mockResolvedValueOnce(true);

    const { getByTestId } = await render(<ForgotPasswordRoute />);
    
    await act(async () => {
      fireEvent.press(getByTestId('trigger-reset'));
    });

    expect(mockForgetPassword).toHaveBeenCalledTimes(1);
    expect(mockForgetPassword).toHaveBeenCalledWith('teste@email.com');
  });
});