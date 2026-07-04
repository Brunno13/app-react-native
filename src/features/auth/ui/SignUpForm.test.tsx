import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { SignUpForm } from './SignUpForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    spacing: { sm: 8, xl: 24 },
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

describe('SignUpForm', () => {
  const mockOnSignUp = jest.fn();
  const mockOnNavigateToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar os campos corretamente', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <SignUpForm
        onSignUp={mockOnSignUp}
        loading={false}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    expect(getByPlaceholderText('auth.namePlaceholder')).toBeTruthy();
    expect(getByPlaceholderText('auth.emailPlaceholder')).toBeTruthy();
    expect(getByPlaceholderText('auth.passwordPlaceholder')).toBeTruthy();
    expect(getByPlaceholderText('auth.confirmPasswordPlaceholder')).toBeTruthy();
    expect(getByText('auth.createAccountButton')).toBeTruthy();
  });

  it('deve disparar erro de validação do Zod se as senhas não coincidirem', async () => {
    const { getByPlaceholderText, findByText } = await render(
      <SignUpForm
        onSignUp={mockOnSignUp}
        loading={false}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.passwordPlaceholder'), 'SenhaForte123');
    });

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.confirmPasswordPlaceholder'), 'SenhaDiferente');
    });

    expect(await findByText('validation.passwordsDontMatch')).toBeTruthy();
    expect(mockOnSignUp).not.toHaveBeenCalled();
  });

  it('deve habilitar o botão e chamar onSignUp com o payload correto se os dados forem válidos', async () => {
    mockOnSignUp.mockResolvedValueOnce({ error: null });

    const { getByPlaceholderText, getByText } = await render(
      <SignUpForm
        onSignUp={mockOnSignUp}
        loading={false}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.namePlaceholder'), 'Brunno');
    });

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.emailPlaceholder'), 'brunno@teste.com');
    });

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.passwordPlaceholder'), 'SenhaForte123');
    });

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('auth.confirmPasswordPlaceholder'), 'SenhaForte123');
    });

    const submitButton = getByText('auth.createAccountButton');

    await waitFor(() => {
      expect(submitButton.props.accessibilityState?.disabled).toBeFalsy();
    });

    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(mockOnSignUp).toHaveBeenCalledWith({
      name: 'Brunno',
      email: 'brunno@teste.com',
      password: 'SenhaForte123',
      confirmPassword: 'SenhaForte123',
    });
  });

  it('deve navegar para a tela de login ao clicar no link inferior', async () => {
    const { getByText } = await render(
      <SignUpForm
        onSignUp={mockOnSignUp}
        loading={false}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    await act(async () => {
      fireEvent.press(getByText('auth.login'));
    });

    expect(mockOnNavigateToLogin).toHaveBeenCalledTimes(1);
  });
});