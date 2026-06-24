import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';

import { LoginForm } from './LoginForm'; 
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { useAuth } from '../hooks/useAuth';

type AuthView = 'login' | 'signup' | 'forgot_password';

export const AuthScreen = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const { signIn, loading } = useAuth();

  const renderView = () => {
    switch (currentView) {
      case 'signup':
        return (
          <SignUpForm 
            onSuccess={() => setCurrentView('login')} 
            onNavigateToLogin={() => setCurrentView('login')} 
          />
        );
      case 'forgot_password':
        return (
          <ForgotPasswordForm 
            onNavigateToLogin={() => setCurrentView('login')} 
          />
        );
      case 'login':
      default:
        return (
          <LoginForm 
            onLogin={signIn}
            loading={loading}
            onNavigateToSignUp={() => setCurrentView('signup')}
            onNavigateToForgot={() => setCurrentView('forgot_password')}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderView()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }
});