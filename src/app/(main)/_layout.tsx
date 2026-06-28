import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function MainLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="edit-profile" 
        options={{ title: t('navigation.editProfile'), presentation: 'card' }} 
      />
      
      <Stack.Screen 
        name="security" 
        options={{ title: t('navigation.security'), presentation: 'card' }} 
      />
    </Stack>
  );
}