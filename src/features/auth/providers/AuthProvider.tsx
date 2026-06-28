import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import * as Network from 'expo-network';
import { authClient } from '@/shared/lib/auth';
import { db } from '@/shared/db/client';
import { AuthRepository } from '@/shared/db/repositories/authRepository';

interface AuthContextData {
  session: any | null; 
  isPending: boolean;
}

const AuthContext = createContext<AuthContextData>({ session: null, isPending: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 1. Escuta nativa e reativa do Better Auth para o estado do servidor
  const { data: serverSession, isPending: serverPending } = authClient.useSession();
  
  const [localSessionData, setLocalSessionData] = useState<any | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // 2. Fluxo de Inicialização: Corre APENAS UMA VEZ quando o aplicativo abre
  useEffect(() => {
    const initializeOfflineAuth = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        const isOnline = networkState.isConnected && networkState.isInternetReachable;

        // Se estiver estritamente sem internet, recorre imediatamente ao banco local
        if (!isOnline) {
          const cachedSession = await AuthRepository.get(db);
          
          if (cachedSession) {
            const now = new Date();
            const expirationDate = new Date(cachedSession.expiresAt);

            // Valida se o token local ainda está no prazo de validade
            if (expirationDate > now) {
              setLocalSessionData({
                user: {
                  id: cachedSession.userId,
                  email: cachedSession.email,
                  name: cachedSession.name,
                  image: cachedSession.image,
                },
                session: {
                  id: cachedSession.id,
                  expiresAt: cachedSession.expiresAt,
                }
              });
            } else {
              // Token expirado no disco, limpa o registro por segurança
              await AuthRepository.clear(db);
            }
          }
        }
      } catch (err) {
        console.error('Falha na inicialização do fluxo de autenticação offline:', err);
      } finally {
        // Libera a renderização do app após checar o estado offline
        setIsInitializing(false);
      }
    };

    initializeOfflineAuth();
  }, []);

  // 3. Fluxo de Sincronização: Roda de forma isolada sempre que uma sessão online válida surgir
  useEffect(() => {
    if (serverSession) {
      AuthRepository.save(db, serverSession);
      setLocalSessionData(null); // Limpa o estado local para priorizar o servidor online
    }
  }, [serverSession]);

  // Combinamos as sessões: prioridade para o servidor, fallback para o SQLite local
  const resolvedSession = serverSession || localSessionData;
  
  // O app estará pendente se o Better Auth estiver a buscar OU se a checagem do SQLite ainda estiver a correr
  const resolvedPending = serverPending || isInitializing;

  return (
    <AuthContext.Provider value={{ session: resolvedSession, isPending: resolvedPending }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useGlobalAuth = () => useContext(AuthContext);