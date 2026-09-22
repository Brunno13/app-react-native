import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth';
import LoginScreen from '@/app/(auth)/login';

type LoginFormMockProps = React.ComponentProps<(typeof import('@/features/auth'))['LoginForm']>;

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { SafeAreaView: View };
});

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/features/auth', () => {
  const { View, TouchableOpacity, Text } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    useAuth: jest.fn(),

    AuthScreenLayout: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),

    LoginForm: ({ onNavigateToSignUp, onNavigateToForgot, loading, onLogin }: LoginFormMockProps) => (
      <View testID="mock-login-form">
        <Text testID="prop-loading">{String(loading)}</Text>
        <TouchableOpacity testID="trigger-signup" onPress={onNavigateToSignUp} />
        <TouchableOpacity testID="trigger-forgot" onPress={onNavigateToForgot} />
        <TouchableOpacity
          testID="trigger-login"
          onPress={() => { void onLogin('teste@email.com', 'senha'); }}
        />
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

    await fireEvent.press(getByTestId('trigger-login'));
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('deve acionar o router.push para a tela de signup quando o form solicitar', async () => {
    const { getByTestId } = await render(<LoginScreen />);

    await fireEvent.press(getByTestId('trigger-signup'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/(auth)/signup');
  });

  it('deve acionar o router.push para a tela de forgot-password quando o form solicitar', async () => {
    const { getByTestId } = await render(<LoginScreen />);

    await fireEvent.press(getByTestId('trigger-forgot'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/(auth)/forgot-password');
  });
});