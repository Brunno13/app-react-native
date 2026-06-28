import React, { ReactNode } from 'react';
import { NotificationProvider } from './NotificationProvider';
import { AuthProvider } from '@/features/auth';
import { DatabaseProvider } from './DatabaseProvider';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <DatabaseProvider>
      <NotificationProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </NotificationProvider>
    </DatabaseProvider>
  );
};