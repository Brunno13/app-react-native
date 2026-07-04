import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { SecurityForm } from './SecurityForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    spacing: { sm: 8 },
  }),
}));

jest.mock('@/shared/ui/globalStyles', () => ({
  useGlobalStyles: () => ({
    input: {},
    inputError: {},
    formErrorText: {},
    buttonPrimary: {},
    buttonText: {},
    textSecondary: { color: '#666666' },
  }),
}));

describe('SecurityForm - Teste Comportamental', () => {
  const mockOnSubmitPasswordChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar os inputs e impedir o envio inicial (botão desabilitado)', async () => {
    const { getByText } = await render(
      <SecurityForm onSubmitPasswordChange={mockOnSubmitPasswordChange} loading={false} />
    );

    const submitBtn = getByText('profile.updatePassword');
    
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    expect(mockOnSubmitPasswordChange).not.toHaveBeenCalled();
  });

  it('deve disparar erro de validação (Zod) para senhas fracas', async () => {
    const { getByPlaceholderText, findByText, getByText } = await render(
      <SecurityForm onSubmitPasswordChange={mockOnSubmitPasswordChange} loading={false} />
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('profile.currentPasswordPlaceholder'), 'senha123');
    });

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('profile.newPasswordPlaceholder'), '123');
    });

    expect(await findByText('validation.passwordMin')).toBeTruthy();
    
    await act(async () => {
      fireEvent.press(getByText('profile.updatePassword'));
    });

    expect(mockOnSubmitPasswordChange).not.toHaveBeenCalled();
  });

  it('deve chamar onSubmitPasswordChange com sucesso e limpar o formulário ao final', async () => {
    mockOnSubmitPasswordChange.mockResolvedValueOnce(true);

    const { getByPlaceholderText, getByText } = await render(
      <SecurityForm onSubmitPasswordChange={mockOnSubmitPasswordChange} loading={false} />
    );

    const currentInput = getByPlaceholderText('profile.currentPasswordPlaceholder');
    const newInput = getByPlaceholderText('profile.newPasswordPlaceholder');

    await act(async () => {
      fireEvent.changeText(currentInput, 'senhaAtualSegura');
    });

    await act(async () => {
      fireEvent.changeText(newInput, 'novaSenhaSegura123');
    });

    await waitFor(() => {
      expect(newInput.props.value).toBe('novaSenhaSegura123');
    });

    await act(async () => {
      fireEvent.press(getByText('profile.updatePassword'));
    });

    expect(mockOnSubmitPasswordChange).toHaveBeenCalledWith({
      currentPassword: 'senhaAtualSegura',
      newPassword: 'novaSenhaSegura123',
    });

    expect(currentInput.props.value).toBe('');
    expect(newInput.props.value).toBe('');
  });

  it('deve manter os dados nos inputs se a API de troca de senha retornar erro', async () => {
    mockOnSubmitPasswordChange.mockResolvedValueOnce(false);

    const { getByPlaceholderText, getByText } = await render(
      <SecurityForm onSubmitPasswordChange={mockOnSubmitPasswordChange} loading={false} />
    );

    const currentInput = getByPlaceholderText('profile.currentPasswordPlaceholder');
    const newInput = getByPlaceholderText('profile.newPasswordPlaceholder');

    await act(async () => {
      fireEvent.changeText(currentInput, 'senhaAtual');
    });

    await act(async () => {
      fireEvent.changeText(newInput, 'novaSenha123');
    });

    await waitFor(() => {
      expect(newInput.props.value).toBe('novaSenha123');
    });

    await act(async () => {
      fireEvent.press(getByText('profile.updatePassword'));
    });

    expect(currentInput.props.value).toBe('senhaAtual');
  });
});