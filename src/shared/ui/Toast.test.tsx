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
  const { Text } = require('react-native');
  return {
    FontAwesome: ({ name, color }: any) => (
      <Text testID="icon-mock" style={{ color }}>{name}</Text>
    )
  };
});

describe('Toast', () => {
  const mockOnHide = jest.fn();
  let springSpy: jest.SpyInstance;
  let timingSpy: jest.SpyInstance;
  let setTimeoutSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockStart = jest.fn((callback) => {
      if (callback) callback({ finished: true });
    });

    springSpy = jest.spyOn(Animated, 'spring').mockReturnValue({ start: mockStart } as any);
    timingSpy = jest.spyOn(Animated, 'timing').mockReturnValue({ start: mockStart } as any);
    
    setTimeoutSpy = jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('não deve renderizar nada se visible for false', async () => {
    const { queryByText } = await render(
      <Toast visible={false} title="T" message="M" type="success" onHide={mockOnHide} />
    );

    expect(queryByText('T')).toBeNull();
    expect(springSpy).not.toHaveBeenCalled();
  });

  it('deve renderizar título, mensagem e disparar a animação spring ao ficar visível', async () => {
    const { getByText, getByTestId } = await render(
      <Toast visible={true} title="Concluído" message="Dados salvos." type="success" onHide={mockOnHide} />
    );

    expect(getByText('Concluído')).toBeTruthy();
    expect(getByText('Dados salvos.')).toBeTruthy();

    expect(getByTestId('icon-mock').props.children).toBe('check-circle');

    expect(springSpy).toHaveBeenCalledTimes(1);
    expect(springSpy).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({ toValue: 50, bounciness: 12 })
    );
  });

  it('deve esconder automaticamente e chamar onHide após 3 segundos', async () => {
    await render(
      <Toast visible={true} title="T" message="M" type="info" onHide={mockOnHide} />
    );

    expect(springSpy).toHaveBeenCalledTimes(1);
    expect(timingSpy).not.toHaveBeenCalled();

    const timeoutCall = setTimeoutSpy.mock.calls.find(call => call[1] === 3000);
    expect(timeoutCall).toBeDefined();

    const timerCallback = timeoutCall![0];
    await act(async () => {
      timerCallback();
    });

    expect(timingSpy).toHaveBeenCalledTimes(1);
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it('deve esconder imediatamente se o usuário tocar no Toast antes dos 3 segundos', async () => {
    const { getByText } = await render(
      <Toast visible={true} title="Erro" message="Falha na rede." type="error" onHide={mockOnHide} />
    );

    expect(getByText('Erro')).toBeTruthy();
    expect(springSpy).toHaveBeenCalledTimes(1);
    
    await act(async () => {
      fireEvent.press(getByText('Erro'));
    });

    expect(timingSpy).toHaveBeenCalledTimes(1);
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it('deve aplicar as cores e ícones corretos de acordo com o tipo (error e info)', async () => {
    const { getByTestId, rerender } = await render(
      <Toast visible={true} title="E" message="M" type="error" onHide={mockOnHide} />
    );
    let icon = getByTestId('icon-mock');
    expect(icon.props.children).toBe('exclamation-circle');
    expect(icon.props.style.color).toBe('#EF4444');

    await rerender(
      <Toast visible={true} title="I" message="M" type="info" onHide={mockOnHide} />
    );
    icon = getByTestId('icon-mock');
    expect(icon.props.children).toBe('info-circle');
    expect(icon.props.style.color).toBe('#3B82F6');
  });
});