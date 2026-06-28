import React, { ReactNode } from 'react';
import { NotificationProvider } from './NotificationProvider';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NotificationProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NotificationProvider>
  );
};