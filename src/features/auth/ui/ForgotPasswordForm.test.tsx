import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ForgotPasswordForm } from './ForgotPasswordForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: { primary: '#0000FF' },
    spacing: { sm: 8, lg: 16, xl: 24 },
  }),
}));

jest.mock('@/shared/ui/globalStyles', () => ({
  useGlobalStyles: () => ({
    title: {},
    input: {},
    inputError: {},
    formErrorText: {},
    buttonPrimary: {},
    buttonText: {},
    linkText: {},
    textSecondary: { color: '#666666' }, 
  }),
}));

describe('ForgotPasswordForm', () => {
  const mockOnResetPassword = jest.fn();
  const mockOnNavigateToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o campo e os botões corretamente', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <ForgotPasswordForm
        onResetPassword={mockOnResetPassword}
        loading={false}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    expect(getByPlaceholderText('auth.emailPlaceholder')).toBeTruthy();
    expect(getByText('auth.sendLink')).toBeTruthy();
    expect(getByText('auth.backToLogin')).toBeTruthy();
  });

  it('deve disparar erro de validação do Zod se o e-mail for inválido', async () => {
    const { getByPlaceholderText, findByText } = await render(
      <ForgotPasswordForm
        onResetPassword={mockOnResetPassword}
        loading={false}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.emailPlaceholder'), 'email-invalido');
    });

    expect(await findByText('validation.emailInvalid')).toBeTruthy();
    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('deve exibir mensagem de sucesso ao resetar a senha com um e-mail válido', async () => {
    mockOnResetPassword.mockResolvedValueOnce({ error: null });

    const { getByPlaceholderText, getByText, findByText } = await render(
      <ForgotPasswordForm
        onResetPassword={mockOnResetPassword}
        loading={false}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    const submitButton = getByText('auth.sendLink');

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.emailPlaceholder'), 'brunno@teste.com');
    });

    await waitFor(() => {
      expect(submitButton.props.accessibilityState?.disabled).toBeFalsy();
    });

    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(mockOnResetPassword).toHaveBeenCalledWith('brunno@teste.com');
    expect(await findByText('auth.resetLinkSent')).toBeTruthy();
  });

  it('deve exibir mensagem de erro se a API falhar', async () => {
    mockOnResetPassword.mockResolvedValueOnce({ error: { message: 'Erro crítico na API' } });

    const { getByPlaceholderText, getByText, findByText } = await render(
      <ForgotPasswordForm
        onResetPassword={mockOnResetPassword}
        loading={false}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    const submitButton = getByText('auth.sendLink');

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.emailPlaceholder'), 'brunno@teste.com');
    });

    await waitFor(() => {
      expect(submitButton.props.accessibilityState?.disabled).toBeFalsy();
    });

    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(await findByText('errors.genericError: Erro crítico na API')).toBeTruthy();
  });

  it('deve navegar para a tela de login ao clicar em voltar', async () => {
    const { getByText } = await render(
      <ForgotPasswordForm
        onResetPassword={mockOnResetPassword}
        loading={false}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    await act(async () => {
      fireEvent.press(getByText('auth.backToLogin'));
    });

    expect(mockOnNavigateToLogin).toHaveBeenCalledTimes(1);
  });
});