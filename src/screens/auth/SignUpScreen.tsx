import React, { useState } from 'react';
import { SafeAreaView, View, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SignUpForm } from '../../features/auth/ui/SignUpForm';
import { authClient } from '../../shared/lib/auth';
import type { RegisterFormData } from '../../features/auth/validations/authSchema';

export const SignUpScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (data: RegisterFormData) => {
    setLoading(true);
    const { error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });
    setLoading(false);

    if (error) {
      return { error };
    }

    Alert.alert('Sucesso', 'Conta criada com sucesso!');
    router.back();
    return { error: null };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SignUpForm 
          onSignUp={handleSignUp} 
          loading={loading}
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