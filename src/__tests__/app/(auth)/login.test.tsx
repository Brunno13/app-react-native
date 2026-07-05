import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth';
import LoginScreen from '@/app/(auth)/login';

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
    
    LoginForm: ({ onNavigateToSignUp, onNavigateToForgot, loading, onLogin }: any) => (
      <View testID="mock-login-form">
        <Text testID="prop-loading">{String(loading)}</Text>
        <TouchableOpacity testID="trigger-signup" onPress={onNavigateToSignUp} />
        <TouchableOpacity testID="trigger-forgot" onPress={onNavigateToForgot} />
        <TouchableOpacity testID="trigger-login" onPress={onLogin} />
      </View>
    ),
  };
});

describe('LoginScreen (Camada App)', () => {
  const mockPush = jest.fn();
  const mockSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      loading: false,
    });
  });

  it('deve injetar o loading e a função signIn do useAuth diretamente no LoginForm', async () => {
    (useAuth as jest.Mock).mockReturnValue({ signIn: mockSignIn, loading: true });

    const { getByTestId } = await render(<LoginScreen />);
    
    expect(getByTestId('prop-loading').props.children).toBe('true');

    fireEvent.press(getByTestId('trigger-login'));
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('deve acionar o router.push para a tela de signup quando o form solicitar', async () => {
    const { getByTestId } = await render(<LoginScreen />);
    
    fireEvent.press(getByTestId('trigger-signup'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/(auth)/signup');
  });

  it('deve acionar o router.push para a tela de forgot-password quando o form solicitar', async () => {
    const { getByTestId } = await render(<LoginScreen />);
    
    fireEvent.press(getByTestId('trigger-forgot'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/(auth)/forgot-password');
  });
});