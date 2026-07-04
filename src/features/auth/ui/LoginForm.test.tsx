import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { LoginForm } from './LoginForm';

// --- MOCKS ---
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({ colors: {}, spacing: { lg: 16, xl: 24 } }),
}));

jest.mock('@/shared/ui/globalStyles', () => ({
  useGlobalStyles: () => ({ 
    title: {}, input: {}, inputError: {}, formErrorText: {}, 
    buttonPrimary: {}, buttonText: {}, linkText: {}, textSecondary: { color: '#000' } 
  }),
}));

const mockShowModal = jest.fn();
jest.mock('@/shared/providers/NotificationProvider', () => ({
  useNotification: () => ({ showModal: mockShowModal }),
}));

describe('LoginForm', () => {
  const mockOnLogin = jest.fn();
  const mockOnNavigateToSignUp = jest.fn();
  const mockOnNavigateToForgot = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar os campos e botões corretamente', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <LoginForm 
        onLogin={mockOnLogin} 
        loading={false} 
        onNavigateToSignUp={mockOnNavigateToSignUp} 
        onNavigateToForgot={mockOnNavigateToForgot} 
      />
    );

    expect(getByPlaceholderText('auth.emailPlaceholder')).toBeTruthy();
    expect(getByPlaceholderText('auth.passwordPlaceholder')).toBeTruthy();
    expect(getByText('auth.login')).toBeTruthy();
  });

  it('deve disparar erros de validação do Zod ao interagir e deixar os campos inválidos', async () => {
    const { getByPlaceholderText, findByText } = await render(
      <LoginForm 
        onLogin={mockOnLogin} 
        loading={false} 
        onNavigateToSignUp={jest.fn()} 
        onNavigateToForgot={jest.fn()} 
      />
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.emailPlaceholder'), 'formato-invalido');
    });

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.passwordPlaceholder'), ''); 
    });

    expect(await findByText('validation.emailInvalid')).toBeTruthy();
    expect(await findByText('validation.passwordRequired')).toBeTruthy();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('deve habilitar o botão e chamar onLogin quando o formulário for preenchido corretamente', async () => {
    mockOnLogin.mockResolvedValueOnce({ error: null });

    const { getByPlaceholderText, getByText } = await render(
      <LoginForm 
        onLogin={mockOnLogin} 
        loading={false} 
        onNavigateToSignUp={jest.fn()} 
        onNavigateToForgot={jest.fn()} 
      />
    );

    const submitButton = getByText('auth.login');

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.emailPlaceholder'), 'brunno@teste.com');
    });

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.passwordPlaceholder'), 'senha123');
    });

    await waitFor(() => {
      expect(submitButton.props.accessibilityState?.disabled).toBeFalsy();
    });

    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(mockOnLogin).toHaveBeenCalledWith('brunno@teste.com', 'senha123');
  });

  it('deve exibir modal de erro se a API retornar erro OFFLINE', async () => {
    mockOnLogin.mockResolvedValueOnce({ 
      error: { code: 'OFFLINE', message: 'Sem internet' } 
    });

    const { getByPlaceholderText, getByText } = await render(
      <LoginForm 
        onLogin={mockOnLogin} 
        loading={false} 
        onNavigateToSignUp={jest.fn()} 
        onNavigateToForgot={jest.fn()} 
      />
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.emailPlaceholder'), 'brunno@teste.com');
    });

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.passwordPlaceholder'), '123456');
    });

    const submitButton = getByText('auth.login');
    
    await waitFor(() => {
      expect(submitButton.props.accessibilityState?.disabled).toBeFalsy();
    });

    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(mockShowModal).toHaveBeenCalledWith('alerts.networkError', 'Sem internet', 'error');
  });

  it('deve navegar e limpar os erros ao clicar em Esqueceu a Senha', async () => {
    const { getByText } = await render(
      <LoginForm 
        onLogin={mockOnLogin} 
        loading={false} 
        onNavigateToSignUp={mockOnNavigateToSignUp} 
        onNavigateToForgot={mockOnNavigateToForgot} 
      />
    );

    await act(async () => {
      fireEvent.press(getByText('auth.forgotPasswordLink'));
    });

    expect(mockOnNavigateToForgot).toHaveBeenCalledTimes(1);
  });
});