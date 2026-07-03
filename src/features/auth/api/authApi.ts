import { authClient } from '@/shared/lib/auth';

export const AuthApi = {
  signInWithEmail: (email: string, password: string) => 
    authClient.signIn.email({ email, password }),
    
  signUpWithEmail: (email: string, password: string, name: string) => 
    authClient.signUp.email({ email, password, name }),
    
  forgetPassword: (email: string) => 
    (authClient as any).forgetPassword({ email, redirectTo: 'app-react-native://reset-password' }),
    
  signInWithSocial: (provider: 'google' | 'github') => 
    authClient.signIn.social({ provider }),
    
  updateUser: (updateData: { name?: string; image?: string }) => 
    authClient.updateUser(updateData),
    
  changePassword: (newPassword: string, currentPassword: string) => 
    authClient.changePassword({ newPassword, currentPassword, revokeOtherSessions: true }),
    
  listSessions: () => 
    authClient.listSessions(),
    
  revokeSession: (token: string) => 
    authClient.revokeSession({ token }),
    
  getSession: () => 
    authClient.getSession(),

  signOut: () => 
    authClient.signOut(),
};