import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthFlow } from '../features/auth/hooks/useAuth';
import { LoginForm } from '../features/auth/ui/LoginForm';

export const AuthScreen = () => {
  const { handleLogin, loading } = useAuthFlow();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar no App Bun</Text>
      <LoginForm onLogin={handleLogin} loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
});