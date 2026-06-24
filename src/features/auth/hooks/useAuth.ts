import { useState } from 'react';
import { authClient } from '../../../shared/lib/auth';

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

  return { signIn, signUp, forgetPassword, signInWithSocial, loading };
};

export const useAuthFlow = () => {
  const session = authClient.useSession();
  const signOut = async () => {
    await authClient.signOut();
  };

  return {
    session: session.data,
    isPending: session.isPending,
    isAuthenticated: !!session.data,
    signOut,
  };
};