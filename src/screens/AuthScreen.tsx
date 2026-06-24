import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';

import { LoginForm } from '../features/auth/ui/LoginForm'; 
import { SignUpForm } from '../features/auth/ui/SignUpForm';
import { ForgotPasswordForm } from '../features/auth/ui/ForgotPasswordForm';
import { useAuth } from '../features/auth/hooks/useAuth';

type AuthView = 'login' | 'signup' | 'forgot_password';

export const AuthScreen = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  
  // Extraímos as funções de autenticação do hook correto (useAuth)
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
        // Aqui passamos o signIn e as propriedades de navegação que o TypeScript estava cobrando
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