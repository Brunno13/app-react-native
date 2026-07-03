import React, { useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { getChangePasswordSchema, type ChangePasswordFormData } from '../domain/profileSchema';

import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useGlobalStyles } from '@/shared/ui/globalStyles';

interface SecurityFormProps {
  onSubmitPasswordChange: (data: ChangePasswordFormData) => Promise<boolean>;
  loading: boolean;
}

export const SecurityForm = ({ onSubmitPasswordChange, loading }: SecurityFormProps) => {
  const { t } = useTranslation();
  const newPasswordRef = useRef<TextInput>(null);
  
  const { spacing } = useAppTheme();
  const globalStyles = useGlobalStyles();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(getChangePasswordSchema(t)),
    defaultValues: { currentPassword: '', newPassword: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    const isSuccess = await onSubmitPasswordChange(data);
    if (isSuccess) reset(); 
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { width: '100%', maxWidth: 400 },
    submitButton: { marginTop: spacing.sm },
  }), [spacing]);

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[globalStyles.input, errors.currentPassword && globalStyles.inputError]}
            placeholder={t('profile.currentPasswordPlaceholder')}
            placeholderTextColor={globalStyles.textSecondary.color} // Melhor contraste no placeholder
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            editable={!loading}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => newPasswordRef.current?.focus()}
          />
        )}
      />
      {errors.currentPassword && <Text style={globalStyles.formErrorText}>{errors.currentPassword.message}</Text>}

      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            ref={newPasswordRef}
            style={[globalStyles.input, errors.newPassword && globalStyles.inputError]}
            placeholder={t('profile.newPasswordPlaceholder')}
            placeholderTextColor={globalStyles.textSecondary.color}
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        )}
      />
      {errors.newPassword && <Text style={globalStyles.formErrorText}>{errors.newPassword.message}</Text>}

      <TouchableOpacity 
        style={[globalStyles.buttonPrimary, styles.submitButton, (!isValid || loading) && { opacity: 0.6 }]} 
        onPress={handleSubmit(onSubmit)} 
        disabled={!isValid || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>{t('profile.updatePassword')}</Text>}
      </TouchableOpacity>
    </View>
  );
};