import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { globalStyles } from '../../../shared/ui/globalStyles';
import { theme } from '../../../shared/ui/theme'; // Importamos para a cor de erro

interface SignUpFormProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const SignUpForm = ({ onSuccess, onNavigateToLogin }: SignUpFormProps) => {
  const { signUp, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUp = async () => {
    setErrorMsg('');
    const { error } = await signUp(email, password, name);
    if (error) {
      setErrorMsg(error.message || 'Erro ao criar conta');
    } else {
      onSuccess();
    }
  };

  return (
    <View style={{ width: '100%' }}>
      <Text style={globalStyles.title}>Criar Conta</Text>
      
      {errorMsg ? (
        <Text style={{ color: theme.colors.danger, textAlign: 'center', marginBottom: 16 }}>
          {errorMsg}
        </Text>
      ) : null}

      <TextInput 
        placeholder="Nome completo" 
        style={globalStyles.input} 
        value={name} 
        onChangeText={setName} 
      />
      <TextInput 
        placeholder="E-mail" 
        style={globalStyles.input} 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address" 
      />
      <TextInput 
        placeholder="Senha" 
        style={globalStyles.input} 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />

      <TouchableOpacity style={globalStyles.buttonPrimary} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>Cadastrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onNavigateToLogin} style={{ marginTop: 20 }}>
        <Text style={globalStyles.linkText}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>
    </View>
  );
};