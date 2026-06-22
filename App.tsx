import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { useAuthFlow } from './src/features/auth/hooks/useAuth';

export default function App() {
  const { session, isPending } = useAuthFlow();

  // Exibe o spinner de carregamento enquanto o Better Auth checa o SecureStore
  if (isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  // Se tiver sessão, vai pra Home. Se não, vai pro Login.
  return session ? <HomeScreen /> : <AuthScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  }
});