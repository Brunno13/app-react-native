import React, { useEffect, useState, useMemo } from 'react';
import { useColorScheme, DeviceEventEmitter } from 'react-native';
import * as SecureStore from 'expo-secure-store'; 
import { SharedThemeProvider } from '@/shared/providers/ThemeProvider';

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const cachedTheme = await SecureStore.getItemAsync('app_theme');
        
        if (cachedTheme) {
          setThemePreference(cachedTheme as 'light' | 'dark' | 'system');
        }
      } catch (error) {
        console.error('Erro ao carregar tema do SecureStore:', error);
      }
    };

    loadTheme();

    const subscription = DeviceEventEmitter.addListener('onThemeChange', async (newTheme) => {
      if (newTheme) {
        setThemePreference(newTheme);
        
        if (newTheme === 'system') {
          await SecureStore.deleteItemAsync('app_theme');
        } else {
          await SecureStore.setItemAsync('app_theme', newTheme);
        }
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