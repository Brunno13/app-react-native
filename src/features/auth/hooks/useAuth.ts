import { useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { db } from '@/shared/db/client';
import { AuthStorageService } from '@/features/auth/services/authStorageService';
import { AuthApi } from '@/features/auth/api/authApi'; 

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

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

      const authPromise = AuthApi.signInWithEmail(email, password);
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
    const { data, error } = await AuthApi.signUpWithEmail(email, password, name);
    setLoading(false);
    return { data, error };
  };

  const forgetPassword = async (email: string) => {
    setLoading(true);
    const { data, error } = await AuthApi.forgetPassword(email);
    setLoading(false);
    return { data, error };
  };

  const signInWithSocial = async (provider: 'google' | 'github') => {
    setLoading(true);
    const { data, error } = await AuthApi.signInWithSocial(provider);
    setLoading(false);
    return { data, error };
  };

  const updateUser = async (updateData: { name?: string; image?: string }) => {
    setLoading(true);
    const { data, error } = await AuthApi.updateUser(updateData);
    setLoading(false);
    return { data, error };
  };

  const changePassword = async (newPassword: string, currentPassword: string) => {
    setLoading(true);
    const { data, error } = await AuthApi.changePassword(newPassword, currentPassword);
    setLoading(false);
    return { data, error };
  };

  const getActiveSessions = async () => {
    setLoading(true);
    const { data, error } = await AuthApi.listSessions();
    setLoading(false);
    return { data, error };
  };

  const revokeDeviceSession = async (sessionToken: string) => {
    setLoading(true);
    const { data, error } = await AuthApi.revokeSession(sessionToken);
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      await AuthStorageService.clearHybridSession(db);
      
      await SecureStore.deleteItemAsync('app_theme');
      DeviceEventEmitter.emit('onThemeChange', 'system');
      
      await AuthApi.signOut();
      
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Erro durante o logout:', error);
    } finally {
      setLoading(false);
    }
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