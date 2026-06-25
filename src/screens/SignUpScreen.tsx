import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SignUpForm } from '../features/auth/ui/SignUpForm';

export const SignUpScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SignUpForm 
          // O router.back() tira a tela de cadastro da pilha e volta pro login com animação
          onSuccess={() => router.back()} 
          onNavigateToLogin={() => router.back()} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }
});