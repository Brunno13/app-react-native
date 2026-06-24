import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { globalStyles } from '../../../shared/ui/globalStyles';
import { theme } from '../../../shared/ui/theme';

interface ForgotPasswordFormProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordForm = ({ onNavigateToLogin }: ForgotPasswordFormProps) => {
  const { forgetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleReset = async () => {
    setStatusMsg('');
    const { error } = await forgetPassword(email);
    if (error) {
      setStatusMsg(`Erro: ${error.message}`);
    } else {
      setStatusMsg('Se o e-mail existir, você receberá um link de recuperação.');
    }
  };

  return (
    <View style={{ width: '100%' }}>
      <Text style={globalStyles.title}>Recuperar Senha</Text>
      
      {statusMsg ? (
        <Text style={{ color: theme.colors.primary, textAlign: 'center', marginBottom: 16, fontWeight: 'bold' }}>
          {statusMsg}
        </Text>
      ) : null}

      <TextInput 
        placeholder="Seu e-mail" 
        style={globalStyles.input} 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address" 
      />

      <TouchableOpacity style={globalStyles.buttonPrimary} onPress={handleReset} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>Enviar Link</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onNavigateToLogin} style={{ marginTop: 20 }}>
        <Text style={globalStyles.linkText}>Voltar para o Login</Text>
      </TouchableOpacity>
    </View>
  );
};