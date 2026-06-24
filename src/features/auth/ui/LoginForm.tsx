import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../../shared/ui/globalStyles'; 

interface LoginFormProps {
  onLogin: (email: string, pass: string) => void;
  loading: boolean;
  onNavigateToSignUp: () => void;
  onNavigateToForgot: () => void;
}

export const LoginForm = ({ onLogin, loading, onNavigateToSignUp, onNavigateToForgot }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={{ width: '100%' }}>
      <Text style={globalStyles.title}>Realize o login</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity 
        style={globalStyles.buttonPrimary} 
        onPress={() => onLogin(email, password)} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={globalStyles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <View style={{ marginTop: 20, alignItems: 'center', gap: 16 }}>
        <TouchableOpacity onPress={onNavigateToForgot}>
          <Text style={globalStyles.linkText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNavigateToSignUp}>
          <Text style={globalStyles.linkText}>Criar nova conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};