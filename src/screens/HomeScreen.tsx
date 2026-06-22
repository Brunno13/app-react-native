import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthFlow } from '../features/auth/hooks/useAuth';

export const HomeScreen = () => {
  const { session, handleLogout } = useAuthFlow();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, {session?.user?.name || 'Usuário'}!</Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  logoutButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#DC3545',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});