import React, { useEffect, useState, useMemo } from 'react';
// 🔥 Importamos o DeviceEventEmitter do react-native
import { useColorScheme, DeviceEventEmitter } from 'react-native';

import { SharedThemeProvider } from '@/shared/providers/ThemeProvider';
import { db } from '@/shared/db/client';
import { AuthRepository } from '@/shared/db/repositories/authRepository';
import { PreferencesRepository } from '@/shared/db/repositories/preferencesRepository';

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const loadThemeFromDB = async () => {
      try {
        const authCache = await AuthRepository.get(db);
        const userId = authCache?.user?.id || authCache?.user?.userId;

        if (userId) {
          const prefs = await PreferencesRepository.get(db, userId);
          if (prefs?.theme) {
            setThemePreference(prefs.theme as 'light' | 'dark' | 'system');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tema inicial direto do banco:', error);
      }
    };

    loadThemeFromDB();

    const subscription = DeviceEventEmitter.addListener('onThemeChange', (newTheme) => {
      if (newTheme) {
        setThemePreference(newTheme);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isDark = useMemo(() => {
    if (themePreference === 'system') {
      return systemColorScheme === 'dark';
    }
    return themePreference === 'dark';
  }, [themePreference, systemColorScheme]);

  return (
    <SharedThemeProvider isDark={isDark} themePreference={themePreference}>
      {children}
    </SharedThemeProvider>
  );
};

export default AppThemeProvider;
