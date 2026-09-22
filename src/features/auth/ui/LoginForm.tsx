import React, { useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { getLoginSchema, type LoginFormData } from '../domain/authSchema';
import type { AuthError } from '../hooks/useAuth';
import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useGlobalStyles } from '@/shared/ui/globalStyles';
import { FormTextInput } from '@/shared/ui';
import { useNotification } from '@/shared/providers/NotificationProvider';

interface LoginFormProps {
  onLogin: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  loading: boolean;
  onNavigateToSignUp: () => void;
  onNavigateToForgot: () => void;
}

export const LoginForm = ({ onLogin, loading, onNavigateToSignUp, onNavigateToForgot }: LoginFormProps) => {
  const { t } = useTranslation();
  const { showModal } = useNotification();
  const passwordRef = useRef<TextInput>(null);

  const { spacing } = useAppTheme();
  const globalStyles = useGlobalStyles();

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    const response = await onLogin(data.email, data.password);

    if (response?.error) {
      if (response.error.code === 'OFFLINE') {
        showModal(t('alerts.networkError'), response.error.message, 'error');
        return;
      }

      if (response.error.code === 'TIMEOUT') {
        showModal(t('alerts.timeoutError'), response.error.message, 'info');
        return;
      }

      //TODO for debug
      // showModal(
      //   t('alerts.error') || 'Erro de Conexão',
      //   response.error.message || t('auth.invalidCredentials'),
      //   'error'
      // );

      setError('email', { type: 'manual', message: t('auth.invalidCredentials') });
      setError('password', { type: 'manual', message: t('auth.checkPassword') });
    }
  };

  const handleNavigateToSignUp = () => {
    clearErrors();
    setValue('password', '');
    onNavigateToSignUp();
  };

  const handleNavigateToForgot = () => {
    clearErrors();
    setValue('password', '');
    onNavigateToForgot();
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { width: '100%', maxWidth: 400 },
    forgotButton: { alignSelf: 'flex-end', marginBottom: spacing.lg },
    signupButton: { marginTop: spacing.xl, alignItems: 'center' },
  }), [spacing]);

  return (
    <View style={styles.container} testID="login-form-container">
      <Text style={globalStyles.title}>{t('auth.welcomeBack')}</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormTextInput
            testID="input-email"
            error={errors.email?.message}
            loading={loading}
            placeholder={t('auth.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormTextInput
            testID="input-password"
            inputRef={passwordRef}
            error={errors.password?.message}
            loading={loading}
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            returnKeyType="send"
            onSubmitEditing={() => { void handleSubmit(onSubmit)(); }}
          />
        )}
      />

      <TouchableOpacity testID="link-to-forgot" onPress={handleNavigateToForgot} style={styles.forgotButton}>
        <Text style={globalStyles.linkText}>{t('auth.forgotPasswordLink')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="button-login"
        style={[globalStyles.buttonPrimary, (!isValid || loading) && { opacity: 0.6 }]}
        onPress={() => { void handleSubmit(onSubmit)(); }}
        disabled={!isValid || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>{t('auth.login')}</Text>}
      </TouchableOpacity>

      <TouchableOpacity testID="link-to-signup" onPress={handleNavigateToSignUp} style={styles.signupButton}>
        <Text style={globalStyles.textSecondary}>
          {t('auth.noAccount')} <Text style={globalStyles.linkText}>{t('auth.signUpLink')}</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};