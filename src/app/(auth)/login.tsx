import React from 'react';
import { useRouter } from 'expo-router';
import { AuthScreenLayout, LoginForm, useAuth } from '@/features/auth';

export default function LoginScreen() {
  const { signIn, loading } = useAuth();
  const router = useRouter();

  return (
    <AuthScreenLayout testID="login-screen">
      <LoginForm
        onLogin={signIn}
        loading={loading}
        onNavigateToSignUp={() => router.push('/(auth)/signup')}
        onNavigateToForgot={() => router.push('/(auth)/forgot-password')}
      />
    </AuthScreenLayout>
  );
}
