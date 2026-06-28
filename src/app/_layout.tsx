import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ErrorBoundary } from 'react-error-boundary';
import '../shared/config/i18n'; 
import { ErrorFallback } from '../shared/ui/ErrorFallback';

import { useAuthFlow } from '../features/auth/hooks/useAuth';

export default function RootLayout() {
  const { session, isPending } = useAuthFlow();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAtRoot = !segments[0]; 

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      if (isAtRoot || inAuthGroup) {
        router.replace('/(main)/(tabs)/home');
      }
    }
  }, [session, isPending, segments]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </ErrorBoundary>
  );
}