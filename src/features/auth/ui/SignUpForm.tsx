import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../validations/authSchema';
import { globalStyles } from '../../../shared/ui/globalStyles';
import { theme } from '../../../shared/ui/theme';

interface SignUpFormProps {
  onSignUp: (data: RegisterFormData) => Promise<{ error: any }>; 
  loading: boolean;
  onNavigateToLogin: () => void;
}

export const SignUpForm = ({ onSignUp, loading, onNavigateToLogin }: SignUpFormProps) => {
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors, // 🔥
    setValue,    // 🔥
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    const response = await onSignUp(data);
    if (response?.error) {
      setError('email', { type: 'server', message: response.error.message || 'Erro ao cadastrar.' });
    }
  };

  const handleNavigateToLogin = () => {
    clearErrors();
    setValue('password', '');
    setValue('confirmPassword', '');
    onNavigateToLogin();
  };

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Criar Conta</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[globalStyles.input, errors.name && globalStyles.inputError]}
            placeholder="Nome completo"
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
            ref={emailRef}
            style={[globalStyles.input, errors.email && globalStyles.inputError]}
            placeholder="E-mail"
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
            placeholder="Senha"
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
            ref={confirmPasswordRef}
            style={[globalStyles.input, errors.confirmPassword && globalStyles.inputError]}
            placeholder="Confirme a senha"
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
        style={[globalStyles.buttonPrimary, styles.submitButton, (!isValid || loading) && { opacity: 0.6 }]} 
        onPress={handleSubmit(onSubmit)} 
        disabled={!isValid || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>Cadastrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleNavigateToLogin} style={styles.loginButton}>
        <Text style={globalStyles.textSecondary}>
          Já tem uma conta? <Text style={globalStyles.linkText}>Entrar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 400 },
  submitButton: { marginTop: theme.spacing.sm },
  loginButton: { marginTop: theme.spacing.xl, alignItems: 'center' },
});