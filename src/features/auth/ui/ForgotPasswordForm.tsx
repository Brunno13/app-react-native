import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../validations/authSchema';
import { globalStyles } from '../../../shared/ui/globalStyles';
import { theme } from '../../../shared/ui/theme';

interface ForgotPasswordFormProps {
  onResetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
  onNavigateToLogin: () => void;
}

export const ForgotPasswordForm = ({ onResetPassword, loading, onNavigateToLogin }: ForgotPasswordFormProps) => {
  const [statusMsg, setStatusMsg] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setStatusMsg('');
    const response = await onResetPassword(data.email);
    
    if (response?.error) {
      setStatusMsg(`Erro: ${response.error.message}`);
    } else {
      setStatusMsg('Se o e-mail existir, você receberá um link de recuperação.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Recuperar Senha</Text>
      
      {statusMsg ? (
        <Text style={styles.statusText}>{statusMsg}</Text>
      ) : null}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[globalStyles.input, errors.email && globalStyles.inputError]}
            placeholder="Seu e-mail"
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
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>Enviar Link</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onNavigateToLogin} style={styles.loginButton}>
        <Text style={globalStyles.linkText}>Voltar para o Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 400 },
  statusText: { color: theme.colors.primary, textAlign: 'center', marginBottom: theme.spacing.lg, fontWeight: 'bold' },
  submitButton: { marginTop: theme.spacing.sm },
  loginButton: { marginTop: theme.spacing.xl, alignItems: 'center' },
});