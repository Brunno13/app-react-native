import React, { useEffect, useState, useMemo } from 'react';
import { useColorScheme, DeviceEventEmitter } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SharedThemeProvider } from '@/shared/providers/ThemeProvider';

type ThemePreference = 'light' | 'dark' | 'system';

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const cachedTheme = await SecureStore.getItemAsync('app_theme');

        if (isThemePreference(cachedTheme)) {
          setThemePreference(cachedTheme);
        }
      } catch (error) {
        console.error('Erro ao carregar tema do SecureStore:', error);
      }
    };

    void loadTheme();

    const subscription = DeviceEventEmitter.addListener('onThemeChange', (newTheme: unknown) => {
      if (!isThemePreference(newTheme)) {
        return;
      }

      setThemePreference(newTheme);

      if (newTheme === 'system') {
        void SecureStore.deleteItemAsync('app_theme');
      } else {
        void SecureStore.setItemAsync('app_theme', newTheme);
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