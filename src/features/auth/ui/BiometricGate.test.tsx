import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text, AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { BiometricGate } from './BiometricGate';

// --- MOCKS ---
jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({ colors: { background: '#000', text: '#fff' } }),
}));

jest.mock('@/shared/ui/globalStyles', () => ({
  useGlobalStyles: () => ({ title: {}, buttonPrimary: {}, buttonText: {} }),
}));

const ProtectedContent = () => <Text testID="protected-content">Conteúdo Secreto</Text>;

describe('BiometricGate', () => {
  let appStateListener: ((state: string) => void) | null = null;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    appStateListener = null;

    jest.spyOn(AppState, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'change') {
        appStateListener = handler as (state: string) => void;
      }
      return { remove: jest.fn() } as any; 
    });
  });

  it('deve renderizar o conteúdo protegido diretamente se a biometria estiver desativada', async () => {
    const { getByTestId, queryByText } = await render(
      <BiometricGate isBiometricsEnabled={false} loading={false}>
        <ProtectedContent />
      </BiometricGate>
    );

    expect(getByTestId('protected-content')).toBeTruthy();
    expect(queryByText('security.lockScreenPrompt')).toBeNull();
  });

  it('deve mostrar a tela de bloqueio e chamar a API do dispositivo se a biometria estiver ativada', async () => {
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValueOnce({ success: false });

    const { getByText, queryByTestId } = await render(
      <BiometricGate isBiometricsEnabled={true} loading={false}>
        <ProtectedContent />
      </BiometricGate>
    );

    expect(queryByTestId('protected-content')).toBeNull();
    expect(getByText('security.lockScreenPrompt')).toBeTruthy();
    
    await waitFor(() => {
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('deve liberar o conteúdo protegido quando a biometria for bem sucedida no botão', async () => {
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValueOnce({ success: false });

    const { getByText, findByTestId } = await render(
      <BiometricGate isBiometricsEnabled={true} loading={false}>
        <ProtectedContent />
      </BiometricGate>
    );

    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValueOnce({ success: true });

    const unlockButton = getByText('security.unlockButton');
    
    await act(async () => {
      fireEvent.press(unlockButton);
    });

    const protectedContent = await findByTestId('protected-content');
    expect(protectedContent).toBeTruthy();
  });

  it('deve trancar o app novamente quando ele for para o background', async () => {
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValueOnce({ success: true });

    const { findByTestId, queryByTestId, getByText } = await render(
      <BiometricGate isBiometricsEnabled={true} loading={false}>
        <ProtectedContent />
      </BiometricGate>
    );

    expect(await findByTestId('protected-content')).toBeTruthy();

    await act(async () => {
      if (appStateListener) {
        appStateListener('background');
      }
    });

    expect(queryByTestId('protected-content')).toBeNull();
    expect(getByText('security.lockScreenPrompt')).toBeTruthy();
  });
});