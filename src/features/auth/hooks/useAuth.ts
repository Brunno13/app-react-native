import { useState } from 'react';
import { authClient } from '@/shared/lib/auth';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    return { data, error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    const { data, error } = await authClient.signUp.email({ email, password, name });
    setLoading(false);
    return { data, error };
  };

  const forgetPassword = async (email: string) => {
    setLoading(true);
    const { data, error } = await (authClient as any).forgetPassword({ 
      email, 
      redirectTo: 'app-react-native://reset-password'
    });
    setLoading(false);
    return { data, error };
  };

  const signInWithSocial = async (provider: 'google' | 'github') => {
    setLoading(true);
    const { data, error } = await authClient.signIn.social({ provider });
    setLoading(false);
    return { data, error };
  };

  const updateUser = async (updateData: { name?: string; image?: string }) => {
    setLoading(true);
    const { data, error } = await authClient.updateUser(updateData);
    setLoading(false);
    return { data, error };
  };

  const changePassword = async (newPassword: string, currentPassword: string) => {
    setLoading(true);
    const { data, error } = await authClient.changePassword({ 
      newPassword, 
      currentPassword,
      revokeOtherSessions: true 
    });
    setLoading(false);
    return { data, error };
  };

  const getActiveSessions = async () => {
    setLoading(true);
    const { data, error } = await authClient.listSessions();
    setLoading(false);
    return { data, error };
  };

  const revokeDeviceSession = async (sessionToken: string) => {
    setLoading(true);
    const { data, error } = await authClient.revokeSession({ token: sessionToken });
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authClient.signOut();
    setLoading(false);
    return result;
  };

  return { 
    signIn, 
    signUp, 
    forgetPassword, 
    signInWithSocial,
    updateUser,
    changePassword,
    getActiveSessions,
    revokeDeviceSession,
    signOut,
    loading 
  };
};