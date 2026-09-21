import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { NetworkBanner } from './NetworkBanner';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: {
      dangerDark: '#8B0000',
      surface: '#FFFFFF',
    },
  }),
}));

describe('NetworkBanner', () => {
  let springSpy: jest.SpyInstance;
  let timingSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    const springAnimation: ReturnType<typeof Animated.spring> = {
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    };
    springSpy = jest.spyOn(Animated, 'spring').mockReturnValue(springAnimation);
    const timingAnimation: ReturnType<typeof Animated.timing> = {
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    };
    timingSpy = jest.spyOn(Animated, 'timing').mockReturnValue(timingAnimation);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve renderizar o texto de alerta de rede corretamente', async () => {
    const { getByText } = await render(<NetworkBanner isOffline={true} />);

    expect(getByText('alerts.networkError')).toBeTruthy();
  });

  it('deve disparar Animated.spring para exibir o banner com efeito de "pulo" quando isOffline for true', async () => {
    await render(<NetworkBanner isOffline={true} />);

    expect(springSpy).toHaveBeenCalledTimes(1);
    expect(springSpy).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: 0,
        bounciness: 12,
        useNativeDriver: true,
      })
    );

    expect(timingSpy).not.toHaveBeenCalled();
  });

  it('deve disparar Animated.timing para esconder o banner suavemente quando isOffline for false', async () => {
    await render(<NetworkBanner isOffline={false} />);

    expect(timingSpy).toHaveBeenCalledTimes(1);
    expect(timingSpy).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      })
    );

    expect(springSpy).not.toHaveBeenCalled();
  });

  it('deve alternar as animações perfeitamente quando a conexão cair e voltar', async () => {
    const { rerender } = await render(<NetworkBanner isOffline={true} />);
    expect(springSpy).toHaveBeenCalledTimes(1);

    await rerender(<NetworkBanner isOffline={false} />);

    expect(timingSpy).toHaveBeenCalledTimes(1);
    expect(timingSpy).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: -150,
      })
    );
  });
});