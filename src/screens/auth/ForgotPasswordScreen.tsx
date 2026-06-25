import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ForgotPasswordForm } from '../../features/auth/ui/ForgotPasswordForm';

export const ForgotPasswordScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ForgotPasswordForm 
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