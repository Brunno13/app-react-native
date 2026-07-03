import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { getEditProfileSchema, type EditProfileFormData } from '../domain/profileSchema';

import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useGlobalStyles } from '@/shared/ui/globalStyles';

interface EditProfileFormProps {
  initialName: string;
  serverAvatarUri: string | null;
  isSubmitting: boolean;
  onSubmitProfile: (data: EditProfileFormData, localImageUri: string | null, imageBase64: string | null) => Promise<void>;
}

export const EditProfileForm = ({ initialName, serverAvatarUri, isSubmitting, onSubmitProfile }: EditProfileFormProps) => {
  const { t } = useTranslation();
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const { colors, spacing } = useAppTheme();
  const globalStyles = useGlobalStyles();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(getEditProfileSchema(t)),
    defaultValues: { name: initialName },
    mode: 'onChange',
  });

  const displayImage = localImageUri || serverAvatarUri;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      if (result.assets[0].base64) {
        setImageBase64(result.assets[0].base64);
      }
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    await onSubmitProfile(data, localImageUri, imageBase64);
  };

  const hasChanges = isDirty || !!localImageUri;
  const canSubmit = isValid && hasChanges;

  const styles = useMemo(() => StyleSheet.create({
    avatarContainer: { alignSelf: 'center', marginBottom: spacing.xl, position: 'relative' },
    editBadge: { 
      position: 'absolute', 
      bottom: -10, 
      alignSelf: 'center', 
      backgroundColor: colors.primary, 
      paddingHorizontal: 12, 
      paddingVertical: 4, 
      borderRadius: 12, 
      borderWidth: 2, 
      borderColor: colors.background
    },
    editBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    submitButton: { marginTop: spacing.sm }
  }), [colors, spacing]);

  return (
    <View style={{ width: '100%' }}>
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={isSubmitting}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={globalStyles.avatarLarge} />
        ) : (
          <View style={globalStyles.avatarLarge}>
            <Text style={globalStyles.avatarLargeText}>
              {initialName.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
        <View style={styles.editBadge}>
          <Text style={styles.editBadgeText}>{t('profile.changePhoto')}</Text>
        </View>
      </TouchableOpacity>

      <Text style={globalStyles.title}>{t('profile.updateData')}</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[globalStyles.input, errors.name && globalStyles.inputError]}
            placeholder={t('profile.fullNamePlaceholder')}
            placeholderTextColor={globalStyles.textSecondary.color}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            editable={!isSubmitting}
            returnKeyType="send"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        )}
      />
      {errors.name && <Text style={globalStyles.formErrorText}>{errors.name.message}</Text>}

      <TouchableOpacity 
        style={[globalStyles.buttonPrimary, styles.submitButton, (!canSubmit || isSubmitting) && { opacity: 0.6 }]} 
        onPress={handleSubmit(onSubmit)} 
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>{t('profile.saveChanges')}</Text>}
      </TouchableOpacity>
    </View>
  );
};