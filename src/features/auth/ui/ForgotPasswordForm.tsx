import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { getForgotPasswordSchema, type ForgotPasswordFormData } from '../domain/authSchema';

import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useGlobalStyles } from '@/shared/ui/globalStyles';

interface ForgotPasswordFormProps {
  onResetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
  onNavigateToLogin: () => void;
}

export const ForgotPasswordForm = ({ onResetPassword, loading, onNavigateToLogin }: ForgotPasswordFormProps) => {
  const { t } = useTranslation();
  const [statusMsg, setStatusMsg] = useState('');

  const { colors, spacing } = useAppTheme();
  const globalStyles = useGlobalStyles();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(getForgotPasswordSchema(t)),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setStatusMsg('');
    const response = await onResetPassword(data.email);
    
    if (response?.error) {
      setStatusMsg(`${t('errors.genericError')}: ${response.error.message}`);
    } else {
      setStatusMsg(t('auth.resetLinkSent'));
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { width: '100%', maxWidth: 400 },
    statusText: { color: colors.primary, textAlign: 'center', marginBottom: spacing.lg, fontWeight: 'bold' },
    submitButton: { marginTop: spacing.sm },
    loginButton: { marginTop: spacing.xl, alignItems: 'center' },
  }), [colors, spacing]);

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>{t('auth.recoverPassword')}</Text>
      
      {statusMsg ? (
        <Text style={styles.statusText}>{statusMsg}</Text>
      ) : null}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[globalStyles.input, errors.email && globalStyles.inputError]}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={globalStyles.textSecondary.color}
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        )}
      />
      {errors.email && <Text style={globalStyles.formErrorText}>{errors.email.message}</Text>}

      <TouchableOpacity 
        style={[globalStyles.buttonPrimary, styles.submitButton, (!isValid || loading) && { opacity: 0.6 }]} 
        onPress={handleSubmit(onSubmit)} 
        disabled={!isValid || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>{t('auth.sendLink')}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onNavigateToLogin} style={styles.loginButton}>
        <Text style={globalStyles.linkText}>{t('auth.backToLogin')}</Text>
      </TouchableOpacity>
    </View>
  );
};