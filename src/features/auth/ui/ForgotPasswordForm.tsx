import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';

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
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>
      
      {statusMsg ? <Text style={styles.status}>{statusMsg}</Text> : null}

      <TextInput placeholder="Seu e-mail" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar Link</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onNavigateToLogin}>
        <Text style={styles.link}>Voltar para o Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  status: { marginBottom: 16, textAlign: 'center', fontWeight: 'bold' },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 16 }
});