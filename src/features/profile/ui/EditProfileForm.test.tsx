import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { EditProfileForm } from './EditProfileForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: { primary: '#000', background: '#fff' },
    spacing: { xl: 24, sm: 8 },
  }),
}));

jest.mock('@/shared/ui/globalStyles', () => ({
  useGlobalStyles: () => ({
    avatarLarge: {},
    avatarLargeText: {},
    title: {},
    input: {},
    inputError: {},
    formErrorText: {},
    buttonPrimary: {},
    buttonText: {},
    textSecondary: { color: '#666666' },
  }),
}));

describe('EditProfileForm - Teste Comportamental', () => {
  const mockOnSubmitProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar os dados iniciais e impedir o envio se não houver edições', async () => {
    const { getByText } = await render(
      <EditProfileForm
        initialName="Brunno"
        serverAvatarUri={null}
        isSubmitting={false}
        onSubmitProfile={mockOnSubmitProfile}
      />
    );

    expect(getByText('B')).toBeTruthy();
    
    const submitBtn = getByText('profile.saveChanges');
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    expect(mockOnSubmitProfile).not.toHaveBeenCalled();
  });

  it('deve exibir erro do Zod e bloquear envio se o nome for apagado/ficar muito curto', async () => {
    const { getByPlaceholderText, findByText, getByText } = await render(
      <EditProfileForm
        initialName="Brunno"
        serverAvatarUri={null}
        isSubmitting={false}
        onSubmitProfile={mockOnSubmitProfile}
      />
    );

    const input = getByPlaceholderText('profile.fullNamePlaceholder');

    await act(async () => {
      fireEvent.changeText(input, 'Br');
    });

    expect(await findByText('validation.nameMin')).toBeTruthy();
    
    const submitBtn = getByText('profile.saveChanges');
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    expect(mockOnSubmitProfile).not.toHaveBeenCalled();
  });

  it('deve permitir o envio se um nome válido for inserido', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <EditProfileForm
        initialName="Brunno"
        serverAvatarUri={null}
        isSubmitting={false}
        onSubmitProfile={mockOnSubmitProfile}
      />
    );

    const input = getByPlaceholderText('profile.fullNamePlaceholder');
    
    await act(async () => {
      fireEvent.changeText(input, 'Brunno Atualizado');
    });

    const submitBtn = getByText('profile.saveChanges');

    await waitFor(() => {
      expect(mockOnSubmitProfile).not.toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(submitBtn);
    });

    expect(mockOnSubmitProfile).toHaveBeenCalledWith(
      { name: 'Brunno Atualizado' },
      null,
      null
    );
  });

  it('deve abrir a galeria e permitir o envio apenas ao alterar a foto', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///local/photo.jpg', base64: 'fake-base64-string' }],
    });

    const { getByText } = await render(
      <EditProfileForm
        initialName="Brunno"
        serverAvatarUri={null}
        isSubmitting={false}
        onSubmitProfile={mockOnSubmitProfile}
      />
    );

    const changePhotoBtn = getByText('profile.changePhoto');
    
    await act(async () => {
      fireEvent.press(changePhotoBtn);
    });

    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();

    const submitBtn = getByText('profile.saveChanges');

    await waitFor(() => {
      expect(mockOnSubmitProfile).not.toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(submitBtn);
    });

    expect(mockOnSubmitProfile).toHaveBeenCalledWith(
      { name: 'Brunno' },
      'file:///local/photo.jpg',
      'fake-base64-string'
    );
  });
});