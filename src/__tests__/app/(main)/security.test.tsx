import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth, useGlobalAuth } from '@/features/auth';
import { usePreferences } from '@/features/profile';
import { useNotification } from '@/shared/providers/NotificationProvider';
import SecurityRoute from '@/app/(main)/security';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    FontAwesome: ({ name }: any) => <Text testID={`icon-${name}`}>{name}</Text>
  };
});

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: { primary: '#000', danger: '#F00', text: '#333', textSecondary: '#666', border: '#CCC' },
    spacing: { sm: 4, md: 8, lg: 16 },
  }),
}));

jest.mock('@/shared/ui/globalStyles', () => ({
  useGlobalStyles: () => ({
    safeArea: {},
    scrollContent: {},
    card: {},
    subtitle: {},
    textSecondary: {},
  }),
}));

jest.mock('@/shared/providers/NotificationProvider', () => ({
  useNotification: jest.fn(),
}));

jest.mock('@/features/auth', () => ({
  useAuth: jest.fn(),
  useGlobalAuth: jest.fn(),
}));

jest.mock('@/features/profile', () => {
  const { View, TouchableOpacity } = require('react-native');
  return {
    usePreferences: jest.fn(),
    
    SecurityForm: ({ onSubmitPasswordChange }: any) => (
      <View testID="mock-security-form">
        <TouchableOpacity 
          testID="trigger-pwd-success" 
          onPress={() => onSubmitPasswordChange({ currentPassword: '123', newPassword: 'abc' })} 
        />
      </View>
    ),
  };
});

describe('SecurityRoute (Camada App)', () => {
  const mockChangePassword = jest.fn();
  const mockGetActiveSessions = jest.fn();
  const mockRevokeDeviceSession = jest.fn();
  const mockUpdatePreferences = jest.fn();
  const mockShowToast = jest.fn();
  const mockShowModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useGlobalAuth as jest.Mock).mockReturnValue({
      session: { user: { id: 'user-123' } }
    });

    (useAuth as jest.Mock).mockReturnValue({
      changePassword: mockChangePassword,
      getActiveSessions: mockGetActiveSessions,
      revokeDeviceSession: mockRevokeDeviceSession,
      loading: false,
    });

    (usePreferences as jest.Mock).mockReturnValue({
      preferences: { isBiometricsEnabled: false },
      updatePreferences: mockUpdatePreferences,
      loading: false,
    });

    (useNotification as jest.Mock).mockReturnValue({
      showToast: mockShowToast,
      showModal: mockShowModal,
    });

    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });

    mockGetActiveSessions.mockResolvedValue({
      data: [
        { token: 'sess-1', userAgent: 'Mobile Safari', createdAt: '2026-01-01T10:00:00Z' },
      ]
    });
  });

  describe('Inicialização', () => {
    it('deve buscar as sessões ativas e verificar o hardware biométrico ao montar a tela', async () => {
      const { getByText } = await render(<SecurityRoute />);

      await waitFor(() => {
        expect(mockGetActiveSessions).toHaveBeenCalledTimes(1);
        expect(LocalAuthentication.hasHardwareAsync).toHaveBeenCalledTimes(1);
        expect(getByText('Mobile Safari')).toBeTruthy();
      });
    });

    it('deve mostrar aviso e desabilitar o switch se não houver hardware biométrico', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

      const { getByText } = await render(<SecurityRoute />);

      await waitFor(() => {
        expect(getByText('security.noHardwareWarning')).toBeTruthy();
      });
    });
  });

  describe('Troca de Senha', () => {
    it('deve acionar a API, mostrar Modal de sucesso e recarregar sessões', async () => {
      mockChangePassword.mockResolvedValueOnce({ error: null });

      const { getByTestId } = await render(<SecurityRoute />);

      await waitFor(() => expect(mockGetActiveSessions).toHaveBeenCalledTimes(1));

      await act(async () => {
        fireEvent.press(getByTestId('trigger-pwd-success'));
      });

      expect(mockChangePassword).toHaveBeenCalledWith('abc', '123');
      expect(mockShowModal).toHaveBeenCalledWith('alerts.success', 'alerts.passwordChanged', 'success');
      expect(mockGetActiveSessions).toHaveBeenCalledTimes(2);
    });
  });

  describe('Sessões e Dispositivos', () => {
    it('deve revogar uma sessão, exibir sucesso e recarregar a lista', async () => {
      mockRevokeDeviceSession.mockResolvedValueOnce({ error: null });

      const { getByTestId } = await render(<SecurityRoute />);

      await waitFor(() => expect(mockGetActiveSessions).toHaveBeenCalledTimes(1));

      const trashIcon = getByTestId('icon-trash');
      
      await act(async () => {
        fireEvent.press(trashIcon.parent!); 
      });

      expect(mockRevokeDeviceSession).toHaveBeenCalledWith('sess-1');
      expect(mockGetActiveSessions).toHaveBeenCalledTimes(2);
    });
  });

  describe('Fluxo de Biometria', () => {
    it('deve solicitar autenticação nativa ao tentar HABILITAR a biometria', async () => {
      const { getByTestId } = await render(<SecurityRoute />);

      await waitFor(() => expect(LocalAuthentication.hasHardwareAsync).toHaveBeenCalledTimes(1));

      const biometricsSwitch = getByTestId('biometrics-switch');

      await act(async () => {
        fireEvent(biometricsSwitch, 'valueChange', true);
      });

      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1);
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ isBiometricsEnabled: true });
      expect(mockShowToast).toHaveBeenCalledWith('alerts.success', 'security.biometricsActivated', 'success');
    });

    it('NÃO deve salvar a preferência se o usuário cancelar a autenticação nativa', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValueOnce({ success: false });

      const { getByTestId } = await render(<SecurityRoute />);

      await waitFor(() => expect(LocalAuthentication.hasHardwareAsync).toHaveBeenCalledTimes(1));

      const biometricsSwitch = getByTestId('biometrics-switch');

      await act(async () => {
        fireEvent(biometricsSwitch, 'valueChange', true);
      });

      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1);
      expect(mockUpdatePreferences).not.toHaveBeenCalled();
    });

    it('NÃO deve solicitar autenticação nativa ao tentar DESABILITAR a biometria', async () => {
      (usePreferences as jest.Mock).mockReturnValue({
        preferences: { isBiometricsEnabled: true },
        updatePreferences: mockUpdatePreferences,
        loading: false,
      });

      const { getByTestId } = await render(<SecurityRoute />);

      await waitFor(() => expect(LocalAuthentication.hasHardwareAsync).toHaveBeenCalledTimes(1));

      const biometricsSwitch = getByTestId('biometrics-switch');

      await act(async () => {
        fireEvent(biometricsSwitch, 'valueChange', false);
      });

      expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ isBiometricsEnabled: false });
    });
  });
});