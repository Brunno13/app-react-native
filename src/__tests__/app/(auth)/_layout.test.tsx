import React from 'react';
import { render } from '@testing-library/react-native';
import AuthLayout from '@/app/(auth)/_layout';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  
  const MockStack = ({ children, screenOptions }: any) => (
    <View testID="mock-stack" screenOptions={screenOptions}>
      {children}
    </View>
  );
  
  MockStack.Screen = ({ name, options }: any) => (
    <View testID={`mock-screen-${name}`} options={options} />
  );
  
  return { Stack: MockStack };
});

describe('AuthLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o Stack contêiner com a animação correta', async () => {
    const { getByTestId } = await render(<AuthLayout />);
    
    const stack = getByTestId('mock-stack');
    expect(stack.props.screenOptions).toEqual({ animation: 'slide_from_right' });
  });

  it('deve configurar a tela de login sem cabeçalho (headerShown: false)', async () => {
    const { getByTestId } = await render(<AuthLayout />);
    
    const loginScreen = getByTestId('mock-screen-login');
    expect(loginScreen.props.options).toEqual({ 
      headerShown: false 
    });
  });

  it('deve configurar a tela de signup com o título traduzido e sem cabeçalho', async () => {
    const { getByTestId } = await render(<AuthLayout />);
    
    const signupScreen = getByTestId('mock-screen-signup');
    expect(signupScreen.props.options).toEqual({ 
      title: 'navigation.signUp', 
      headerShown: false 
    });
  });

  it('deve configurar a tela de forgot-password com o título traduzido e sem cabeçalho', async () => {
    const { getByTestId } = await render(<AuthLayout />);
    
    const forgotPwdScreen = getByTestId('mock-screen-forgot-password');
    expect(forgotPwdScreen.props.options).toEqual({ 
      title: 'navigation.forgotPassword', 
      headerShown: false 
    });
  });
});