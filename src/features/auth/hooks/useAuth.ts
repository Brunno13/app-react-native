import { useState } from 'react';
import * as Network from 'expo-network';
import { useTranslation } from 'react-i18next';
import { authClient } from '@/shared/lib/auth';
import { db } from '@/shared/db/client';
import { AuthRepository } from '@/shared/db/repositories/authRepository';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const networkState = await Network.getNetworkStateAsync();
      const isOnline = networkState.isConnected && networkState.isInternetReachable;

      if (!isOnline) {
        setLoading(false);
        return { data: null, error: { code: 'OFFLINE', message: t('alerts.networkOfflineMessage') } };
      }

      const timeoutPromise = new Promise<{ data: null, error: any }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { code: 'TIMEOUT', message: t('alerts.timeoutMessage') } }), 10000)
      );

      const authPromise = authClient.signIn.email({ email, password });

      const response = await Promise.race([authPromise, timeoutPromise]) as { data: any, error: any };

      setLoading(false);
      return response;

    } catch (err: any) {
      setLoading(false);
      return { data: null, error: { code: 'UNKNOWN', message: err.message || t('alerts.unknownError') } };
    }
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
    await AuthRepository.clear(db);
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