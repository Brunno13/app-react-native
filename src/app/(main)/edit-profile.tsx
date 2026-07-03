import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EditProfileForm, type EditProfileFormData } from '@/features/profile';
import { uploadAvatarImage } from '@/features/profile/api/uploadApi';
import { useAuth, useGlobalAuth } from '@/features/auth';
import { useGlobalStyles } from '@/shared/ui/globalStyles';
import { useNotification } from '@/shared/providers/NotificationProvider'; 

export default function EditProfileRoute() {
  const { session } = useGlobalAuth();
  const { updateUser, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const { showToast, showModal } = useNotification(); 
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const globalStyles = useGlobalStyles();

  const isSubmitting = authLoading || uploading;
  const serverAvatarUrl = session?.user?.image;
  const avatarCacheBreaker = session?.user?.updatedAt ? new Date(session.user.updatedAt).getTime() : new Date().getTime();
  const optimizedServerUri = serverAvatarUrl ? `${serverAvatarUrl}?t=${avatarCacheBreaker}` : null;

  const handleUpdateProfile = async (data: EditProfileFormData, localImageUri: string | null, imageBase64: string | null) => {
    const updatePayload: { name?: string; image?: string } = { name: data.name };

    if (localImageUri && imageBase64) {
      try {
        setUploading(true);
        const uploadResult = await uploadAvatarImage(imageBase64, localImageUri);
        if (uploadResult.success && uploadResult.url) {
          updatePayload.image = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || 'Erro no upload');
        }
      } catch (error) {
        showModal(t('alerts.error'), t('alerts.uploadError'), 'error');
        setUploading(false);
        return; 
      }
    }

    const { error } = await updateUser(updatePayload);
    setUploading(false);
    
    if (error) {
      showModal(t('alerts.error'), error.message || t('alerts.error'), 'error');
    } else {
      showToast(t('alerts.success'), t('alerts.profileUpdated'), 'success');
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
}