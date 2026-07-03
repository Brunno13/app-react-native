import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { db } from '@/shared/db/client';
import { setUnauthorizedInterceptor } from '@/shared/api/apiClient';
import { AuthStorageService } from '../services/authStorageService';
import { AuthApi } from '../api/authApi';

interface AuthContextData {
  session: any | null; 
  isPending: boolean;
}

const AuthContext = createContext<AuthContextData>({ session: null, isPending: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data: serverSession, isPending: serverPending } = AuthApi.useSession();
  
  const [localSessionData, setLocalSessionData] = useState<any | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setUnauthorizedInterceptor(async () => {
      console.warn('⚠️ [AuthFeature] API retornou 401. Orquestrando logout...');
      
      try {
        await AuthStorageService.clearHybridSession(db);
        await AuthApi.signOut();
      } catch (error) {
        console.error('Erro ao limpar sessão local durante o 401:', error);
      } finally {
        router.replace('/(auth)/login');
      }
    });

    return () => {
      setUnauthorizedInterceptor(() => {});
    };
  }, [router]);

  useEffect(() => {
    const initializeOfflineAuth = async () => {
      try {
        const state = await NetInfo.fetch();
        const isOnline = state.isConnected && state.isInternetReachable !== false;

        if (!isOnline) {
          const cachedData = await AuthStorageService.getValidSession(db);
          
          if (cachedData && cachedData.user && cachedData.session) {
            const now = new Date();
            const expirationDate = new Date(cachedData.user.expiresAt);

            if (expirationDate > now) {
              setLocalSessionData({
                user: {
                  id: cachedData.user.userId,
                  email: cachedData.user.email,
                  name: cachedData.user.name,
                  image: cachedData.user.image,
                },
                session: cachedData.session 
              });
            } else {
              await AuthStorageService.clearHybridSession(db);
            }
          }
        }
      } catch (err) {
        console.error('Falha na inicialização do fluxo de autenticação offline:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeOfflineAuth();
  }, []);

  useEffect(() => {
    if (serverSession) {
      AuthStorageService.saveHybridSession(db, serverSession.session, serverSession.user);
      setLocalSessionData(null); 
    }
  }, [serverSession]);

  const resolvedSession = serverSession || localSessionData;
  const resolvedPending = serverPending || isInitializing;

  return (
    <AuthContext.Provider value={{ session: resolvedSession, isPending: resolvedPending }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useGlobalAuth = () => useContext(AuthContext);