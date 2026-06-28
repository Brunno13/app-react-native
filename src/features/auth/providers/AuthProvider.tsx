import React, { createContext, useContext, ReactNode } from 'react';
import { authClient } from '@/shared/lib/auth';

interface AuthContextData {
  session: any | null; 
  isPending: boolean;
}

const AuthContext = createContext<AuthContextData>({ session: null, isPending: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending } = authClient.useSession();

  return (
    <AuthContext.Provider value={{ session, isPending }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useGlobalAuth = () => useContext(AuthContext);