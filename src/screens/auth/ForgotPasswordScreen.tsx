import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ForgotPasswordForm } from '../../features/auth/ui/ForgotPasswordForm';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const ForgotPasswordScreen = () => {
  const router = useRouter();
  const { forgetPassword, loading } = useAuth();

  const handleResetPassword = async (email: string) => {
    const response = await forgetPassword(email);
    return response; 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ForgotPasswordForm 
          onResetPassword={handleResetPassword}
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