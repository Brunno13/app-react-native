import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { Toast } from './Toast';

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: {
      successLight: '#D1FAE5', success: '#10B981',
      dangerLight: '#FEE2E2', danger: '#EF4444',
      infoLight: '#DBEAFE', info: '#3B82F6',
      text: '#000000',
    },
  }),
}));

jest.mock('@/shared/ui/globalStyles', () => ({
  useGlobalStyles: () => ({
    textSecondary: {},
  }),
}));

// Mock do FontAwesome simplificado
jest.mock('@expo/vector-icons', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    FontAwesome: ({ name, color }: { name: string; color: string }) => (
      <Text testID="icon-mock" style={{ color }}>{name}</Text>
    )
  };
});

describe('Toast', () => {
  const mockOnHide = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockStart: ReturnType<typeof Animated.spring>['start'] = (callback) => {
      callback?.({ finished: true });
    };
    const mockAnimation: ReturnType<typeof Animated.spring> = {
      start: mockStart,
      stop: jest.fn(),
      reset: jest.fn(),
    };

    jest.spyOn(Animated, 'spring').mockReturnValue(mockAnimation);
    jest.spyOn(Animated, 'timing').mockReturnValue(mockAnimation);

    jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('não deve renderizar nada se visible for false', async () => {
    const { queryByText } = await render(
      <Toast visible={false} title="T" message="M" type="success" onHide={mockOnHide} />
    );

    expect(queryByText('T')).toBeNull();
    expect(jest.mocked(Animated.spring)).not.toHaveBeenCalled();
  });

  it('deve renderizar título, mensagem e disparar a animação spring ao ficar visível', async () => {
    const { getByText, getByTestId } = await render(
      <Toast visible={true} title="Concluído" message="Dados salvos." type="success" onHide={mockOnHide} />
    );

    expect(getByText('Concluído')).toBeTruthy();
    expect(getByText('Dados salvos.')).toBeTruthy();

    expect(getByTestId('icon-mock')).toHaveTextContent('check-circle');

    expect(jest.mocked(Animated.spring)).toHaveBeenCalledTimes(1);
    expect(jest.mocked(Animated.spring)).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({ toValue: 50, bounciness: 12 })
    );
  });

  it('deve esconder automaticamente e chamar onHide após 3 segundos', async () => {
    await render(
      <Toast visible={true} title="T" message="M" type="info" onHide={mockOnHide} />
    );

    expect(jest.mocked(Animated.spring)).toHaveBeenCalledTimes(1);
    expect(jest.mocked(Animated.timing)).not.toHaveBeenCalled();

    const timeoutCall = jest.mocked(global.setTimeout).mock.calls.find((call) => call[1] === 3000);
    expect(timeoutCall).toBeDefined();

    if (!timeoutCall) {
      throw new Error('Timer de 3000ms nao encontrado');
    }

    const timerCallback = timeoutCall[0];

    if (typeof timerCallback !== 'function') {
      throw new Error('Callback do timer nao e uma funcao');
    }

    await act(() => {
      timerCallback();
    });

    expect(jest.mocked(Animated.timing)).toHaveBeenCalledTimes(1);
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it('deve esconder imediatamente se o usuário tocar no Toast antes dos 3 segundos', async () => {
    const { getByText } = await render(
      <Toast visible={true} title="Erro" message="Falha na rede." type="error" onHide={mockOnHide} />
    );

    expect(getByText('Erro')).toBeTruthy();
    expect(jest.mocked(Animated.spring)).toHaveBeenCalledTimes(1);

    await fireEvent.press(getByText('Erro'));

    expect(jest.mocked(Animated.timing)).toHaveBeenCalledTimes(1);
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it('deve aplicar as cores e ícones corretos de acordo com o tipo (error e info)', async () => {
    const { getByTestId, rerender } = await render(
      <Toast visible={true} title="E" message="M" type="error" onHide={mockOnHide} />
    );
    const errorIcon = getByTestId('icon-mock');
    expect(errorIcon).toHaveTextContent('exclamation-circle');
    expect(errorIcon).toHaveStyle({ color: '#EF4444' });

    await rerender(
      <Toast visible={true} title="I" message="M" type="info" onHide={mockOnHide} />
    );
    const infoIcon = getByTestId('icon-mock');
    expect(infoIcon).toHaveTextContent('info-circle');
    expect(infoIcon).toHaveStyle({ color: '#3B82F6' });
  });
});