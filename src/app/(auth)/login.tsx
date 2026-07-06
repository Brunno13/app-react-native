import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LoginForm, useAuth } from '@/features/auth';

export default function LoginScreen() {
  const { signIn, loading } = useAuth();
  const router = useRouter(); 

  return (
    <SafeAreaView style={styles.safeArea} testID="login-screen">
      <View style={styles.container}>
        <LoginForm 
          onLogin={signIn} 
          loading={loading} 
          onNavigateToSignUp={() => router.push('/(auth)/signup')}
          onNavigateToForgot={() => router.push('/(auth)/forgot-password')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }
});