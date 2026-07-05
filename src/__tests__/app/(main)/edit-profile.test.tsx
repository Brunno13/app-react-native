import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useAuth, useGlobalAuth } from '@/features/auth';
import { uploadAvatarImage } from '@/features/profile';
import { useNotification } from '@/shared/providers/NotificationProvider';
import EditProfileRoute from '@/app/(main)/edit-profile';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/shared/providers/NotificationProvider', () => ({
  useNotification: jest.fn(),
}));

jest.mock('@/shared/ui/globalStyles', () => ({
  useGlobalStyles: () => ({
    container: { flex: 1 },
  }),
}));

jest.mock('@/features/auth', () => ({
  useAuth: jest.fn(),
  useGlobalAuth: jest.fn(),
}));

jest.mock('@/features/profile', () => {
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    uploadAvatarImage: jest.fn(),
    
    EditProfileForm: ({ initialName, serverAvatarUri, isSubmitting, onSubmitProfile }: any) => (
      <View testID="mock-edit-profile-form">
        <Text testID="prop-name">{initialName}</Text>
        <Text testID="prop-avatar">{serverAvatarUri || 'null'}</Text>
        <Text testID="prop-submitting">{String(isSubmitting)}</Text>
        
        <TouchableOpacity 
          testID="trigger-submit-no-image" 
          onPress={() => onSubmitProfile({ name: 'Brunno B' }, null, null)} 
        />
        
        <TouchableOpacity 
          testID="trigger-submit-with-image" 
          onPress={() => onSubmitProfile({ name: 'Brunno B' }, 'file://local.jpg', 'base64string')} 
        />
      </View>
    ),
  };
});

describe('EditProfileRoute (Camada App)', () => {
  const mockBack = jest.fn();
  const mockUpdateUser = jest.fn();
  const mockShowToast = jest.fn();
  const mockShowModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
    (useNotification as jest.Mock).mockReturnValue({ showToast: mockShowToast, showModal: mockShowModal });
    (useGlobalAuth as jest.Mock).mockReturnValue({
      session: {
        user: {
          name: 'Brunno',
          image: 'https://servidor.com/avatar.png',
          updatedAt: '2026-01-01T12:00:00.000Z',
        },
      },
    });

    (useAuth as jest.Mock).mockReturnValue({
      updateUser: mockUpdateUser,
      loading: false,
    });
  });

  it('deve inicializar passando o nome e a URL otimizada (com cache breaker) para o formulário', async () => {
    const { getByTestId } = await render(<EditProfileRoute />);

    expect(getByTestId('prop-name').props.children).toBe('Brunno');
    
    const expectedTimestamp = new Date('2026-01-01T12:00:00.000Z').getTime();
    expect(getByTestId('prop-avatar').props.children).toBe(`https://servidor.com/avatar.png?t=${expectedTimestamp}`);
  });

  it('deve atualizar o perfil APENAS com o nome quando nenhuma imagem for enviada', async () => {
    mockUpdateUser.mockResolvedValueOnce({ error: null });

    const { getByTestId } = await render(<EditProfileRoute />);
    
    await act(async () => {
      fireEvent.press(getByTestId('trigger-submit-no-image'));
    });

    expect(uploadAvatarImage).not.toHaveBeenCalled();
    expect(mockUpdateUser).toHaveBeenCalledWith({ name: 'Brunno B' });
    expect(mockShowToast).toHaveBeenCalledWith('alerts.success', 'alerts.profileUpdated', 'success');
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('deve fazer upload da imagem e enviar a nova URL junto com o nome na atualização', async () => {
    (uploadAvatarImage as jest.Mock).mockResolvedValueOnce({ 
      success: true, 
      url: 'https://cdn.com/novo-avatar.png' 
    });
    
    mockUpdateUser.mockResolvedValueOnce({ error: null });

    const { getByTestId } = await render(<EditProfileRoute />);
    
    await act(async () => {
      fireEvent.press(getByTestId('trigger-submit-with-image'));
    });

    expect(uploadAvatarImage).toHaveBeenCalledWith('base64string', 'file://local.jpg');
    expect(mockUpdateUser).toHaveBeenCalledWith({ 
      name: 'Brunno B', 
      image: 'https://cdn.com/novo-avatar.png' 
    });

    expect(mockShowToast).toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalled();
  });

  it('deve interromper o fluxo e mostrar Modal de erro se o upload da imagem falhar', async () => {
    (uploadAvatarImage as jest.Mock).mockResolvedValueOnce({ 
      success: false, 
      error: 'Falha no S3' 
    });

    const { getByTestId } = await render(<EditProfileRoute />);
    
    await act(async () => {
      fireEvent.press(getByTestId('trigger-submit-with-image'));
    });

    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockShowModal).toHaveBeenCalledWith('alerts.error', 'alerts.uploadError', 'error');
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('deve mostrar Modal de erro se a API de atualização do usuário falhar', async () => {
    const mockError = new Error('Falha no banco de dados');
    mockUpdateUser.mockResolvedValueOnce({ error: mockError });

    const { getByTestId } = await render(<EditProfileRoute />);
    
    await act(async () => {
      fireEvent.press(getByTestId('trigger-submit-no-image'));
    });

    expect(mockShowModal).toHaveBeenCalledWith('alerts.error', 'Falha no banco de dados', 'error');
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });
});