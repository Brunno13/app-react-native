import { useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { db } from '@/shared/db/client';
import { AuthStorageService } from '../services/authStorageService';
import { AuthApi } from '../api/authApi';
import { useNotification } from '@/shared/providers/NotificationProvider';

const withTimeout = async <T>(
  promise: Promise<{ data: T | null; error: any }>, 
  ms: number, 
  timeoutMessage: string
) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) => {
    timeoutId = setTimeout(() => resolve({ data: null, error: { code: 'TIMEOUT', message: timeoutMessage } }), ms);
  });

  const response = await Promise.race([promise, timeoutPromise]);
  if (timeoutId) clearTimeout(timeoutId);
  return response;
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useNotification();

  const executeAction = async <T>(action: () => Promise<{ data: T | null; error: any }>) => {
    setLoading(true);
    try {
      return await action();
    } catch (err: any) {
      return { data: null, error: { code: 'UNKNOWN', message: err.message || t('alerts.unknownError') } };
    } finally {
      setLoading(false);
    }
  };

  const signIn = (email: string, password: string) => executeAction(async () => {
    const networkState = await Network.getNetworkStateAsync();
    
    if (!(networkState.isConnected && networkState.isInternetReachable)) {
      return { data: null, error: { code: 'OFFLINE', message: t('alerts.networkOfflineMessage') } };
    }

    const authPromise = AuthApi.signInWithEmail(email, password);
    return withTimeout(authPromise, 10000, t('alerts.timeoutMessage'));
  });

  const signUp = (email: string, password: string, name: string) => 
    executeAction(() => AuthApi.signUpWithEmail(email, password, name));

  const forgetPassword = (email: string) => 
    executeAction(() => AuthApi.forgetPassword(email));

  const signInWithSocial = (provider: 'google' | 'github') => 
    executeAction(() => AuthApi.signInWithSocial(provider));

  const changePassword = (newPassword: string, currentPassword: string) => 
    executeAction(() => AuthApi.changePassword(newPassword, currentPassword));

  const getActiveSessions = () => 
    executeAction(() => AuthApi.listSessions());

  const revokeDeviceSession = (sessionToken: string) => 
    executeAction(() => AuthApi.revokeSession(sessionToken));

  const updateUser = (updateData: { name?: string; image?: string }) => executeAction(async () => {
    const response = await AuthApi.updateUser(updateData);
    
    if (!response.error) {
      const freshSession = await AuthApi.getSession();
      if (freshSession.data) {
        await AuthStorageService.saveHybridSession(db, freshSession.data.session, freshSession.data.user);
      }
    }
    return response;
  });

  const signOut = () => executeAction(async () => {
    try {
      await AuthStorageService.clearHybridSession(db);
      
      await SecureStore.deleteItemAsync('app_theme');
      DeviceEventEmitter.emit('onThemeChange', 'system');
      
      await AuthApi.signOut();
      router.replace('/(auth)/login');
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Erro durante o logout:', error);
      showToast(t('alerts.error'), t('alerts.logoutFailed'), 'error');
      return { data: null, error: { code: 'LOGOUT_ERROR', message: t('alerts.logoutFailed') } };
    }
  });

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