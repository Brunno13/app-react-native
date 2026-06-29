import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BiometricGate, useGlobalAuth } from '@/features/auth'; 
import { usePreferences } from '@/features/profile'; 

export default function MainLayout() {
  const { t } = useTranslation();
  const { session } = useGlobalAuth();
  const { preferences, loading } = usePreferences(session?.user?.id);

  return (
    <BiometricGate 
      isBiometricsEnabled={preferences?.isBiometricsEnabled ?? false} 
      loading={loading}
    >
      <Stack>
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