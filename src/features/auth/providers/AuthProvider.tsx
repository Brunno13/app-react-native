import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { authClient } from '@/shared/lib/auth';
import { db } from '@/shared/db/client';
import { AuthRepository } from '@/shared/db/repositories/authRepository';

interface AuthContextData {
  session: any | null; 
  isPending: boolean;
}

const AuthContext = createContext<AuthContextData>({ session: null, isPending: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: serverSession, isPending: serverPending } = authClient.useSession();
  
  const [localSessionData, setLocalSessionData] = useState<any | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeOfflineAuth = async () => {
      try {
        const state = await NetInfo.fetch();
        const isOnline = state.isConnected && state.isInternetReachable !== false;

        if (!isOnline) {
          const cachedData = await AuthRepository.get(db);
          
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
              await AuthRepository.clear(db);
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
      AuthRepository.save(db, serverSession);
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