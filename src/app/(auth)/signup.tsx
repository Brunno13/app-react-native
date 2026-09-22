import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AuthScreenLayout, useAuth, SignUpForm, type RegisterFormData } from '@/features/auth';
import { useNotification } from '@/shared/providers/NotificationProvider';

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async (data: RegisterFormData) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.name);
    setLoading(false);

    if (error) {
      return { error };
    }

    showToast(t('alerts.success'), t('alerts.accountCreated'), 'success');
    router.back();
    return { error: null };
  };

  return (
    <AuthScreenLayout testID="signup-screen" containerTestID="signup-form-container">
      <SignUpForm
        onSignUp={handleSignUp}
        loading={loading}
        onNavigateToLogin={() => router.back()}
      />
    </AuthScreenLayout>
  );
}
