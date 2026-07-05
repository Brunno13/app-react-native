import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useGlobalAuth } from '@/features/auth';
import { useNotification } from '@/shared/providers/NotificationProvider';

import HomeRoute from '@/app/(main)/(tabs)/home';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFF',
      text: '#000',
      surface: '#FFF',
      border: '#EEE',
      success: '#10B981',
      info: '#3B82F6',
      dangerDark: '#8B0000',
    },
  }),
}));

jest.mock('@/features/auth', () => ({
  useGlobalAuth: jest.fn(),
}));

jest.mock('@/shared/providers/NotificationProvider', () => ({
  useNotification: jest.fn(),
}));

describe('HomeRoute (Camada App)', () => {
  const mockShowToast = jest.fn();
  const mockShowModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useNotification as jest.Mock).mockReturnValue({
      showToast: mockShowToast,
      showModal: mockShowModal,
    });
  });

  it('deve renderizar a mensagem de boas-vindas com o nome do usuário', async () => {
    (useGlobalAuth as jest.Mock).mockReturnValue({
      session: { user: { name: 'Brunno' } },
    });

    const { getByText } = await render(<HomeRoute />);
    expect(getByText('home.welcome, Brunno!')).toBeTruthy();
  });

  it('deve renderizar a mensagem padrão se o usuário não tiver nome', async () => {
    (useGlobalAuth as jest.Mock).mockReturnValue({
      session: { user: { name: '' } },
    });

    const { getByText } = await render(<HomeRoute />);
    expect(getByText('home.welcome, home.defaultUser!')).toBeTruthy();
  });

  it('deve disparar o showToast com sucesso ao clicar no botão de Testar Toast', async () => {
    (useGlobalAuth as jest.Mock).mockReturnValue({ session: null });
    const { getByText } = await render(<HomeRoute />);

    fireEvent.press(getByText('home.testToast'));

    expect(mockShowToast).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith('home.toastTitle', 'home.toastMessage', 'success');
  });

  it('deve disparar o showModal de informação ao clicar no botão de Testar Modal', async () => {
    (useGlobalAuth as jest.Mock).mockReturnValue({ session: null });
    const { getByText } = await render(<HomeRoute />);

    fireEvent.press(getByText('home.testModal'));

    expect(mockShowModal).toHaveBeenCalledTimes(1);
    expect(mockShowModal).toHaveBeenCalledWith('home.modalTitle', 'home.modalMessage', 'info');
  });

  it('deve renderizar o botão de Simular Crash na tela corretamente', async () => {
    (useGlobalAuth as jest.Mock).mockReturnValue({ session: null });
    
    const { getByText } = await render(<HomeRoute />);
    const crashButton = getByText('home.simulateCrash');
    
    expect(crashButton).toBeTruthy();
  });
});