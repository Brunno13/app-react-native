import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AuthLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={{ animation: 'slide_from_right' }}>
      <Stack.Screen 
        name="login" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ title: t('navigation.signUp'), headerShown: false }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ title: t('navigation.forgotPassword'), headerShown: false }} 
      />
    </Stack>
  );
}