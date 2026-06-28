import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SignUpForm } from '@/features/auth/ui/SignUpForm';
import { authClient } from '@/shared/lib/auth';
import type { RegisterFormData } from '@/features/auth/validations/authSchema';
import { useNotification } from '@/shared/providers/NotificationProvider';

export const SignUpScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useNotification();
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

    showToast(t('alerts.success'), t('alerts.accountCreated'), 'success');
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