import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useAuth, useGlobalAuth } from '@/features/auth';
import { usePreferences } from '@/features/profile';
import ProfileRoute from '@/app/(main)/(tabs)/profile';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    FontAwesome: ({ name }: any) => <Text testID={`icon-${name}`}>{name}</Text>
  };
});

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: { primary: '#00F', background: '#FFF', text: '#000', textSecondary: '#666', border: '#CCC', success: '#0F0' },
    spacing: { sm: 4, md: 8, lg: 16, xl: 24 },
    themePreference: 'system',
  }),
}));

jest.mock('@/shared/ui/globalStyles', () => ({
  useGlobalStyles: () => ({
    safeArea: {},
    scrollContent: {},
    container: {},
    avatarLarge: {},
    avatarLargeText: {},
    menuItem: {},
    menuItemText: {},
    buttonDanger: {},
    buttonText: {},
  }),
}));

jest.mock('@/features/auth', () => ({
  useAuth: jest.fn(),
  useGlobalAuth: jest.fn(),
}));

jest.mock('@/features/profile', () => ({
  usePreferences: jest.fn(),
}));

describe('ProfileRoute (Camada App - Painel de Configurações)', () => {
  const mockPush = jest.fn();
  const mockSignOut = jest.fn();
  const mockToggleOfflineMode = jest.fn();
  const mockUpdatePreferences = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({ signOut: mockSignOut });
    (usePreferences as jest.Mock).mockReturnValue({
      preferences: { isOfflineModeEnabled: false },
      toggleOfflineMode: mockToggleOfflineMode,
      updatePreferences: mockUpdatePreferences,
      loading: false,
    });

    (useGlobalAuth as jest.Mock).mockReturnValue({
      session: {
        user: {
          id: 'user-789',
          name: 'Brunno',
          email: 'brunno@dev.com',
          image: 'https://servidor.com/foto.jpg',
          updatedAt: '2026-02-02T12:00:00.000Z'
        }
      }
    });
  });

  describe('Renderização de Dados e Imagens', () => {
    it('deve carregar os textos de perfil do usuário logado e processar a URL da foto com cache breaker', async () => {
      const { getByText, getByTestId } = await render(<ProfileRoute />);

      expect(getByText('Brunno')).toBeTruthy();
      expect(getByText('brunno@dev.com')).toBeTruthy();

      const imageComponent = getByTestId('profile-avatar');
      const expectedTimestamp = new Date('2026-02-02T12:00:00.000Z').getTime();
      expect(imageComponent.props.source.uri).toBe(`https://servidor.com/foto.jpg?t=${expectedTimestamp}`);
    });

    it('deve exibir a letra inicial do nome como fallback visual quando o usuário não possuir foto de avatar', async () => {
      (useGlobalAuth as jest.Mock).mockReturnValue({
        session: { user: { id: 'user-789', name: 'Brunno', email: 'brunno@dev.com', image: null } }
      });

      const { getByText, queryByTestId } = await render(<ProfileRoute />);

      expect(queryByTestId('profile-avatar')).toBeNull();
      expect(getByText('B')).toBeTruthy();
    });
  });

  describe('Navegação do Menu', () => {
    it('deve encaminhar o usuário para a rota correta ao clicar em Editar Perfil', async () => {
      const { getByText } = await render(<ProfileRoute />);

      fireEvent.press(getByText('profileScreen.editProfile'));

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/(main)/edit-profile');
    });

    it('deve encaminhar o usuário para a rota correta ao clicar em Segurança e Sessões', async () => {
      const { getByText } = await render(<ProfileRoute />);

      fireEvent.press(getByText('profileScreen.securityAndSessions'));

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/(main)/security');
    });
  });

  describe('Ações de Configuração (Tema e Modo Offline)', () => {
    it('deve disparar updatePreferences ao pressionar uma opção de alteração de tema', async () => {
      const { getByText } = await render(<ProfileRoute />);

      fireEvent.press(getByText('darkMode.darkModeDark'));

      expect(mockUpdatePreferences).toHaveBeenCalledTimes(1);
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ theme: 'dark' });
    });

    it('deve invocar o toggleOfflineMode ao acionar o Switch de controle de rede local', async () => {
      const { getByTestId } = await render(<ProfileRoute />);

      const offlineSwitch = getByTestId('offline-switch');

      await act(async () => {
        fireEvent(offlineSwitch, 'valueChange', true);
      });

      expect(mockToggleOfflineMode).toHaveBeenCalledTimes(1);
    });
  });

  describe('Fluxo de Encerramento', () => {
    it('deve disparar a rotina de desautenticação global ao clicar no botão de Sair', async () => {
      const { getByText } = await render(<ProfileRoute />);

      fireEvent.press(getByText('profileScreen.logout'));

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
});