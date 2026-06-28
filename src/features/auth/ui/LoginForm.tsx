import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { getLoginSchema, type LoginFormData } from '../validations/authSchema';
import { globalStyles } from '../../../shared/ui/globalStyles';
import { theme } from '../../../shared/ui/theme';

interface LoginFormProps {
  onLogin: (email: string, pass: string) => Promise<{ error: any }>;
  loading: boolean;
  onNavigateToSignUp: () => void;
  onNavigateToForgot: () => void;
}

export const LoginForm = ({ onLogin, loading, onNavigateToSignUp, onNavigateToForgot }: LoginFormProps) => {
  const { t } = useTranslation();
  const passwordRef = useRef<TextInput>(null);

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

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>{t('auth.welcomeBack')}</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[globalStyles.input, errors.email && globalStyles.inputError]}
            placeholder={t('auth.emailPlaceholder')}
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
            ref={passwordRef}
            style={[globalStyles.input, errors.password && globalStyles.inputError]}
            placeholder={t('auth.passwordPlaceholder')}
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
      {errors.password && <Text style={globalStyles.formErrorText}>{errors.password.message}</Text>}

      <TouchableOpacity onPress={handleNavigateToForgot} style={styles.forgotButton}>
        <Text style={globalStyles.linkText}>{t('auth.forgotPasswordLink')}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[globalStyles.buttonPrimary, (!isValid || loading) && { opacity: 0.6 }]} 
        onPress={handleSubmit(onSubmit)} 
        disabled={!isValid || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>{t('auth.login')}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleNavigateToSignUp} style={styles.signupButton}>
        <Text style={globalStyles.textSecondary}>
          {t('auth.noAccount')} <Text style={globalStyles.linkText}>{t('auth.signUpLink')}</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 400 },
  forgotButton: { alignSelf: 'flex-end', marginBottom: theme.spacing.lg },
  signupButton: { marginTop: theme.spacing.xl, alignItems: 'center' },
});