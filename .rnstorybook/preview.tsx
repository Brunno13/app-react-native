import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import type { Preview } from '@storybook/react-native';
import { FontAwesome } from '@expo/vector-icons';

import { SharedThemeProvider, useAppTheme } from '../src/shared/providers/ThemeProvider';
import { NotificationProvider } from '../src/shared/providers/NotificationProvider';
import { useGlobalStyles } from '../src/shared/ui/globalStyles';
import '../src/shared/config/i18n';

const ThemedContainer = ({ children, toggleTheme, isDark }: { children: React.ReactNode, toggleTheme: () => void, isDark: boolean }) => {
  const { colors, spacing } = useAppTheme();
  const globalStyles = useGlobalStyles();

  return (
    <View style={globalStyles.safeArea}>
      <TouchableOpacity
        testID="storybook-theme-toggle"
        onPress={toggleTheme}
        style={{
          position: 'absolute',
          top: 120, 
          right: spacing.lg,
          zIndex: 9999,
          backgroundColor: colors.surface, 
          width: 48,
          height: 48,
          borderRadius: 24,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border, 
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <FontAwesome name={isDark ? 'moon-o' : 'sun-o'} size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
};

const StorybookThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <SharedThemeProvider isDark={isDark} themePreference={isDark ? 'dark' : 'light'}>
      <NotificationProvider>
        <ThemedContainer toggleTheme={() => setIsDark(!isDark)} isDark={isDark}>
          {children}
        </ThemedContainer>
      </NotificationProvider>
    </SharedThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
  decorators: [
    (Story) => (
      <StorybookThemeWrapper>
        <Story />
      </StorybookThemeWrapper>
    ),
  ],
};

export default preview;