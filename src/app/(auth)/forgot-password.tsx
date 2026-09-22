import React from 'react';
import { useRouter } from 'expo-router';
import { AuthScreenLayout, ForgotPasswordForm, useAuth } from '@/features/auth';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const { forgetPassword, loading } = useAuth();

  const handleResetPassword = async (email: string) => {
    return await forgetPassword(email);
  };

  return (
    <AuthScreenLayout>
      <ForgotPasswordForm
        onResetPassword={handleResetPassword}
        loading={loading}
        onNavigateToLogin={() => router.back()}
      />
    </AuthScreenLayout>
  );
}
