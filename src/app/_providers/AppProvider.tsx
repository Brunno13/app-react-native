import React, { ReactNode } from 'react';
import { DatabaseProvider } from '@/shared/providers/DatabaseProvider';
import { NotificationProvider } from '@/shared/providers/NotificationProvider';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';

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

export default AppProvider;