import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { EditProfileForm } from '../../features/profile/ui/EditProfileForm';
import { useAuth, useAuthFlow } from '../../features/auth/hooks/useAuth';
import { uploadAvatarImage } from '../../shared/api/uploadApi';
import type { EditProfileFormData } from '../../features/profile/validations/profileSchema';
import { globalStyles } from '../../shared/ui/globalStyles';

export const EditProfileScreen = () => {
  const { session } = useAuthFlow();
  const { updateUser, loading: authLoading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const isSubmitting = authLoading || uploading;
  const serverAvatarUrl = session?.user?.image;
  const avatarCacheBreaker = session?.user?.updatedAt 
    ? new Date(session.user.updatedAt).getTime() 
    : new Date().getTime();
  const optimizedServerUri = serverAvatarUrl ? `${serverAvatarUrl}?t=${avatarCacheBreaker}` : null;

  const handleUpdateProfile = async (data: EditProfileFormData, localImageUri: string | null, imageBase64: string | null) => {
    const updatePayload: { name?: string; image?: string } = { name: data.name };

    if (localImageUri && imageBase64) {
      try {
        setUploading(true);
        updatePayload.image = await uploadAvatarImage(imageBase64, localImageUri);
      } catch (error) {
        Alert.alert('Erro', 'Falha ao fazer upload da imagem.');
        setUploading(false);
        return; 
      }
    }

    const { error } = await updateUser(updatePayload);
    setUploading(false);
    
    if (error) {
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o perfil.');
    } else {
      Alert.alert('Sucesso', 'Perfil atualizado!');
      router.back();
    }
  };

  return (
    <View style={globalStyles.container}>
      <EditProfileForm 
        initialName={session?.user?.name || ''}
        serverAvatarUri={optimizedServerUri}
        isSubmitting={isSubmitting}
        onSubmitProfile={handleUpdateProfile}
      />
    </View>
  );
};