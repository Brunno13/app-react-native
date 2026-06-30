import React, { createContext, useContext } from 'react';
import { lightColors, darkColors, spacing, borderRadius, Colors } from '../ui/theme';

interface ThemeContextData {
  colors: Colors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  isDark: boolean;
  themePreference: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

interface SharedThemeProviderProps {
  children: React.ReactNode;
  isDark: boolean;
  themePreference: 'light' | 'dark' | 'system';
}

export const SharedThemeProvider = ({ children, isDark, themePreference }: SharedThemeProviderProps) => {
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, spacing, borderRadius, isDark, themePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);