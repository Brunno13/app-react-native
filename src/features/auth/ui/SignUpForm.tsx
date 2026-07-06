import React, { useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { getRegisterSchema, type RegisterFormData } from '../domain/authSchema';

import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useGlobalStyles } from '@/shared/ui/globalStyles';

interface SignUpFormProps {
  onSignUp: (data: RegisterFormData) => Promise<{ error: any }>; 
  loading: boolean;
  onNavigateToLogin: () => void;
}

export const SignUpForm = ({ onSignUp, loading, onNavigateToLogin }: SignUpFormProps) => {
  const { t } = useTranslation();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const { spacing } = useAppTheme();
  const globalStyles = useGlobalStyles();

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(getRegisterSchema(t)),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    const response = await onSignUp(data);
    if (response?.error) {
      setError('email', { type: 'server', message: response.error.message || t('auth.signupError') });
    }
  };

  const handleNavigateToLogin = () => {
    clearErrors();
    setValue('password', '');
    setValue('confirmPassword', '');
    onNavigateToLogin();
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { width: '100%', maxWidth: 400 },
    submitButton: { marginTop: spacing.sm },
    loginButton: { marginTop: spacing.xl, alignItems: 'center' },
  }), [spacing]);

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>{t('auth.createAccount')}</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            testID="input-signup-name"
            style={[globalStyles.input, errors.name && globalStyles.inputError]}
            placeholder={t('auth.namePlaceholder')}
            placeholderTextColor={globalStyles.textSecondary.color}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            editable={!loading}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        )}
      />
      {errors.name && <Text style={globalStyles.formErrorText}>{errors.name.message}</Text>}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            testID="input-signup-email"
            ref={emailRef}
            style={[globalStyles.input, errors.email && globalStyles.inputError]}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={globalStyles.textSecondary.color}
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            editable={!loading}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        )}
      />
      {errors.email && <Text style={globalStyles.formErrorText}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            testID="input-signup-password"
            ref={passwordRef}
            style={[globalStyles.input, errors.password && globalStyles.inputError]}
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor={globalStyles.textSecondary.color}
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            editable={!loading}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
        )}
      />
      {errors.password && <Text style={globalStyles.formErrorText}>{errors.password.message}</Text>}

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            testID="input-signup-confirm-password"
            ref={confirmPasswordRef}
            style={[globalStyles.input, errors.confirmPassword && globalStyles.inputError]}
            placeholder={t('auth.confirmPasswordPlaceholder')}
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
      {errors.confirmPassword && <Text style={globalStyles.formErrorText}>{errors.confirmPassword.message}</Text>}

      <TouchableOpacity 
        testID="button-signup"
        style={[globalStyles.buttonPrimary, styles.submitButton, (!isValid || loading) && { opacity: 0.6 }]} 
        onPress={handleSubmit(onSubmit)} 
        disabled={!isValid || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>{t('auth.createAccountButton')}</Text>}
      </TouchableOpacity>

      <TouchableOpacity testID="link-to-login" onPress={handleNavigateToLogin} style={styles.loginButton}>
        <Text style={globalStyles.textSecondary}>
          {t('auth.alreadyHaveAccount')} <Text style={globalStyles.linkText}>{t('auth.login')}</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};