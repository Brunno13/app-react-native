import React, { ReactNode } from 'react';

// Providers Compartilhados
import { DatabaseProvider } from '@/shared/providers/DatabaseProvider';
import { NotificationProvider } from '@/shared/providers/NotificationProvider';

// Providers Locais da Camada App
import { AppThemeProvider } from './_AppThemeProvider';

// Providers de Features
import { AuthProvider } from '@/features/auth';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <DatabaseProvider>
      <AppThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NotificationProvider>
      </AppThemeProvider>
    </DatabaseProvider>
  );
};

export default AppProvider;