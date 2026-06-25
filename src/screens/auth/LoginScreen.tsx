import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Importamos o roteador
import { LoginForm } from '../../features/auth/ui/LoginForm'; 
import { useAuth } from '../../features/auth/hooks/useAuth';

export const LoginScreen = () => {
  const { signIn, loading } = useAuth();
  const router = useRouter(); // Instanciamos o roteador

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LoginForm 
          onLogin={signIn} 
          loading={loading} 
          // Agora usamos o push para avisar o celular que empilhamos uma nova tela!
          onNavigateToSignUp={() => router.push('/(auth)/signup')}
          onNavigateToForgot={() => router.push('/(auth)/forgot-password')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }
});