import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BiometricGate, useGlobalAuth } from '@/features/auth'; 
import { usePreferences } from '@/features/profile'; 
import { useAppTheme } from '@/shared/providers/ThemeProvider';

export default function MainLayout() {
  const { t } = useTranslation();
  const { session } = useGlobalAuth();
  const { preferences, loading } = usePreferences(session?.user?.id);
  const { colors } = useAppTheme();

  return (
    <BiometricGate 
      isBiometricsEnabled={preferences?.isBiometricsEnabled ?? false} 
      loading={loading}
    >
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        
        <Stack.Screen 
          name="edit-profile" 
          options={{ title: t('navigation.editProfile'), presentation: 'card' }} 
        />
        
        <Stack.Screen 
          name="security" 
          options={{ title: t('navigation.security'), presentation: 'card' }} 
        />
      </Stack>
    </BiometricGate>
  );
}