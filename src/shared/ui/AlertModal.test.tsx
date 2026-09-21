import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AlertModal } from './AlertModal';

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      success: '#10B981',
      danger: '#EF4444',
      info: '#3B82F6',
    },
  }),
}));

jest.mock('@/shared/ui/globalStyles', () => ({
  useGlobalStyles: () => ({
    title: {},
    textSecondary: {},
    buttonPrimary: {},
    buttonText: {},
  }),
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    FontAwesome: ({ name, color }: { name: string; color?: string }) => (
      <Text testID="icon-mock" style={{ color }}>{name}</Text>
    )
  };
});

describe('AlertModal', () => {
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o modal com título, mensagem e botão padrão (OK)', async () => {
    const { getByText } = await render(
      <AlertModal
        visible={true}
        title="Atenção"
        message="Esta é uma mensagem de teste."
        type="info"
        onConfirm={mockOnConfirm}
      />
    );

    expect(getByText('Atenção')).toBeTruthy();
    expect(getByText('Esta é uma mensagem de teste.')).toBeTruthy();
    expect(getByText('OK')).toBeTruthy();
  });

  it('deve renderizar texto customizado no botão se confirmText for passado', async () => {
    const { getByText } = await render(
      <AlertModal
        visible={true}
        title="Erro Crítico"
        message="Deseja forçar a operação?"
        type="error"
        onConfirm={mockOnConfirm}
        confirmText="Forçar Fechamento"
      />
    );

    expect(getByText('Forçar Fechamento')).toBeTruthy();
  });

  it('deve disparar a função onConfirm ao clicar no botão', async () => {
    const { getByText } = await render(
      <AlertModal
        visible={true}
        title="Sucesso"
        message="Operação concluída."
        type="success"
        onConfirm={mockOnConfirm}
      />
    );

    const btn = getByText('OK');

    await fireEvent.press(btn);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  describe('Mapeamento de Ícones e Cores', () => {
    it('deve renderizar ícone e cor corretos para o tipo SUCCESS', async () => {
      const { getByTestId } = await render(
        <AlertModal visible={true} title="S" message="M" type="success" onConfirm={mockOnConfirm} />
      );

      const icon = getByTestId('icon-mock');
      expect(icon).toHaveTextContent('check-circle');
      expect(icon).toHaveStyle({ color: '#10B981' });
    });

    it('deve renderizar ícone e cor corretos para o tipo ERROR', async () => {
      const { getByTestId } = await render(
        <AlertModal visible={true} title="E" message="M" type="error" onConfirm={mockOnConfirm} />
      );

      const icon = getByTestId('icon-mock');
      expect(icon).toHaveTextContent('times-circle');
      expect(icon).toHaveStyle({ color: '#EF4444' });
    });

    it('deve renderizar ícone e cor corretos para o tipo INFO', async () => {
      const { getByTestId } = await render(
        <AlertModal visible={true} title="I" message="M" type="info" onConfirm={mockOnConfirm} />
      );

      const icon = getByTestId('icon-mock');
      expect(icon).toHaveTextContent('info-circle');
      expect(icon).toHaveStyle({ color: '#3B82F6' });
    });
  });
});